// Armazenamento local (IndexedDB) de todo o estado do sistema em um único documento.
import { DEFAULT_SETTINGS, DEFAULT_ITENS, DEFAULT_PLANOS, DEFAULT_ESCOPOS, DEFAULT_MODELOS, DEFAULT_SEGMENTOS, DEFAULT_COLABORADORES, DEFAULT_FUNCOES, PLANOS_ANTIGOS } from './defaults.js';
import { clone, debounce } from './util.js';

const DB_NAME = 'FizgoContratos';
const KEY = 'state';

function openDB() {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB_NAME, 1);
    r.onupgradeneeded = () => r.result.createObjectStore('kv');
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
async function idbGet(key) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const t = db.transaction('kv').objectStore('kv').get(key);
    t.onsuccess = () => res(t.result);
    t.onerror = () => rej(t.error);
  });
}
async function idbSet(key, val) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const t = db.transaction('kv', 'readwrite');
    t.objectStore('kv').put(val, key);
    t.oncomplete = () => res();
    t.onerror = () => rej(t.error);
  });
}

// Completa objetos salvos com chaves novas dos padrões (sem sobrescrever o que existe)
function fill(target, defaults) {
  for (const k of Object.keys(defaults)) {
    if (target[k] === undefined) target[k] = clone(defaults[k]);
    else if (defaults[k] && typeof defaults[k] === 'object' && !Array.isArray(defaults[k]) && typeof target[k] === 'object') fill(target[k], defaults[k]);
  }
  return target;
}

