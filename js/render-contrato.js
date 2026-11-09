// Monta o contrato a partir dos dados da proposta aprovada + cadastro do cliente + regras.
import { esc, inline, mdBlocks, brl, valorTxt, reaisExtenso, fmtDoc, fmtDate, dataExtenso, inteiroExtenso, numTxt, pct, num } from './util.js';
import { calcOpcao, entregaveis } from './calc.js';
import { brandLogo } from './logo.js';
import { paginate, ensureFonts } from './paginate.js';

export function enderecoTxt(c) {
  const p = [];
  if (c.logradouro) p.push(`${c.logradouro}${c.numero ? ', ' + c.numero : ''}${c.complemento ? ' - ' + c.complemento : ''}`);
  if (c.bairro) p.push(c.bairro);
  if (c.cep) p.push(`CEP ${c.cep}`);
  if (c.cidade) p.push(`${c.cidade}${c.uf ? '/' + c.uf : ''}`);
  return p.join(', ') + (p.length ? ' - Brasil' : '');
}

export function qualificacao(c) {
  const doc = fmtDoc(c.documento) || '[documento]';
  const end = enderecoTxt(c) || '[endereço]';
  if (c.tipo === 'PF') return `pessoa física, inscrita no CPF sob o nº ${doc}, residente e domiciliada na ${end}`;
  const rep = c.representante?.nome
    ? `neste ato representada por ${c.representante.nome}${c.representante.cpf ? `, inscrito(a) no CPF sob o nº ${fmtDoc(c.representante.cpf)}` : ''}`
    : 'neste ato representada na forma de seus atos constitutivos';
  return `pessoa jurídica de direito privado, inscrita no CNPJ sob o nº ${doc}, com sede na ${end}, ${rep}`;
}

export function camposFaltando(c) {
  const f = [];
  if (!c.nome) f.push('Nome / Razão social');
  if (!c.documento) f.push(c.tipo === 'PF' ? 'CPF' : 'CNPJ');
  if (!c.logradouro) f.push('Endereço');
  if (!c.cidade) f.push('Cidade');
  if (!c.cep) f.push('CEP');
  return f;
}

export function condicoes(ct) {
  const c = calcOpcao(ct.opcao, ct.params);
  return { mensal: c.temMensal, unico: c.temUnico, pontualidade: c.temMensal && c.pontualidade > 0, kickoff: c.kickoff > 0 };
}

function tabelaPlano(ct, c) {
  const op = ct.opcao;
  const bonus = (op.bonus || []).filter((b) => b.nome);
  let valor = '';
  if (c.temMensal && c.inicialMeses) valor += `<strong>${brl(c.inicialCheia)} mensais</strong> nos ${c.inicialMeses} primeiros meses${c.pontualidade ? ` <small>(${brl(c.inicialFinal)} com pontualidade)</small>` : ''}<br><br><strong>${brl(c.cheia)} mensais</strong> a partir do ${c.inicialMeses + 1}º mês${c.pontualidade ? `<br><small>(${brl(c.final)} com desconto de ${brl(c.pontualidade)} por pontualidade)</small>` : ''}`;
  else if (c.temMensal) valor += `<strong>${brl(c.cheia)} mensais</strong>${c.pontualidade ? `<br><small>(${brl(c.final)} com desconto de ${brl(c.pontualidade)} por pontualidade)</small>` : ''}`;
  if (c.temUnico) valor += `${valor ? '<br><br>' : ''}<strong>${brl(c.unicoTotal)}</strong><br><small>valor único (${pct(ct.params.entradaMaterialPct)} entrada + saldo na entrega)</small>`;
  return `<table class="ct-table"><thead><tr><th>Plano</th><th>Descrição do serviço</th><th>Valor</th></tr></thead>
    <tbody><tr><td><strong>${esc(op.nome)}</strong></td><td><ul>${entregaveis(op).map((i) => `<li>${i}</li>`).join('')}</ul>
    ${bonus.length ? `<div class="ct-bonus">Bônus inclusos, sem custo adicional: ${bonus.map((b) => esc(b.nome)).join(', ')}.</div>` : ''}</td>
    <td>${valor}</td></tr></tbody></table>`;
}

const exceto = (c, valor) => (c.inicialMeses
  ? `, exceto nos ${numTxt(c.inicialMeses)} primeiros meses de vigência, em que será de ${valorTxt(valor)}`
  : '');

