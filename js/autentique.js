// Integração com o Autentique (assinatura eletrônica), via servidor local (server.py),
// porque a API não aceita chamadas direto do navegador.
import { store } from './store.js';
import { slug, onlyDigits, today } from './util.js';
import { renderContrato } from './render-contrato.js';
import { pdfComAssinaturas } from './pdf.js';

const API = '/api/autentique/graphql';

export const autentiqueAtivo = () => !!store.state.settings.autentique?.token;

// O app precisa estar aberto pelo server.py (e não pelo "python3 -m http.server")
export async function servidorDisponivel() {
  try { return (await fetch('/api/ping', { cache: 'no-store' })).ok; } catch { return false; }
}

async function chamar(body, contentType) {
  const headers = { 'X-Autentique-Token': store.state.settings.autentique.token };
  if (contentType) headers['Content-Type'] = contentType;
  let r;
  try { r = await fetch(API, { method: 'POST', headers, body }); } catch { throw new Error('Servidor local fora do ar. Abra o sistema com "python3 server.py".'); }
  if (r.status === 404 || r.status === 501) throw new Error('Abra o sistema com "python3 server.py" para usar o Autentique.');
  const txt = await r.text();
  let j;
  try { j = JSON.parse(txt); } catch { throw new Error(r.status === 401 ? 'Token do Autentique inválido.' : `Autentique respondeu ${r.status}.`); }
  if (j.errors?.length) {
    const m = j.errors[0].message;
    const traduz = { unauthorized: 'Token do Autentique inválido ou expirado.', unavailable_credits: 'Acabaram os créditos de documentos no Autentique.', document_not_found: 'Documento não encontrado no Autentique.', validation: 'O Autentique recusou os dados: ' + JSON.stringify(j.errors[0].extensions?.validation || '') };
    throw new Error(traduz[m] || m);
  }
  if (r.status === 401) throw new Error('Token do Autentique inválido.');
  return j.data;
}
const gql = (query, variables = {}) => chamar(JSON.stringify({ query, variables }), 'application/json');

export async function testarConexao() {
  const d = await gql('{ me { name email } }');
  return d.me;
}

// Quem assina: contratante (e-mail ou WhatsApp), Fizgo e testemunhas com e-mail
export function signatariosAutentique(ct) {
  const st = store.state;
  const k = ct.contratante;
  const e = st.settings.empresa;
  const nomeK = k.tipo === 'PF' ? k.nome : (k.representante?.nome || k.nome);
  const lista = [];
  const tel = onlyDigits(k.whatsapp);
  // No contrato do prestador PJ, a outra parte é a CONTRATADA e a Fizgo é a CONTRATANTE
  const pj = ct.partes === 'prestador';
  const papelK = pj ? 'Contratada (prestador)' : 'Contratante';
  // Padrão: o Autentique gera o link e você manda pelo WhatsApp
  if ((st.settings.autentique.envioCliente || 'link') === 'link') lista.push(nomeK ? { lugar: 'outro', papel: papelK, nome: nomeK, via: 'link no WhatsApp', signer: { name: nomeK, delivery_method: 'DELIVERY_METHOD_LINK', action: 'SIGN' } } : { papel: papelK, nome: '', faltando: 'nome do contratante' });
  else if (st.settings.autentique.envioCliente === 'email' && k.email) lista.push({ lugar: 'outro', papel: papelK, nome: nomeK, signer: { email: k.email.trim(), action: 'SIGN' } });
  else if (tel.length >= 10) lista.push({ lugar: 'outro', papel: papelK, nome: nomeK, via: 'WhatsApp', signer: { phone: `+55${tel.slice(-11)}`, delivery_method: 'DELIVERY_METHOD_WHATSAPP', action: 'SIGN' } });
  else if (k.email) lista.push({ lugar: 'outro', papel: papelK, nome: nomeK, signer: { email: k.email.trim(), action: 'SIGN' } });
  else lista.push({ papel: papelK, nome: nomeK, faltando: 'e-mail ou WhatsApp do contratante' });
  if (e.email) lista.push({ lugar: 'fizgo', papel: pj ? 'Contratante (Fizgo)' : 'Contratada (Fizgo)', nome: e.representante, signer: { email: e.email.trim(), action: 'SIGN' } });
  (ct.testemunhas || []).forEach((t, i) => t.nome && t.email && lista.push({ lugar: `t${i}`, papel: 'Testemunha', nome: t.nome, signer: { email: t.email.trim(), action: 'SIGN_AS_A_WITNESS' } }));
  return lista;
}

