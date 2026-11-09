// Inicialização, navegação lateral e roteamento por hash.
import { store } from './store.js';
import { ICON } from './icons.js';
import { brandLogo } from './logo.js';
import { ensureFonts } from './paginate.js';
import { alertas } from './flow.js';
import { sincronizarPendentes } from './autentique.js';
import { toast } from './util.js';
import * as Painel from './views/painel.js';
import * as Propostas from './views/propostas.js';
import * as PropostaEditor from './views/proposta-editor.js';
import * as Contratos from './views/contratos.js';
import * as ContratoEditor from './views/contrato-editor.js';
import * as Clientes from './views/clientes.js';
import * as Colaboradores from './views/colaboradores.js';
import * as Catalogo from './views/catalogo.js';
import * as Calculadoras from './views/calculadoras.js';
import * as Config from './views/config.js';
import * as Portfolio from './views/portfolio.js';
import * as Extras from './views/extras.js';

const ROUTES = {
  painel: Painel, propostas: Propostas, proposta: PropostaEditor, contratos: Contratos, contrato: ContratoEditor,
  colaboradores: Colaboradores,
  clientes: Clientes, catalogo: Catalogo, portfolio: Portfolio, calculadoras: Calculadoras, extras: Extras, config: Config,
};

const NAV = [
  ['sec', 'Comercial'],
  ['painel', 'Painel', 'home'],
  ['propostas', 'Propostas', 'file', () => store.state.propostas.filter((p) => ['Rascunho', 'Enviada'].includes(p.status)).length],
  ['contratos', 'Contratos', 'sign', () => store.state.contratos.filter((c) => c.status !== 'Assinado' && c.status !== 'Encerrado').length],
  ['clientes', 'Clientes', 'users'],
  ['sec', 'Equipe & Prestadores'],
  ['colaboradores', 'Colaboradores & PJ', 'users', () => store.state.colaboradores?.filter((c) => c.status === 'Ativo').length],
  ['sec', 'Ferramentas'],
  ['catalogo', 'Serviços & planos', 'box'],
  ['extras', 'Tabela de extras', 'tag'],
  ['portfolio', 'Portfólio', 'award'],
  ['calculadoras', 'Calculadoras', 'calc'],
  ['config', 'Configurações', 'settings'],
];

let current = null;

function renderNav(active) {
  const nav = document.getElementById('side-nav');
  const parent = { proposta: 'propostas', contrato: 'contratos' }[active] || active;
  nav.innerHTML = NAV.map(([id, label, ico, count]) => {
    if (id === 'sec') return `<div class="sec">${label}</div>`;
    const n = count ? count() : 0;
    return `<a href="#/${id}" class="${parent === id ? 'on' : ''}">${ICON[ico]}<span>${label}</span>${n ? `<span class="badge">${n}</span>` : ''}</a>`;
  }).join('');
}

export function refreshChrome() {
  document.getElementById('side-logo').innerHTML = brandLogo('claro', 44);
  renderNav(location.hash.replace(/^#\//, '').split('/')[0] || 'painel');
}

async function route() {
  const [name, ...args] = location.hash.replace(/^#\/?/, '').split('/');
  const key = ROUTES[name] ? name : 'painel';
  if (current?.unmount) current.unmount();
  current = ROUTES[key];
  renderNav(key);
  // Novo elemento a cada rota: descarta os listeners da tela anterior
  const old = document.getElementById('main');
  const main = old.cloneNode(false);
  old.replaceWith(main);
  window.scrollTo(0, 0);
  await current.render(main, ...args);
}

async function boot() {
  await store.load();
  const saveEl = document.getElementById('save-state');
  store.onSave(() => { saveEl.textContent = 'Tudo salvo'; saveEl.classList.remove('busy'); renderNav((location.hash.replace(/^#\//, '').split('/')[0]) || 'painel'); });
  const origSave = store.save;
  store.save = (...a) => { saveEl.textContent = 'Salvando…'; saveEl.classList.add('busy'); return origSave(...a); };
  refreshChrome();
  ensureFonts();
  window.addEventListener('hashchange', route);
  if (!location.hash) location.hash = '#/painel';
  else route();
  window.FZ = { store, alertas };
  // Confere no Autentique os contratos enviados (ao abrir e a cada 15 minutos)
  const sync = async () => {
    const avisos = await sincronizarPendentes();
    avisos.forEach((a) => toast(a.texto, a.tipo, 8000));
    if (avisos.length && ['painel', 'contratos'].includes(location.hash.replace(/^#\//, '').split('/')[0])) route();
  };
  sync();
  setInterval(sync, 15 * 60 * 1000);
}

boot();