export function buildVars(ct, settings) {
  const e = settings.empresa;
  const r = ct.params;
  const c = calcOpcao(ct.opcao, r);
  const k = ct.contratante;
  return {
    calc: c,
    v: {
      'contratante.nome': k.nome || '[CONTRATANTE]',
      'contratante.qualificacao': qualificacao(k),
      'contratada.nome': e.razaoSocial || e.nomeFantasia,
      'contratada.cnpj': e.cnpj,
      'contratada.endereco': `${e.logradouro} - ${e.bairro}, CEP ${e.cep}, ${e.cidade}/${e.uf}, Brasil`,
      'contratada.representante': e.representante,
      // Contrato com prestador: a Fizgo contrata e o prestador (guardado em ct.contratante) é contratado
      'fizgo.nome': e.razaoSocial || e.nomeFantasia,
      'fizgo.cnpj': e.cnpj,
      'fizgo.endereco': `${e.logradouro} - ${e.bairro}, CEP ${e.cep}, ${e.cidade}/${e.uf}, Brasil`,
      'fizgo.representante': e.representante,
      'prestador.nome': k.nome || '[PRESTADOR]',
      'prestador.qualificacao': qualificacao(k),
      tituloContrato: ct.tituloContrato,
      tipoServico: ct.tipoServico || 'marketing digital',
      origemProposta: ct.propostaNumero ? ` e na Proposta Comercial nº ${ct.propostaNumero}, que passa a integrar o presente instrumento` : '',
      dataInicio: fmtDate(ct.dataInicio),
      prazoMeses: numTxt(r.prazoMeses),
      mesesSemFidelidade: numTxt(r.mesesSemFidelidade),
      renovacaoMeses: numTxt(r.renovacaoMeses),
      avisoPrevio: numTxt(r.avisoPrevioDias),
      antecedenciaEntrega: numTxt(r.antecedenciaEntregaDias),
      aprovacaoHoras: numTxt(r.aprovacaoHoras),
      prazoMateriais: numTxt(r.prazoMateriaisDias),
      confidencialidadeAnos: numTxt(r.confidencialidadeAnos),
      rodadasAjuste: numTxt(r.rodadasAjuste),
      prazoEntrega: r.prazoEntrega || '30 (trinta) dias úteis',
      kickoffPct: `${pct(c.kickoffPct)} (${inteiroExtenso(c.kickoffPct)} por cento)`,
      kickoffBase: brl(c.kickoffBase),
      kickoffValor: valorTxt(c.kickoff),
      // Com condição de entrada, a mensalidade cheia vale a partir do mês seguinte ao período especial
      mensalidadeTxt: valorTxt(c.final) + exceto(c, c.inicialFinal),
      mensalidadeCheiaTxt: valorTxt(c.cheia) + exceto(c, c.inicialCheia),
      descontoPontualidadeTxt: valorTxt(c.pontualidade),
      diaVencimento: `${r.diaVencimento} (${inteiroExtenso(r.diaVencimento)})`,
      diaPontualidade: `${r.diaPontualidade} (${inteiroExtenso(r.diaPontualidade)})`,
      multaPct: `${pct(r.multaRescisoriaPct)} (${inteiroExtenso(r.multaRescisoriaPct)} por cento)`,
      entradaMaterialPct: `${pct(r.entradaMaterialPct)} (${inteiroExtenso(r.entradaMaterialPct)} por cento)`,
      unicoTotalTxt: valorTxt(c.unicoTotal),
      unicoEntrada: valorTxt(c.unicoEntrada),
      unicoSaldo: valorTxt(c.unicoSaldo),
      multaContaAnunciosTxt: ((c.cheia * (r.prazoMeses || 12)) + (c.unicoTotal || 0)) > 0
        ? ` (equivalente a ${valorTxt(((c.cheia * (r.prazoMeses || 12)) + (c.unicoTotal || 0)) * 0.3)})`
        : '',
      multaContaAnuncios: valorTxt(((c.cheia * (r.prazoMeses || 12)) + (c.unicoTotal || 0)) * 0.3),
      dadosPix: e.pix ? ` Os pagamentos deverão ser feitos via Pix para a chave${e.pixTipo ? ` (${e.pixTipo})` : ''} ${e.pix}${e.pixTitular ? `, de titularidade de ${e.pixTitular}` : ''}.` : '',
      foroCidade: r.foroCidade || e.cidade,
      foroEstado: r.foroEstado || e.estadoExtenso,
      plataformaAssinatura: r.plataformaAssinatura || settings.regras.plataformaAssinatura || 'de assinatura eletrônica',
    },
  };
}

export function numerarClausulas(clausulas) {
  const refs = {};
  let n = 0;
  clausulas.forEach((cl) => { if (cl.ativo) refs[cl.id] = ++n; });
  return refs;
}

const ordinal = (n) => `${n}ª`;