const CAMPOS_DOC = `id name created_at files { original signed }
  signatures { public_id name email action { name } link { short_link } user { name email phone } viewed { created_at } signed { created_at } rejected { created_at reason } }`;

export async function enviarContrato(ct) {
  const st = store.state;
  const cfg = st.settings.autentique;
  const sig = signatariosAutentique(ct);
  const falta = sig.find((s) => s.faltando);
  if (falta) throw new Error(`Falta ${falta.faltando}. Preencha na aba Contratante.`);
  const nomeCli = ct.contratante.nomeFantasia || ct.contratante.nome || 'CLIENTE';
  const nome = `[${slug(nomeCli).toUpperCase()}] CONTRATO ${ct.numero}`;
  const pages = await renderContrato(ct, st);
  const { blob, posicoes } = await pdfComAssinaturas(pages, 'Enviando para o Autentique…');
  if (blob.size > 5 * 1024 * 1024) throw new Error('O PDF passou de 5 MB (limite do plano gratuito do Autentique).');

  const query = `mutation CreateDocumentMutation($document: DocumentInput!, $signers: [SignerInput!]!, $file: Upload!) {
    createDocument(${cfg.sandbox ? 'sandbox: true, ' : ''}document: $document, signers: $signers, file: $file) { ${CAMPOS_DOC} } }`;
  const document = { name: nome, refusable: true, footer: 'BOTTOM' };
  if (cfg.mensagem) document.message = cfg.mensagem;
  if (cfg.lembrete) document.reminder = cfg.lembrete;
  const form = new FormData();
  form.append('operations', JSON.stringify({ query, variables: { document, signers: sig.map((s) => comPosicao(s, posicoes)), file: null } }));
  form.append('map', JSON.stringify({ file: ['variables.file'] }));
  form.append('file', blob, `${nome}.pdf`);
  const d = await chamar(form);
  const doc = d.createDocument;
  ct.autentique = { id: doc.id, nome: doc.name, sandbox: !!cfg.sandbox, enviadoEm: new Date().toISOString(), verificadoEm: new Date().toISOString(), assinaturas: resumo(doc), arquivos: doc.files || {} };
  ct.autentique.linkCliente = linkDoCliente(ct, sig[0].nome);
  if (ct.status === 'Rascunho') ct.status = 'Enviado';
  ct.enviadoEm ||= ct.autentique.enviadoEm;
  store.upsert('contratos', ct);
  return ct;
}

// Carimba a assinatura logo acima da linha de cada um (sem isso, o Autentique põe tudo no fim)
function comPosicao(s, posicoes) {
  const p = posicoes[s.lugar];
  if (!p) return s.signer;
  const pos = (x, y, z, element) => ({ x: x.toFixed(2), y: Math.max(0, y).toFixed(2), z, element });
  // O Autentique posiciona pelo canto esquerdo; a assinatura ocupa cerca de 20% da largura
  const positions = [pos(p.x - 10, p.y - 4.2, p.pagina, 'SIGNATURE')];
  // Rubrica no rodapé de cada página: 1º traço da outra parte, 2º da Fizgo
  (posicoes[`rub-${s.lugar}`] || []).forEach((r) => positions.push(pos(r.x, r.y - 1.6, r.pagina, 'INITIALS')));
  return { ...s.signer, positions };
}

// Link de assinatura do contratante (para mandar no WhatsApp)
function linkDoCliente(ct, nome) {
  const ass = ct.autentique.assinaturas;
  const fizgo = (store.state.settings.empresa.email || '').toLowerCase();
  return (ass.find((s) => s.link && s.nome === nome) || ass.find((s) => s.link && s.email.toLowerCase() !== fizgo))?.link || '';
}

function resumo(doc) {
  // O dono da conta aparece na lista sem ação (não assina): fica de fora
  return (doc.signatures || []).filter((s) => s.action?.name).map((s) => ({
    nome: s.name || s.user?.name || '', email: s.email || s.user?.email || s.user?.phone || '', acao: s.action?.name || '',
    link: s.link?.short_link || '', visualizou: s.viewed?.created_at || '', assinou: s.signed?.created_at || '',
    recusou: s.rejected?.created_at || '', motivo: s.rejected?.reason || '',
  }));
}

