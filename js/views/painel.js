// Painel: métricas, avisos e funil comercial.
import { store } from '../store.js';
import { ICON } from '../icons.js';
import { esc, brlShort, today, waLink, toast } from '../util.js';
import { alertas, statusProposta, valorPrincipal, novaProposta, mensagemProposta, mensagemContrato, registrarFollowup } from '../flow.js';
import { calcOpcao } from '../calc.js';

export function render(main) {
  const st = store.state;
  const mes = today().slice(0, 7);
  const props = st.propostas;
  const doMes = props.filter((p) => (p.data || '').startsWith(mes));
  const decididas = props.filter((p) => ['Aprovada', 'Recusada'].includes(p.status) || statusProposta(p) === 'Expirada');
  const aprovadas = props.filter((p) => p.status === 'Aprovada');
  const conversao = decididas.length ? Math.round((aprovadas.length / decididas.length) * 100) : 0;
  const ativos = st.contratos.filter((c) => c.status === 'Assinado');
  const mrr = ativos.reduce((a, c) => a + (c.mensalidadeVigente || calcOpcao(c.opcao, c.params).final), 0);
  const pipeline = props.filter((p) => ['Rascunho', 'Enviada'].includes(statusProposta(p))).reduce((a, p) => a + valorPrincipal(p).mensal, 0);
  const kickPend = ativos.filter((c) => !c.kickoffPago).reduce((a, c) => a + calcOpcao(c.opcao, c.params).kickoff, 0);
  const avisos = alertas();

  const nomeCli = (p) => { const c = st.clientes.find((x) => x.id === p.clienteId); return c?.nomeFantasia || c?.nome || p.saudacao || 'Sem cliente'; };
  const col = (titulo, list, href) => `<div class="pipe-col"><h4>${titulo}<span>${list.length}</span></h4>
    ${list.slice(0, 5).map((x) => `<a class="pipe-card" href="${href(x)}"><b>${esc(x.nome)}</b><span>${x.sub}</span></a>`).join('') || '<div class="small muted">Nada por aqui</div>'}</div>`;
  const mapP = (p) => ({ id: p.id, nome: nomeCli(p), sub: `${p.numero} · ${brlShort(valorPrincipal(p).mensal || valorPrincipal(p).unico)}` });

  main.innerHTML = `
    <div class="hero">
      <div><h2>Bora vender, <span>Fizgo!</span></h2><p>Proposta bonita, contrato pronto e tudo conversando no mesmo fluxo.</p></div>
      <div class="actions"><button class="btn btn-go" data-act="nova">${ICON.plus} Nova proposta</button><a class="btn" href="#/clientes">${ICON.users} Clientes</a></div>
    </div>
    <div class="grid g4">
      <div class="metric dark"><div class="m-ico">${ICON.wallet}</div><span>Receita recorrente</span><strong>${brlShort(mrr)}</strong><small>${ativos.length} contrato${ativos.length === 1 ? '' : 's'} assinado${ativos.length === 1 ? '' : 's'} / mês</small></div>
      <div class="metric"><div class="m-ico">${ICON.trending}</div><span>Em negociação</span><strong>${brlShort(pipeline)}</strong><small>em mensalidades abertas</small></div>
      <div class="metric"><div class="m-ico">${ICON.target}</div><span>Conversão</span><strong>${conversao}%</strong><small>${aprovadas.length} de ${decididas.length} propostas decididas</small></div>
      <div class="metric"><div class="m-ico">${ICON.file}</div><span>Propostas no mês</span><strong>${doMes.length}</strong><small>${kickPend ? `${brlShort(kickPend)} de kickoff a receber` : 'kickoffs em dia'}</small></div>
    </div>
    <div class="grid g2" style="margin-top:16px;grid-template-columns:1.1fr .9fr">
      <div class="card">
        <div class="card-h"><h3>Funil comercial</h3><a class="btn btn-ghost btn-sm" href="#/propostas">Ver todas ${ICON.arrow}</a></div>
        <div class="pipe">
          ${col('Rascunho', props.filter((p) => p.status === 'Rascunho').map(mapP), (x) => `#/proposta/${x.id}`)}
          ${col('Enviadas', props.filter((p) => ['Enviada', 'Expirada'].includes(statusProposta(p))).map(mapP), (x) => `#/proposta/${x.id}`)}
          ${col('Aprovadas', aprovadas.filter((p) => !st.contratos.find((c) => c.id === p.contratoId && c.status === 'Assinado')).map(mapP), (x) => `#/proposta/${x.id}`)}
          ${col('Clientes ativos', ativos.map((c) => ({ id: c.id, nome: c.contratante.nomeFantasia || c.contratante.nome, sub: `${c.numero} · ${brlShort(c.mensalidadeVigente || calcOpcao(c.opcao, c.params).final)}/mês` })), (x) => `#/contrato/${x.id}`)}
        </div>
      </div>
      <div class="card">
        <div class="card-h"><h3>${ICON.bell} Avisos</h3><span class="chip">${avisos.length}</span></div>
        <div class="alerts">
          ${avisos.length ? avisos.slice(0, 10).map((a, i) => `<div class="alert ${a.tipo}"><a class="a-link" href="${a.href}"><div class="a-ico">${ICON[a.ico]}</div><div><b>${esc(a.titulo)}</b><span>${esc(a.texto)}</span></div></a>${a.wa ? `<button class="btn btn-sm btn-wa" data-wa="${i}" title="Abrir WhatsApp com a mensagem pronta">${ICON.whatsapp} WhatsApp</button>` : ''}</div>`).join('')
            : `<div class="empty" style="padding:30px 10px"><div class="big">✨</div><h3>Tudo em dia</h3><p class="small">Vencimentos de propostas, contratos sem assinatura, kickoffs e renovações aparecem aqui.</p></div>`}
        </div>
      </div>
    </div>`;

  main.querySelector('[data-act="nova"]').addEventListener('click', () => { const p = novaProposta(); location.hash = `#/proposta/${p.id}`; });
  main.querySelectorAll('[data-wa]').forEach((b) => b.addEventListener('click', () => {
    const { wa } = avisos[b.dataset.wa];
    const obj = store.find(wa.tipo === 'proposta' ? 'propostas' : 'contratos', wa.id);
    const m = wa.tipo === 'proposta' ? mensagemProposta(obj, wa.msg) : mensagemContrato(obj, wa.msg);
    if (!m.tel) toast('Cliente sem WhatsApp cadastrado: escolha o contato na conversa.', 'warn');
    window.open(waLink(m.tel, m.texto), '_blank');
    if (wa.tipo === 'proposta') { registrarFollowup(obj); render(main); }
  }));
}