function fill(text, v, n, refs) {
  return String(text || '')
    .replace(/\{\{n\}\}/g, n)
    .replace(/\{\{ref:(\w+)\}\}/g, (m, id) => (refs[id] ? ordinal(refs[id]) : '[cláusula removida]'))
    .replace(/\{\{([\w.]+)\}\}/g, (m, key) => (v[key] !== undefined ? v[key] : m));
}

export function contratoBlocks(ct, settings) {
  const { v, calc } = buildVars(ct, settings);
  const refs = numerarClausulas(ct.clausulas);
  const e = settings.empresa;
  const k = ct.contratante;
  const blocks = [];
  const tabela = tabelaPlano(ct, calc);
  const push = (html, keep = false) => blocks.push({ html, keep });
  const fromText = (text, n) => mdBlocks(fill(text, v, n, refs)).forEach((b) => push(b === '[[TABELA_PLANO]]' ? `<div class="blk">${tabela}</div>` : `<div class="blk">${b}</div>`, false));

  push(`<div class="ct-title"><h1>${esc(ct.tituloContrato).toUpperCase()}</h1><span>Contrato nº ${esc(ct.numero)}${ct.propostaNumero ? ` · Ref. Proposta ${esc(ct.propostaNumero)}` : ''}</span></div>`, true);
  push('<div class="blk"><p><strong>ENTRE:</strong></p></div>', true);
  fromText(ct.preambulo, 0);

  ct.clausulas.filter((cl) => cl.ativo).forEach((cl) => {
    const n = refs[cl.id];
    push(`<h3 class="cl-h">CLÁUSULA ${ordinal(n)}: ${esc(cl.titulo)}</h3>`, true);
    fromText(cl.texto, n);
  });

  fromText(ct.fecho, 0);
  const local = `${esc(ct.cidadeAssinatura || `${e.cidade}, Estado de ${e.estadoExtenso}`)}, ${dataExtenso(ct.dataAssinatura)}.`;
  const docK = k.documento ? `${k.tipo === 'PF' ? 'CPF' : 'CNPJ'} ${fmtDoc(k.documento)}` : '';
  const prestador = ct.partes === 'prestador';
  const sigOutro = (papel) => `<div data-sig="outro"><i></i><b>${esc(k.nome || papel)}</b>${docK ? `<span>${docK}</span>` : ''}${k.tipo !== 'PF' && k.representante?.nome ? `<span>${esc(k.representante.nome)}</span>` : ''}<em>${papel}</em></div>`;
  const sigFizgo = (papel) => `<div data-sig="fizgo"><i></i><b>${esc(e.razaoSocial)}</b><span>CNPJ ${esc(e.cnpj)}</span><span>${esc(e.representante)}</span><em>${papel}</em></div>`;
  push(`<div class="ct-end"><p class="ct-local">${local}</p>
    <div class="ct-sigs">${prestador ? sigFizgo('CONTRATANTE') + sigOutro('CONTRATADA') : sigOutro('CONTRATANTE') + sigFizgo('CONTRATADA')}</div></div>`);
  const t = ct.testemunhas || [];
  push(`<div class="ct-wit"><p><strong>Testemunhas:</strong></p><div class="ct-sigs">
    ${[0, 1].map((i) => `<div data-sig="t${i}"><i></i><b>${esc(t[i]?.nome || 'Nome:')}</b><span>CPF: ${t[i]?.cpf ? fmtDoc(t[i].cpf) : ''}</span></div>`).join('')}
  </div></div>`);
  return blocks;
}

function shell(ct, settings) {
  const e = settings.empresa;
  return `<section class="page contract">
    <header class="ct-head">${brandLogo('escuro', 34)}<div><b>${esc(ct.numero)}</b><span>${esc(ct.tituloContrato)}</span></div></header>
    <div class="page-body">{{BODY}}</div>
    <footer class="ct-foot"><span>${esc(e.razaoSocial)} · CNPJ ${esc(e.cnpj)} · ${esc(e.cidade)}/${esc(e.uf)}</span><span class="rub">Rubricas: <i data-rub="outro"></i><i data-rub="fizgo"></i></span><span>Página {{PG}} de {{TOT}}</span></footer>
  </section>`;
}

export async function renderContrato(ct, state) {
  await ensureFonts();
  const sh = shell(ct, state.settings);
  const bodies = paginate(contratoBlocks(ct, state.settings), () => sh.replace('{{BODY}}', ''));
  return bodies.map((b, i) => sh.replace('{{PG}}', i + 1).replace('{{TOT}}', bodies.length).replace('{{BODY}}', () => b));
}

export { reaisExtenso };