// Consulta o documento; quando todos assinaram, marca o contrato como Assinado e guarda a via assinada
export async function atualizarStatus(ct) {
  if (!ct.autentique?.id) return ct;
  const d = await gql(`query ($id: UUID!) { document(id: $id) { ${CAMPOS_DOC} } }`, { id: ct.autentique.id });
  const doc = d.document;
  const antes = ct.autentique.assinaturas || [];
  ct.autentique.assinaturas = resumo(doc);
  ct.autentique.arquivos = doc.files || {};
  ct.autentique.verificadoEm = new Date().toISOString();
  ct.autentique.linkCliente ||= linkDoCliente(ct, signatariosAutentique(ct)[0].nome);
  const ass = ct.autentique.assinaturas;
  const todos = ass.length && ass.every((s) => s.assinou);
  ct.autentique.recusado = ass.some((s) => s.recusou);
  // Novidades desde a última consulta, para avisar (assinou / recusou)
  const novo = (campo) => ass.filter((s) => s[campo] && !antes.some((x) => x.nome === s.nome && x[campo]));
  ct.autentique.novidades = [...novo('assinou').map((s) => ({ tipo: 'assinou', nome: s.nome })), ...novo('recusou').map((s) => ({ tipo: 'recusou', nome: s.nome }))];
  if (todos && ct.status !== 'Assinado' && ct.status !== 'Encerrado') {
    ct.status = 'Assinado';
    ct.assinadoEm = ass.map((s) => s.assinou).sort().pop() || new Date().toISOString();
    ct.dataAssinatura = ct.assinadoEm.slice(0, 10) || today();
    ct.autentique.concluidoAgora = true;
  }
  if (todos && doc.files?.signed && !ct.arquivoAssinado) {
    try {
      const r = await fetch(`/api/autentique/arquivo?url=${encodeURIComponent(doc.files.signed)}`, { headers: { 'X-Autentique-Token': store.state.settings.autentique.token } });
      if (r.ok && (r.headers.get('Content-Type') || '').includes('pdf')) {
        const b = await r.blob();
        const data = await new Promise((res) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(b); });
        ct.arquivoAssinado = { nome: `${ct.autentique.nome || ct.numero} (assinado).pdf`, tipo: 'application/pdf', data };
      }
    } catch { /* fica o link do Autentique */ }
  }
  store.upsert('contratos', ct);
  return ct;
}

// Verifica os contratos enviados ainda sem assinatura (no máximo a cada 10 minutos cada)
export async function sincronizarPendentes() {
  if (!autentiqueAtivo()) return [];
  const agora = Date.now();
  const pend = store.state.contratos.filter((c) => c.autentique?.id && c.status === 'Enviado' && !c.autentique.recusado && agora - new Date(c.autentique.verificadoEm || 0).getTime() > 10 * 60 * 1000);
  const avisos = [];
  for (const ct of pend.slice(0, 20)) {
    try {
      await atualizarStatus(ct);
      const nome = ct.contratante.nomeFantasia || ct.contratante.nome;
      if (ct.autentique.concluidoAgora) { delete ct.autentique.concluidoAgora; avisos.push({ ct, tipo: 'ok', texto: `${nome} assinou o contrato ${ct.numero}! 🎉` }); continue; }
      (ct.autentique.novidades || []).forEach((n) => avisos.push(n.tipo === 'recusou'
        ? { ct, tipo: 'err', texto: `${n.nome} recusou o contrato ${ct.numero}. Veja o motivo.` }
        : { ct, tipo: 'ok', texto: `${n.nome} assinou o contrato ${ct.numero}. ${faltaFizgo(ct) ? 'Falta a sua assinatura.' : 'Falta a outra parte.'}` }));
    } catch (e) { console.warn('Autentique:', e.message); break; }
  }
  return avisos;
}

// A Fizgo ainda não assinou (o cliente já assinou ou não)
export function faltaFizgo(ct) {
  const fizgo = (store.state.settings.empresa.email || '').toLowerCase();
  return (ct.autentique?.assinaturas || []).some((s) => s.email.toLowerCase() === fizgo && !s.assinou);
}

export async function cancelarEnvio(ct) {
  if (!ct.autentique?.id) return;
  await gql('mutation ($id: UUID!) { deleteDocument(id: $id) }', { id: ct.autentique.id });
  ct.autentique = null;
  if (ct.status === 'Enviado') ct.status = 'Rascunho';
  store.upsert('contratos', ct);
}

export const linkPainel = (ct) => `https://painel.autentique.com.br/documentos/${ct.autentique?.id}`;