// Atualiza dados salvos por versões anteriores
function migrar(st) {
  if ((st.versao || 1) < 2) {
    // v2: cláusula de assinatura eletrônica citando a plataforma (Autentique) e ligada por padrão
    const nova = DEFAULT_MODELOS[0].clausulas.find((c) => c.id === 'assinaturaEletronica');
    st.modelos.forEach((m) => m.clausulas.forEach((c) => {
      if (c.id === 'assinaturaEletronica' && !c.texto.includes('{{plataformaAssinatura}}')) Object.assign(c, { texto: nova.texto, ativoPadrao: true, ativo: true });
    }));
    st.versao = 2;
  }
  if (st.versao < 3) {
    // v3: Pix e site da Fizgo, se ainda não preenchidos
    const e = st.settings.empresa;
    const d = DEFAULT_SETTINGS.empresa;
    if (!e.pix) Object.assign(e, { pix: d.pix, pixTipo: d.pixTipo, pixTitular: d.pixTitular });
    if (!e.site) e.site = d.site;
    st.versao = 3;
  }
  if (st.versao < 4) {
    // v4: cláusulas de autoria de campanhas, proteção de conta de anúncios com multa de 30%, direito de imagem,
    // modelos de colaborador MEI com blindagem trabalhista, sublocação de espaço e ferramentas de IA
    const novosModelos = DEFAULT_MODELOS.map(clone);
    novosModelos.forEach((nm) => {
      const idx = (st.modelos || []).findIndex((m) => m.id === nm.id);
      if (idx >= 0) st.modelos[idx] = nm;
      else st.modelos.push(nm);
    });
    st.versao = 4;
  }
  if (st.versao < 5) {
    // v5: gestão de colaboradores e prestadores (MEI/PJ), arquivamento de documentos e dossiê
    if (!st.colaboradores || !st.colaboradores.length) {
      st.colaboradores = clone(DEFAULT_COLABORADORES);
    }
    st.versao = 5;
  }
  if (st.versao < 6) {
    // v6: proposta com a identidade do site (números, selos, método e comparativo); troca só o que ainda é o texto padrão antigo
    const pf = st.settings.portfolio;
    const d = DEFAULT_SETTINGS.portfolio;
    if (!pf.numeros?.length) pf.numeros = clone(d.numeros);
    if (!st.settings.empresa.whatsapp) st.settings.empresa.whatsapp = DEFAULT_SETTINGS.empresa.whatsapp;
    if (pf.quemSomos === 'Somos a **Fizgo Digital**, agência de marketing de Três Lagoas/MS. Unimos conteúdo estratégico, gestão de redes sociais e tráfego pago para que empresas locais sejam lembradas, desejadas e escolhidas.\n\nCada cliente tem um planejamento próprio, acompanhamento de indicadores e uma equipe próxima, que fala a sua língua.') pf.quemSomos = d.quemSomos;
    st.versao = 6;
  }
  if (st.versao < 7) {
    // v7: contrato do prestador PJ (partes corretas, funções da Bíblia Operacional, SLAs e multas)
    const nm = DEFAULT_MODELOS.find((m) => m.id === 'colaborador_mei');
    const i = st.modelos.findIndex((m) => m.id === 'colaborador_mei');
    if (i >= 0) st.modelos[i] = clone(nm); else st.modelos.push(clone(nm));
    // MEI é uma PJ: o cadastro passa a usar só "PJ" e tenta reconhecer a função pelo cargo
    const pista = { account: /account|sucesso|cs\b/i, gt: /tr[aá]fego|gestor de projetos/i, designer: /design/i, copy: /copy|redator|conte[uú]do/i, editor: /edi[cç][aã]o|editor/i, captador: /capta|videomaker|fot[oó]grafo/i, ti: /\bti\b|suporte|sistemas/i, financeiro: /financ/i };
    (st.colaboradores || []).forEach((c) => {
      if (c.tipo === 'MEI') c.tipo = 'PJ';
      if (!c.funcaoId) c.funcaoId = Object.keys(pista).find((id) => pista[id].test(c.cargo || '')) || '';
    });
    st.versao = 7;
  }
  if (st.versao < 8) {
    // v8: grade de planos 2026 (Acqua, Lake, Lake Plus, River, Ocean, Avançado, Comet) e adicionais de vídeo,
    // CRM e IA. Planos antigos padrão saem do catálogo; planos criados pelo usuário e propostas já feitas ficam.
    const cat = st.catalogo;
    DEFAULT_ITENS.forEach((it) => { if (!cat.itens.some((x) => x.id === it.id)) cat.itens.push(clone(it)); });
    const proprios = cat.planos.filter((pl) => !PLANOS_ANTIGOS[pl.id] && !DEFAULT_PLANOS.some((d) => d.id === pl.id));
    cat.planos = [...clone(DEFAULT_PLANOS), ...proprios];
    (cat.segmentos || []).forEach((g) => {
      const padrao = DEFAULT_SEGMENTOS.find((d) => d.id === g.id);
      if (PLANOS_ANTIGOS[g.planoId]) g.planoId = padrao ? padrao.planoId : PLANOS_ANTIGOS[g.planoId];
    });
    st.versao = 8;
  }
  if (st.versao < 10) {
    // v10: Força sincronização de catálogo (vídeo R$ 300, arte R$ 60, perna tráfego R$ 1.390)
    // e planos com ancoragem (Lake Plus de R$ 4.120 por R$ 2.990) e modelos especializados.
    const cat = st.catalogo;
    DEFAULT_ITENS.forEach((it) => {
      const idx = (cat.itens || []).findIndex((x) => x.id === it.id);
      if (idx >= 0) cat.itens[idx] = clone(it);
      else (cat.itens ||= []).push(clone(it));
    });
    DEFAULT_PLANOS.forEach((pl) => {
      const idx = (cat.planos || []).findIndex((x) => x.id === pl.id);
      if (idx >= 0) cat.planos[idx] = clone(pl);
      else (cat.planos ||= []).push(clone(pl));
    });
    DEFAULT_MODELOS.forEach((nm) => {
      const idx = (st.modelos || []).findIndex((m) => m.id === nm.id);
      if (idx >= 0) st.modelos[idx] = clone(nm);
      else (st.modelos ||= []).push(clone(nm));
    });
    st.versao = 10;
  }
  if (st.versao < 11) {
    // v11: Lake (6 artes, 2 vídeos, tráfego) passa a R$ 2.590 de tabela, vendido por R$ 2.090
    const lake = (st.catalogo.planos || []).find((pl) => pl.id === 'pl_lake');
    const padrao = DEFAULT_PLANOS.find((pl) => pl.id === 'pl_lake');
    if (lake && padrao) { lake.valorTabela = padrao.valorTabela; lake.desconto = clone(padrao.desconto); lake.precoModo = 'fixo'; }
    // Textos revisados: troca só o que ainda é o padrão antigo ou cita a V4 (concorrente)
    const D = DEFAULT_SETTINGS;
    const velhos = {
      introTitulo: 'Temos um orçamento disponível para você\ne aposto que você irá gostar',
      intro: 'Este orçamento apresenta uma prévia estimativa de valores para **realização do seu projeto**. Uma reunião de Onboarding e análise de indicadores é necessária para melhor entendimento do seu projeto.',
      processoTitulo: 'Antes de passar o orçamento,\ngostaria que você conhecesse o processo após o fechamento!',
      envio: 'Olá, {nome}! Tudo bem? 😊\n\nPreparamos a sua proposta *{numero}* com muito carinho. Ela é válida até {validade}.\n\nVou te enviar o PDF aqui. Qualquer dúvida, estou à disposição!\n\n{empresa} — {slogan}',
    };
    const trocar = (obj, k, novo) => { if (obj && typeof obj[k] === 'string' && (obj[k] === velhos[k] || /V4/.test(obj[k]))) obj[k] = novo; };
    const pr = st.settings.proposta;
    ['introTitulo', 'intro', 'processoTitulo'].forEach((k) => trocar(pr, k, D.proposta[k]));
    if ((pr.etapas || [])[0]?.texto === 'Proposta de orçamento enviada!') pr.etapas = clone(D.proposta.etapas);
    trocar(st.settings.mensagens, 'envio', D.mensagens.envio);
    const pf = st.settings.portfolio;
    trocar(pf, 'quemSomos', D.portfolio.quemSomos);
    trocar(pf, 'metodoTexto', D.portfolio.metodoTexto);
    (pf.diferenciais?.linhas || []).forEach((l) => { if (/V4/.test(l.nos || '')) l.nos = l.nos.replace(/\s*\(?V4 Style\)?/g, '').trim(); });
    (st.settings.avisos || []).forEach((a) => { const pad = D.avisos.find((x) => x.id === a.id); if (pad && /V4/.test(a.texto)) a.texto = pad.texto; });
    (st.catalogo.planos || []).forEach((pl) => { const pad = DEFAULT_PLANOS.find((x) => x.id === pl.id); if (pad && /V4/.test(pl.nome)) pl.nome = pad.nome; });
    (st.modelos || []).forEach((m) => { const pad = DEFAULT_MODELOS.find((x) => x.id === m.id); if (pad && /V4/.test(m.nome)) m.nome = pad.nome; });
    st.versao = 11;
  }
  if (st.versao < 12) {
    // v12: contrato não traz mais a tabela de preços dos extras; demandas extras são orçadas à parte
    const semPreco = (c) => {
      if (c.id !== 'servicos' || !/tabela vigente da \*\*CONTRATADA\*\*:/.test(c.texto)) return;
      c.texto = c.texto.replace(/que serão faturadas de acordo com a tabela vigente da \*\*CONTRATADA\*\*:\n(?:- .*\n?)+/,
        'que serão orçadas à parte e só executadas após a aprovação prévia, por escrito, do orçamento pela **CONTRATANTE**.\n');
    };
    (st.modelos || []).forEach((m) => (m.clausulas || []).forEach(semPreco));
    (st.contratos || []).filter((ct) => ct.status === 'Rascunho').forEach((ct) => (ct.clausulas || []).forEach(semPreco));
    st.versao = 12;
  }
  return st;
}

