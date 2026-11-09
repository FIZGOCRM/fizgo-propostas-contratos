// Modal "Aprovar e gerar contrato": escolhe a opção aprovada, completa os dados do cliente
// que o contrato exige e gera o contrato já preenchido.
import { store } from '../store.js';
import { modal, bind, field, inp } from '../ui.js';
import { esc, brlShort, today, toast, uid } from '../util.js';
import { calcOpcao } from '../calc.js';
import { camposFaltando } from '../render-contrato.js';
import { gerarContrato } from '../flow.js';
import { clienteForm, wireClienteForm, novoCliente } from './clientes.js';

export function abrirAprovacao(propostaId) {
  const p = store.find('propostas', propostaId);
  if (!p || document.querySelector('.modal-bg')) return;
  if (p.contratoId && store.find('contratos', p.contratoId)) {
    location.hash = `#/contrato/${p.contratoId}`;
    return;
  }
  const regras = store.state.settings.regras;
  let cli = store.find('clientes', p.clienteId);
  const draft = cli ? JSON.parse(JSON.stringify(cli)) : novoCliente();
  const escolhida = (p.opcoes.find((o) => o.recomendado) || p.opcoes[0])?.id;
  const ctx = { opcaoId: escolhida, dataInicio: today() };

  const body = `<div id="ctx">
    <div class="sec">
      <div class="sec-h"><h3>1. Qual opção o cliente aprovou?</h3></div>
      <div class="pick">${p.opcoes.map((o) => {
        const c = calcOpcao(o, regras);
        return `<label><input type="radio" name="op" value="${o.id}" data-bind="opcaoId"><div class="pk-main"><b>${esc(o.nome)}</b><div class="small muted">${o.itens.length} serviços${c.kickoff ? ` · kickoff ${brlShort(c.kickoff)}` : ''}${c.unicoTotal ? ` · entrega única ${brlShort(c.unicoTotal)}` : ''}</div></div><div class="pk-price">${c.temMensal ? `${brlShort(c.final)}<span class="small muted">/mês</span>` : brlShort(c.unicoTotal)}</div></label>`;
      }).join('')}</div>
    </div>
    <div class="sec">
      <div class="sec-h"><h3>2. Início dos serviços</h3></div>
      <div class="fgrid">${field('Data de início', inp('dataInicio', 'type="date"'), 'c6')}</div>
    </div></div>
    <div class="sec">
      <div class="sec-h"><div><h3>3. Dados do contratante</h3><p>O que faltar aqui fica salvo no cadastro do cliente.</p></div></div>
      <div id="miss"></div>
      <div id="cli-form">${clienteForm()}</div>
    </div>`;

  const m = modal({
    title: `Aprovar ${esc(p.numero)} e gerar contrato`, size: 'lg', body,
    footer: `<button class="btn" data-close>Cancelar</button><button class="btn btn-go" data-ok>Gerar contrato</button>`,
  });
  bind(m.el.querySelector('#ctx'), ctx);
  const cf = m.el.querySelector('#cli-form');
  const missEl = m.el.querySelector('#miss');
  const showMiss = () => {
    const f = camposFaltando(draft);
    missEl.innerHTML = f.length ? `<div class="note" style="margin-bottom:12px">Faltam para o contrato: <b>${f.join(', ')}</b>. Você pode gerar mesmo assim e completar depois.</div>` : '<div class="note ok" style="margin-bottom:12px">Dados completos para o contrato.</div>';
  };
  wireClienteForm(cf, draft, showMiss);
  showMiss();

  m.el.querySelector('[data-ok]').addEventListener('click', () => {
    if (!draft.nome) { toast('Informe ao menos o nome / razão social do cliente.', 'err'); return; }
    if (!draft.id) draft.id = uid('cli');
    store.upsert('clientes', draft);
    p.clienteId = draft.id;
    const ct = gerarContrato(p.id, ctx.opcaoId, { dataInicio: ctx.dataInicio });
    m.close();
    if (window.confetti) window.confetti({ particleCount: 140, spread: 80, origin: { y: 0.65 }, colors: ['#00F07A', '#233C42', '#ffffff'] });
    toast(`Proposta aprovada! Contrato ${ct.numero} gerado.`);
    location.hash = `#/contrato/${ct.id}`;
  });
}