export function freshState() {
  return {
    versao: 12,
    settings: clone(DEFAULT_SETTINGS),
    catalogo: { itens: clone(DEFAULT_ITENS), planos: clone(DEFAULT_PLANOS), escopos: clone(DEFAULT_ESCOPOS), segmentos: clone(DEFAULT_SEGMENTOS), funcoes: clone(DEFAULT_FUNCOES) },
    modelos: clone(DEFAULT_MODELOS),
    clientes: [],
    colaboradores: clone(DEFAULT_COLABORADORES),
    propostas: [],
    contratos: [],
  };
}

const listeners = new Set();

export const store = {
  state: null,
  saving: false,

  async load() {
    let s = null;
    try { s = await idbGet(KEY); } catch (e) { console.warn('IndexedDB indisponível', e); }
    this.state = s ? migrar(fill(s, freshState())) : freshState();
    if (!s) await this.saveNow();
    return this.state;
  },

  async saveNow() {
    try { await idbSet(KEY, this.state); } catch (e) { console.error('Falha ao salvar', e); }
    listeners.forEach((fn) => fn('saved'));
  },

  save: null, // definido abaixo (debounce)

  onSave(fn) { listeners.add(fn); return () => listeners.delete(fn); },

  replace(newState) {
    this.state = fill(newState, freshState());
    return this.saveNow();
  },

  // Helpers de coleções
  find(col, id) { return this.state[col].find((x) => x.id === id); },
  upsert(col, item) {
    const arr = this.state[col];
    const i = arr.findIndex((x) => x.id === item.id);
    if (i >= 0) arr[i] = item; else arr.unshift(item);
    this.save();
    return item;
  },
  remove(col, id) {
    this.state[col] = this.state[col].filter((x) => x.id !== id);
    this.save();
  },

  nextNumero(col, prefixo) {
    const ano = new Date().getFullYear();
    const re = new RegExp(`^${prefixo}-${ano}-(\\d+)$`);
    const max = this.state[col].reduce((m, x) => { const r = re.exec(x.numero || ''); return r ? Math.max(m, Number(r[1])) : m; }, 0);
    return `${prefixo}-${ano}-${String(max + 1).padStart(3, '0')}`;
  },
};

store.save = debounce(() => store.saveNow(), 400);
