// Editor de proposta: formulário em etapas + calculadora de planos + pré-visualização ao vivo.
import { store } from '../store.js';
import { ICON } from '../icons.js';
import { esc, brl, brlShort, pct, uid, clone, debounce, addDays, fmtDate, toast, slug, num, waLink } from '../util.js';
import { bind, field, inp, money, numIn, sw, statusChip, confirmDialog } from '../ui.js';
import { calcOpcao, calcProjecao, textoAviso } from '../calc.js';
import { renderProposta } from '../render-proposta.js';
import { exportPDF, printPages, enviarPDFWhatsApp } from '../pdf.js';
import { itemDoCatalogo, novaOpcao, opcaoDoPlano, statusProposta, aplicarSegmento, casesDaProposta, mensagemProposta, registrarFollowup } from '../flow.js';
import { abrirAprovacao } from './aprovar.js';
import { abrirCliente } from './clientes.js';

const TABS = [['cliente', 'Cliente'], ['planos', 'Planos & valores'], ['estrategia', 'Estratégia'], ['conteudo', 'Conteúdo'], ['revisar', 'Revisar & enviar']];

let cleanup = null;
export function unmount() { cleanup && cleanup(); cleanup = null; }

export function render(main, id) {
  const p = store.find('propostas', id);
  if (!p) { main.innerHTML = `<div class="empty"><h3>Proposta não encontrada</h3><a class="btn" href="#/propostas">Voltar</a></div>`; return; }
  const st = store.state;
  const regras = st.settings.regras;
  // Propostas criadas antes destas opções existirem
  p.paginas ||= { quemSomos: true, resultados: true };
  if (p.paginas.metodo === undefined) p.paginas.metodo = true;
  p.casesIds ||= [];
  p.followups ||= [];
  let tab = 'cliente';
  let opIdx = Math.max(0, p.opcoes.findIndex((o) => o.recomendado));
  let zoom = null;
  let pages = [];

  main.innerHTML = `
  <div class="editor">
    <div class="ed-left">
      <div class="ed-head">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
          <a class="crumb" href="#/propostas" style="margin:0">${ICON.back} Propostas</a>
          <button class="btn btn-sm btn-ghost btn-danger" data-act="excluir" title="Excluir este rascunho / proposta">${ICON.trash} Excluir</button>
        </div>
        <div class="ed-title"><h1 class="mono">${esc(p.numero)}</h1><span id="st-chip"></span></div>
        <div class="tabs" id="tabs">${TABS.map(([k, l], i) => `<button data-tab="${k}"><span class="n">${i + 1}</span>${l}</button>`).join('')}</div>
      </div>
      <div class="ed-body" id="tab"></div>
      <div class="ed-foot"><button class="btn btn-ghost" data-nav="-1">${ICON.back} Anterior</button><button class="btn btn-dark" data-nav="1">Próximo ${ICON.arrow}</button></div>
    </div>
    <div class="ed-right">
      <div class="pv-bar">
        <div class="pv-zoom"><button class="btn btn-sm btn-icon" data-z="-1">${ICON.minus}</button><span id="zv">100%</span><button class="btn btn-sm btn-icon" data-z="1">${ICON.plus}</button><span id="pgc" style="margin-left:8px"></span></div>
        <div class="actions">
          <button class="btn btn-sm" data-act="print">${ICON.printer} Imprimir</button>
          <button class="btn btn-sm" data-act="pdf">${ICON.download} Baixar PDF</button>
          <button class="btn btn-sm btn-go" data-act="aprovar">${ICON.sign} Aprovar → Contrato</button>
          <button class="btn btn-sm btn-danger" data-act="excluir" title="Excluir este rascunho / proposta">${ICON.trash} Excluir</button>
        </div>
      </div>
      <div class="pv" id="pv"><div class="pv-loading">Montando a proposta…</div></div>
    </div>
  </div>`;

  const tabEl = main.querySelector('#tab');
  const pv = main.querySelector('#pv');

  const fitZoom = () => Math.min(1, Math.max(0.35, (pv.clientWidth - 48) / 794));
  const preview = debounce(async () => {
    pages = await renderProposta(p, store.state);
    if (zoom == null) zoom = fitZoom();
    const sc = pv.scrollTop;
    pv.innerHTML = `<div class="fz-doc" style="zoom:${zoom}">${pages.join('')}</div>`;
    pv.scrollTop = sc;
    main.querySelector('#zv').textContent = `${Math.round(zoom * 100)}%`;
    main.querySelector('#pgc').textContent = `${pages.length} páginas`;
  }, 220);

  const changed = () => {
    p.atualizadoEm = new Date().toISOString();
    store.upsert('propostas', p);
    main.querySelector('#st-chip').innerHTML = statusChip(statusProposta(p));
    preview();
  };

  // ---------------------------------------------------------------- Aba Cliente
  function tabCliente() {
    const opts = st.clientes.map((c) => `<option value="${c.id}">${esc(c.nomeFantasia || c.nome)}</option>`).join('');
    tabEl.innerHTML = `
      <div class="sec"><div class="sec-h"><div><h3>${ICON.users} Para quem é a proposta?</h3><p>Os dados do cliente vão direto para o contrato depois.</p></div></div>
        <div class="fgrid">
          <div class="field c12"><label>Cliente</label><div class="in-group"><select class="in" data-bind="clienteId"><option value="">— selecione —</option>${opts}</select>
            <button class="btn" data-act="edit-cli" title="Editar cliente">${ICON.pen}</button><button class="btn btn-dark" data-act="new-cli">${ICON.plus} Novo</button></div></div>
          ${field('Saudação ("Olá, …")', inp('saudacao', 'placeholder="Ex.: Karol"'), 'c12', 'Como o cliente gosta de ser chamado.')}
          ${field('Título da proposta', inp('titulo', 'placeholder="Ex.: Plano de marketing digital 2026"'), 'c12')}
          ${field('Frase da capa (opcional)', inp('capaFrase', 'placeholder="Em branco usa a frase padrão das Configurações"'), 'c12', 'Use *palavra* para o destaque em itálico. Bom para propostas fora do marketing, como audiovisual.')}
        </div></div>
      <div class="sec"><div class="sec-h"><div><h3>${ICON.sparkle} Segmento do cliente</h3><p>Preenche diagnóstico, projeção, plano sugerido e escolhe os cases do mesmo segmento.</p></div></div>
        <div class="box soft"><div class="in-group"><select class="in" id="seg-sel"><option value="">— escolher segmento —</option>${st.catalogo.segmentos.map((g) => `<option value="${g.id}" ${g.id === p.segmentoId ? 'selected' : ''}>${esc(g.nome)}</option>`).join('')}</select><button class="btn btn-dark" data-act="seg">Aplicar modelo</button></div>
        <label class="switch" style="margin-top:10px"><input type="checkbox" id="seg-plano" checked><i></i>Trocar também o plano pelo sugerido do segmento</label></div></div>
      <div class="sec"><div class="sec-h"><h3>${ICON.clock} Datas e status</h3></div>
        <div class="fgrid">
          ${field('Data de emissão', inp('data', 'type="date"'), 'c6')}
          ${field('Validade', numIn('validadeDias', 'dias', 'min="1"'), 'c6', `<span id="val-txt"></span>`)}
          ${field('Status', `<select class="in" data-bind="status">${['Rascunho', 'Enviada', 'Aprovada', 'Recusada'].map((s) => `<option>${s}</option>`).join('')}</select>`, 'c6')}
        </div></div>`;
    const valTxt = () => { tabEl.querySelector('#val-txt').textContent = `Válida até ${fmtDate(addDays(p.data, p.validadeDias))}`; };
    bind(tabEl, p, (path) => {
      if (path === 'clienteId') {
        const c = st.clientes.find((x) => x.id === p.clienteId);
        if (c) { p.saudacao = c.contato || c.nomeFantasia || c.nome; tabEl.querySelector('[data-bind="saudacao"]').value = p.saudacao; }
      }
      valTxt();
      changed();
    });
    valTxt();
    tabEl.querySelector('[data-act="seg"]').onclick = async () => {
      const id = tabEl.querySelector('#seg-sel').value;
      if (!id) return toast('Escolha um segmento.', 'warn');
      const plano = tabEl.querySelector('#seg-plano').checked;
      if ((p.diagnostico?.desafios || (plano && p.opcoes.length > 1)) && !(await confirmDialog(`Substituir o diagnóstico e a projeção${plano ? ' e as opções de plano' : ''} pelo modelo do segmento?`, { ok: 'Aplicar' }))) return;
      aplicarSegmento(p, id, { plano });
      opIdx = 0; changed(); toast('Modelo do segmento aplicado! Confira a aba Estratégia.');
    };
    tabEl.querySelector('[data-act="new-cli"]').onclick = () => abrirCliente(null, (c) => { p.clienteId = c.id; p.saudacao = c.contato || c.nomeFantasia || c.nome; changed(); tabCliente(); });
    tabEl.querySelector('[data-act="edit-cli"]').onclick = () => p.clienteId ? abrirCliente(p.clienteId, () => { changed(); tabCliente(); }) : toast('Selecione um cliente primeiro.', 'warn');
  }

  // ---------------------------------------------------------------- Aba Planos (calculadora)
  function tabPlanos() {
    if (!p.opcoes.length) p.opcoes.push(novaOpcao());
    opIdx = Math.min(opIdx, p.opcoes.length - 1);
    const op = p.opcoes[opIdx];
    const cat = st.catalogo.itens;
    const grupos = [...new Set(cat.map((i) => i.categoria))];
    tabEl.innerHTML = `
      <div class="sec">
        <div class="sec-h"><div><h3>${ICON.layers} Opções de plano</h3><p>Cada aba é uma opção que o cliente pode escolher (ex.: Simples e Completo), com até 4. Cada uma vira uma página, e o comparativo é gerado sozinho. Quando o cliente aprovar, clique em <b>Cliente aprovou → gerar contrato</b> e escolha a opção dele.</p></div></div>
        <div class="opt-tabs">${p.opcoes.map((o, i) => `<button class="opt-tab ${i === opIdx ? 'on' : ''}" data-op="${i}">${o.recomendado ? `<span class="star">★</span>` : ''}${esc(o.nome || `Opção ${i + 1}`)}</button>`).join('')}
          <button class="opt-tab" data-act="add-op">${ICON.plus} Nova opção</button></div>
        <div class="box soft">
          <div class="fgrid">
            <div class="field c12"><label>Começar a partir de um plano pronto</label><div class="in-group"><select class="in" id="plano-sel"><option value="">— escolher plano —</option>${st.catalogo.planos.map((pl) => `<option value="${pl.id}">${esc(pl.nome)}</option>`).join('')}</select><button class="btn btn-dark" data-act="load-plano">Aplicar</button></div></div>
            ${field('Nome do plano', inp('nome'), 'c7')}
            <div class="field c5" style="justify-content:flex-end">${sw('recomendado', 'Recomendado')}</div>
            ${field('Frase de apoio', inp('descricao', 'placeholder="Ex.: Conteúdo estratégico + tráfego pago"'), 'c12')}
          </div>
          <div style="display:flex;gap:6px;margin-top:10px;justify-content:flex-end">
            <button class="btn btn-sm" data-act="dup-op">${ICON.copy} Duplicar opção</button>
            ${p.opcoes.length > 1 ? `<button class="btn btn-sm btn-danger" data-act="del-op">${ICON.trash} Remover</button>` : ''}
          </div>
        </div>
      </div>

      <div class="sec">
        <div class="sec-h"><div><h3>${ICON.calc} Calculadora de serviços</h3><p>Quantidade × preço de tabela. Tracejado = cobrança única.</p></div></div>
        <div class="items" id="items"></div>
        <div class="add-row">
          <select class="in" id="add-sel"><option value="">+ Adicionar serviço do catálogo…</option>${grupos.map((g) => `<optgroup label="${esc(g)}">${cat.filter((i) => i.categoria === g).map((i) => `<option value="${i.id}">${esc(i.nome)} — ${brlShort(i.preco)}/${esc(i.unidade)}${i.cobranca === 'unico' ? ' (único)' : ''}</option>`).join('')}</optgroup>`).join('')}</select>
          <button class="btn" data-act="free">${ICON.plus} Item livre</button>
        </div>
      </div>

      <div class="sec">
        <div class="sec-h"><div><h3>${ICON.check} Entregas extras (sem custo)</h3><p>Uma por linha. Ex.: "Tráfego somente plataforma Meta".</p></div></div>
        <div class="field"><textarea class="in" id="extras" rows="2"></textarea></div>
      </div>

      <div class="sec">
        <div class="sec-h"><div><h3>${ICON.gift} Bônus para fechamento</h3><p>O valor aparece riscado — aumenta a percepção de vantagem.</p></div><button class="btn btn-sm" data-act="add-bonus">${ICON.plus} Bônus</button></div>
        <div class="rows" id="bonus"></div>
      </div>

      <div class="sec">
        <div class="sec-h"><h3>${ICON.wallet} Preço</h3></div>
        <div class="fgrid">
          <div class="field c12"><label>Valor de tabela (aparece riscado)</label>
            <div class="seg"><button type="button" data-pm="auto">Somar calculadora</button><button type="button" data-pm="fixo">Valor fixo do plano</button></div></div>
          <div class="field c6" id="vt-wrap"><label>Valor de tabela fixo</label>${money('valorTabela')}</div>
          <div class="field c6"><label>Condição especial (desconto)</label><div class="in-group"><input class="in" type="number" step="0.01" min="0" data-type="num" data-bind="desconto.valor"><select class="in" data-bind="desconto.tipo" style="max-width:80px"><option value="valor">R$</option><option value="pct">%</option></select></div></div>
          <div class="field c12" style="flex-direction:row;gap:22px;flex-wrap:wrap">${sw('pontualidade', `Desconto de pontualidade (${brlShort(regras.descontoPontualidade)})`)}${sw('kickoff', 'Cobrar kickoff')}</div>
          <div class="field c12" style="flex-direction:row;gap:22px;flex-wrap:wrap">${sw('inicial.ativo', 'Valor especial nos primeiros meses')}</div>
          <div class="field c6" data-ini><label>Quantos meses</label><input class="in" type="number" min="1" max="12" step="1" data-type="num" data-bind="inicial.meses"></div>
          <div class="field c6" data-ini><label>Mensalidade nesses meses (sem pontualidade)</label>${money('inicial.valor')}</div>
          <div class="field c12" data-ini><span class="hint">Depois desse período, o cliente passa a pagar a mensalidade cheia do plano. Isso aparece na proposta e entra no contrato.</span></div>
        </div>
        <div id="sum" style="margin-top:14px"></div>
      </div>`;

    const opEl = tabEl;
    // Liga os campos simples da opção
    bind(opEl.querySelector('.box'), op, (path) => {
      if (path === 'recomendado' && op.recomendado) p.opcoes.forEach((o) => { if (o !== op) o.recomendado = false; });
      if (path === 'nome' || path === 'recomendado') opEl.querySelectorAll('.opt-tab[data-op]').forEach((b, i) => { b.innerHTML = `${p.opcoes[i].recomendado ? '<span class="star">★</span>' : ''}${esc(p.opcoes[i].nome || `Opção ${i + 1}`)}`; });
      changed();
    });
    op.inicial ||= { ativo: false, meses: 3, valor: 0 };
    const precoSec = opEl.querySelector('#sum').closest('.sec');
    const iniSync = () => precoSec.querySelectorAll('[data-ini]').forEach((el) => { el.style.display = op.inicial.ativo ? '' : 'none'; });
    bind(precoSec, op, (path) => {
      if (path === 'inicial.ativo' && op.inicial.ativo && !num(op.inicial.valor)) {
        // Sugestão inicial: R$ 500 abaixo da mensalidade cheia
        op.inicial.valor = Math.max(0, calcOpcao(op, regras).cheia - 500);
        precoSec.querySelector('[data-bind="inicial.valor"]').value = op.inicial.valor;
      }
      iniSync(); drawSummary(); changed();
    });
    iniSync();

    const pmSync = () => {
      precoSec.querySelectorAll('[data-pm]').forEach((b) => b.classList.toggle('on', b.dataset.pm === op.precoModo));
      precoSec.querySelector('#vt-wrap').style.display = op.precoModo === 'fixo' ? '' : 'none';
    };
    precoSec.querySelectorAll('[data-pm]').forEach((b) => b.onclick = () => {
      op.precoModo = b.dataset.pm;
      if (op.precoModo === 'fixo' && !num(op.valorTabela)) { op.valorTabela = calcOpcao({ ...op, precoModo: 'auto' }, regras).somaMensal; precoSec.querySelector('[data-bind="valorTabela"]').value = op.valorTabela; }
      pmSync(); drawSummary(); changed();
    });
    pmSync();

    const extras = opEl.querySelector('#extras');
    extras.value = (op.extras || []).join('\n');
    extras.oninput = () => { op.extras = extras.value.split('\n'); changed(); };

    function drawItems() {
      const box = opEl.querySelector('#items');
      box.innerHTML = op.itens.length ? op.itens.map((it, i) => {
        const hasQ = !it.semQtd;
        return `<div class="item ${it.cobranca === 'unico' ? 'unico' : ''}" data-i="${i}">
          <div class="nm">${it.ref ? `<b title="${esc(it.nome)}">${esc(it.nome)}</b>` : `<input value="${esc(it.nome)}" data-f="nome" placeholder="Nome do item">`}<small>${brlShort(it.preco)} / ${esc(it.unidade || 'un')}${it.cobranca === 'unico' ? ' · cobrança única' : ' · mensal'}</small></div>
          <div class="stepper ${hasQ ? '' : 'off'}"><button data-q="-1">${ICON.minus}</button><input value="${it.qtd}" data-f="qtd" inputmode="numeric"><button data-q="1">${ICON.plus}</button></div>
          <div class="money"><input type="number" step="0.01" value="${it.preco}" data-f="preco"></div>
          <div class="tot">${brlShort(num(it.qtd) * num(it.preco))}</div>
          <button class="btn btn-ghost btn-icon btn-sm" data-rm="${i}" title="Remover">${ICON.x}</button>
        </div>`;
      }).join('') : '<div class="note info">Adicione serviços abaixo ou aplique um plano pronto.</div>';
    }
    const updRow = (i) => {
      const row = opEl.querySelector(`.item[data-i="${i}"]`);
      if (row) row.querySelector('.tot').textContent = brlShort(num(op.itens[i].qtd) * num(op.itens[i].preco));
      drawSummary(); changed();
    };
    opEl.querySelector('#items').addEventListener('input', (e) => {
      const row = e.target.closest('.item'); if (!row) return;
      const it = op.itens[row.dataset.i]; const f = e.target.dataset.f;
      if (f === 'qtd') it.qtd = Math.max(0, Math.round(num(e.target.value)));
      if (f === 'preco') it.preco = num(e.target.value);
      if (f === 'nome') { it.nome = e.target.value; it.bullet = e.target.value; }
      updRow(row.dataset.i);
    });
    opEl.querySelector('#items').addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      const row = b.closest('.item');
      if (b.dataset.q) { const it = op.itens[row.dataset.i]; it.qtd = Math.max(0, num(it.qtd) + Number(b.dataset.q)); row.querySelector('[data-f="qtd"]').value = it.qtd; updRow(row.dataset.i); }
      if (b.dataset.rm != null) { op.itens.splice(Number(b.dataset.rm), 1); drawItems(); drawSummary(); changed(); }
    });
    opEl.querySelector('#add-sel').onchange = (e) => {
      const it = itemDoCatalogo(e.target.value); e.target.value = '';
      if (it) { op.itens.push(it); drawItems(); drawSummary(); changed(); }
    };
    opEl.querySelector('[data-act="free"]').onclick = () => {
      op.itens.push({ id: uid('it'), ref: '', nome: 'Novo item', bullet: 'Novo item', unidade: 'un', preco: 0, cobranca: 'mensal', semQtd: true, qtd: 1 });
      drawItems(); drawSummary(); changed();
      opEl.querySelector('.item:last-child [data-f="nome"]')?.select();
    };

    function drawBonus() {
      const box = opEl.querySelector('#bonus');
      box.innerHTML = (op.bonus || []).map((b, i) => `<div class="row" data-b="${i}"><input class="in" value="${esc(b.nome)}" data-f="nome" placeholder="Ex.: Dashboard de indicadores"><div class="money"><input class="in" type="number" step="0.01" value="${b.valor || ''}" data-f="valor" placeholder="valor"></div><button class="btn btn-ghost btn-icon btn-sm" data-rmb="${i}">${ICON.x}</button></div>`).join('') || '<div class="small muted">Nenhum bônus. Que tal um "Dashboard de indicadores" ou "Ficha Google"?</div>';
    }
    opEl.querySelector('#bonus').addEventListener('input', (e) => {
      const row = e.target.closest('.row'); const b = op.bonus[row.dataset.b];
      if (e.target.dataset.f === 'nome') b.nome = e.target.value; else b.valor = num(e.target.value);
      drawSummary(); changed();
    });
    opEl.querySelector('#bonus').addEventListener('click', (e) => { const b = e.target.closest('[data-rmb]'); if (b) { op.bonus.splice(Number(b.dataset.rmb), 1); drawBonus(); drawSummary(); changed(); } });
    opEl.querySelector('[data-act="add-bonus"]').onclick = () => { (op.bonus ||= []).push({ nome: '', valor: 0 }); drawBonus(); changed(); opEl.querySelector('#bonus .row:last-child input')?.focus(); };

    function drawSummary() {
      const c = calcOpcao(op, regras);
      const auto = calcOpcao({ ...op, precoModo: 'auto' }, regras).somaMensal;
      opEl.querySelector('#sum').innerHTML = `<div class="sum">
        ${c.temMensal ? `
        <div class="sum-row"><span>Soma da calculadora</span><b>${brl(auto)}</b></div>
        ${op.precoModo === 'fixo' ? `<div class="sum-row"><span>Valor de tabela do plano</span><b>${brl(c.tabela)}</b></div>` : ''}
        ${c.desconto ? `<div class="sum-row"><span>Condição especial</span><b>− ${brl(c.desconto)}</b></div>` : ''}
        <div class="sum-row"><span>Mensalidade (sem pontualidade)</span><b>${brl(c.cheia)}</b></div>
        ${c.pontualidade ? `<div class="sum-row"><span>Desconto de pontualidade</span><b>− ${brl(c.pontualidade)}</b></div>` : ''}
        ${c.inicialMeses ? `<div class="sum-row"><span>${c.inicialMeses} primeiros meses (pagando em dia)</span><b>${brl(c.inicialFinal)}</b></div>` : ''}
        <div class="sum-big"><div><span>Cliente paga em dia${c.inicialMeses ? ` a partir do ${c.inicialMeses + 1}º mês` : ''}</span>${c.tabela > c.final ? `<div class="sum-row" style="padding:0"><s>${brlShort(c.tabela)}</s></div>` : ''}</div><strong>${brlShort(c.final)}<small>/mês</small></strong></div>
        <div class="sum-kpis">
          <div><span>Kickoff ${c.kickoff ? pct(c.kickoffPct) : ''}</span><b>${c.kickoff ? brlShort(c.kickoff) : '—'}</b></div>
          <div><span>Economia/mês</span><b>${c.economiaMes > 0 ? brlShort(c.economiaMes) : '—'}</b></div>
          <div><span>1º ano</span><b>${brlShort(c.primeiroAno)}</b></div>
        </div>` : ''}
        ${c.temUnico ? `<div class="sum-row" ${c.temMensal ? 'style="margin-top:10px;border-top:1px solid rgba(255,255,255,.14);padding-top:10px"' : ''}><span>Entrega única (material visual etc.)</span><b>${brl(c.unicoTotal)}</b></div>
          <div class="sum-row"><span>Entrada ${pct(regras.entradaMaterialPct)} + saldo na entrega</span><b>${brl(c.unicoEntrada)} + ${brl(c.unicoSaldo)}</b></div>` : ''}
        ${!c.temMensal && !c.temUnico ? '<div class="sum-row"><span>Adicione serviços para calcular.</span></div>' : ''}
        ${c.bonusTotal ? `<div class="sum-row" style="margin-top:6px"><span>${ICON.gift} Bônus agregados</span><b>${brl(c.bonusTotal)}</b></div>` : ''}
      </div>
      ${c.temMensal && c.cheia < regras.kickoffLimite ? `<div class="note" style="margin-top:8px">${ICON.alert}<span>Mensalidade abaixo de ${brlShort(regras.kickoffLimite)}: kickoff de ${pct(regras.kickoffPctAbaixo)} aplicado automaticamente.</span></div>` : ''}`;
    }

    drawItems(); drawBonus(); drawSummary();

    opEl.querySelectorAll('[data-op]').forEach((b) => b.onclick = () => { opIdx = Number(b.dataset.op); tabPlanos(); });
    opEl.querySelector('[data-act="add-op"]').onclick = () => {
      if (p.opcoes.length >= 4) return toast('Máximo de 4 opções por proposta.', 'warn');
      p.opcoes.push(opcaoDoPlano('pl_lakeplus')); opIdx = p.opcoes.length - 1; changed(); tabPlanos();
    };
    opEl.querySelector('[data-act="dup-op"]').onclick = () => { const c = clone(op); c.id = uid('op'); c.nome += ' (cópia)'; c.recomendado = false; p.opcoes.splice(opIdx + 1, 0, c); opIdx++; changed(); tabPlanos(); };
    opEl.querySelector('[data-act="del-op"]')?.addEventListener('click', async () => {
      if (!(await confirmDialog(`Remover a opção "${esc(op.nome)}"?`, { ok: 'Remover', danger: true }))) return;
      p.opcoes.splice(opIdx, 1); if (!p.opcoes.some((o) => o.recomendado) && p.opcoes[0]) p.opcoes[0].recomendado = true; opIdx = 0; changed(); tabPlanos();
    });
    opEl.querySelector('[data-act="load-plano"]').onclick = async () => {
      const id = opEl.querySelector('#plano-sel').value;
      if (!id) return toast('Escolha um plano na lista.', 'warn');
      if (op.itens.length && !(await confirmDialog('Substituir os serviços desta opção pelo plano escolhido?', { ok: 'Substituir' }))) return;
      const novo = opcaoDoPlano(id);
      novo.id = op.id; novo.recomendado = op.recomendado;
      p.opcoes[opIdx] = novo; changed(); tabPlanos();
    };
  }

  // ---------------------------------------------------------------- Aba Estratégia
  function tabEstrategia() {
    p.diagnostico ||= { ativo: false }; p.projecao ||= { ativo: false, verba: 3000, cpl: 15, conversao: 10, ticket: 500 };
    if (!num(p.projecao.verba)) {
      const v = Math.max(0, ...p.opcoes.flatMap((o) => o.itens.map((i) => num(i.verba))));
      if (v) p.projecao.verba = v;
    }
    tabEl.innerHTML = `
      <div class="sec"><div class="sec-h"><div><h3>${ICON.target} Diagnóstico do cliente</h3><p>Mostra que você entendeu o negócio — é o que deixa a proposta estratégica.</p></div></div>
        <div class="box">
          ${sw('diagnostico.ativo', 'Incluir página "Entendendo o seu momento"')}
          <div class="fgrid" style="margin-top:12px">
            ${field('Resumo (opcional)', '<textarea class="in" rows="2" data-bind="diagnostico.resumo" placeholder="Ex.: Clínica com boa reputação local, mas pouca presença digital…"></textarea>', 'c12')}
            ${field('Desafios atuais (um por linha)', '<textarea class="in" rows="4" data-bind="diagnostico.desafios" placeholder="Pouca frequência de postagens\nAnúncios sem estratégia\nAgenda com horários vagos"></textarea>', 'c6')}
            ${field('Objetivos (um por linha)', '<textarea class="in" rows="4" data-bind="diagnostico.objetivos" placeholder="Fortalecer autoridade no Instagram\nGerar contatos qualificados todo mês\nLotar a agenda"></textarea>', 'c6')}
          </div>
        </div></div>
      <div class="sec"><div class="sec-h"><div><h3>${ICON.trending} Projeção de resultados</h3><p>Simula leads, clientes e retorno a partir da verba de anúncios.</p></div></div>
        <div class="box">
          ${sw('projecao.ativo', 'Incluir projeção na proposta')}
          <div class="fgrid" style="margin-top:12px">
            ${field('Plano de referência', `<select class="in" data-bind="projecao.opcaoId"><option value="">Recomendado</option>${p.opcoes.map((o) => `<option value="${o.id}">${esc(o.nome)}</option>`).join('')}</select>`, 'c12')}
            ${field('Verba de anúncios / mês', money('projecao.verba'), 'c6')}
            ${field('Custo por lead estimado', money('projecao.cpl'), 'c6')}
            ${field('Conversão lead → cliente', numIn('projecao.conversao', '%'), 'c6')}
            ${field('Ticket médio do cliente', money('projecao.ticket'), 'c6')}
          </div>
          <div id="proj-out" style="margin-top:12px"></div>
        </div></div>`;
    const out = () => {
      const op = p.opcoes.find((o) => o.id === p.projecao.opcaoId) || p.opcoes.find((o) => o.recomendado) || p.opcoes[0];
      const r = calcProjecao(p.projecao, op ? calcOpcao(op, regras).final : 0);
      tabEl.querySelector('#proj-out').innerHTML = `<div class="calc-out"><div><span>Leads estimados</span><b>≈ ${r.leads}</b></div><div><span>Novos clientes</span><b>≈ ${r.clientes.toLocaleString('pt-BR')}</b></div><div><span>Faturamento estimado</span><b>${brl(r.receita)}</b></div><div class="big"><span>Retorno sobre investimento</span><b>${r.roi.toLocaleString('pt-BR')}x</b></div></div>`;
    };
    bind(tabEl, p, () => { out(); changed(); });
    out();
  }

  // ---------------------------------------------------------------- Aba Conteúdo
  function tabConteudo() {
    const s = st.settings;
    tabEl.innerHTML = `
      <div class="sec"><div class="sec-h"><h3>${ICON.file} Páginas da proposta</h3></div>
        <div class="box" style="display:flex;flex-direction:column;gap:10px">
          ${sw('mostrarProcesso', 'Mostrar o processo após o fechamento (5 etapas)')}
          ${sw('mostrarComparativo', 'Mostrar comparativo quando houver mais de uma opção')}
          ${sw('paginas.quemSomos', 'Página "Quem somos" (números, certificações, equipe e marcas)')}
          ${sw('paginas.metodo', 'Página do método e comparativo com outras agências')}
          ${sw('paginas.resultados', 'Página de resultados (cases e depoimentos)')}
        </div></div>
      <div class="sec"><div class="sec-h"><div><h3>${ICON.award} Cases nesta proposta</h3><p>Sem seleção, entram até 3 automaticamente (do mesmo segmento primeiro).</p></div><a class="btn btn-sm" href="#/portfolio">${ICON.pen} Portfólio</a></div>
        <div class="box" id="cases" style="display:flex;flex-direction:column;gap:8px">${(s.portfolio.cases || []).length ? s.portfolio.cases.map((c) => `<label class="switch"><input type="checkbox" data-case="${c.id}" ${p.casesIds.includes(c.id) ? 'checked' : ''}><i></i>${esc(c.cliente)}<span class="small muted">${esc(c.segmento || '')}</span></label>`).join('') : '<div class="small muted">Nenhum case cadastrado ainda. Cadastre em <a href="#/portfolio">Portfólio</a> para mostrar resultados reais.</div>'}
        <div class="small muted" id="cases-auto" style="margin-top:8px"></div></div></div>
      <div class="sec"><div class="sec-h"><div><h3>${ICON.play} Vídeo explicando a proposta</h3><p>Grave um vídeo curto (Loom, YouTube, Drive) e cole o link: vira um QR code na página final.</p></div></div>
        <div class="field">${inp('videoUrl', 'placeholder="https://www.loom.com/share/..."')}</div></div>
      <div class="sec"><div class="sec-h"><div><h3>Texto de abertura</h3><p>Deixe vazio para usar o texto padrão.</p></div></div>
        <div class="field"><textarea class="in" rows="3" data-bind="introTexto" placeholder="${esc(s.proposta.intro.replace(/\*\*/g, ''))}"></textarea></div></div>
      <div class="sec"><div class="sec-h"><div><h3>${ICON.layers} Escopo detalhado</h3><p>Páginas extras (ex.: escopo da mentoria). Use "## " para subtítulos e "- " para listas.</p></div></div>
        <div id="secs"></div>
        <div class="add-row"><select class="in" id="esc-sel"><option value="">+ Adicionar escopo pronto…</option>${st.catalogo.escopos.map((e) => `<option value="${e.id}">${esc(e.titulo.replace(/\*\*/g, ''))}</option>`).join('')}</select><button class="btn" data-act="blank">${ICON.plus} Em branco</button></div></div>
      <div class="sec"><div class="sec-h"><div><h3>${ICON.alert} Avisos (rodapé dos planos)</h3><p>Textos editáveis em Configurações.</p></div></div>
        <div class="box" style="display:flex;flex-direction:column;gap:8px" id="avs">${s.avisos.filter((a) => a.ativo).map((a) => `<label class="switch" style="align-items:flex-start"><input type="checkbox" data-av="${a.id}" ${p.avisosOff.includes(a.id) ? '' : 'checked'}><i></i><span class="small" style="font-weight:600">${esc(textoAviso(a.texto, regras))}</span></label>`).join('')}</div></div>
      <div class="sec"><div class="sec-h"><div><h3>Observações finais</h3><p>Aparecem na página de próximos passos.</p></div></div>
        <div class="field"><textarea class="in" rows="3" data-bind="observacoes" placeholder="Ex.: Captação de vídeos presencial 1x por mês em Três Lagoas."></textarea></div></div>`;
    bind(tabEl, p, changed);
    const casesAuto = () => {
      const el = tabEl.querySelector('#cases-auto');
      if (el) el.textContent = p.casesIds.length ? '' : (casesDaProposta(p).length ? `Automático: ${casesDaProposta(p).map((c) => c.cliente).join(', ')}` : '');
    };
    casesAuto();
    tabEl.querySelector('#cases').addEventListener('change', (e) => {
      const id = e.target.dataset.case; if (!id) return;
      p.casesIds = e.target.checked ? [...p.casesIds, id] : p.casesIds.filter((x) => x !== id);
      casesAuto(); changed();
    });
    tabEl.querySelector('#avs').addEventListener('change', (e) => {
      const id = e.target.dataset.av; if (!id) return;
      p.avisosOff = e.target.checked ? p.avisosOff.filter((x) => x !== id) : [...p.avisosOff, id];
      changed();
    });
    const drawSecs = () => {
      tabEl.querySelector('#secs').innerHTML = (p.secoes || []).map((s, i) => `<div class="box" style="margin-bottom:8px" data-s="${i}">
        <div class="in-group" style="margin-bottom:8px"><input class="in" value="${esc(s.titulo)}" data-f="titulo" placeholder="Título (use **negrito**)"><button class="btn btn-icon btn-sm" data-mv="-1">${ICON.up}</button><button class="btn btn-icon btn-sm" data-mv="1">${ICON.down}</button><button class="btn btn-icon btn-sm btn-danger" data-rm>${ICON.trash}</button></div>
        <textarea class="in" rows="7" data-f="texto">${esc(s.texto)}</textarea></div>`).join('');
    };
    drawSecs();
    const secs = tabEl.querySelector('#secs');
    secs.addEventListener('input', (e) => { const b = e.target.closest('[data-s]'); p.secoes[b.dataset.s][e.target.dataset.f] = e.target.value; changed(); });
    secs.addEventListener('click', (e) => {
      const t = e.target.closest('button'); if (!t) return; const i = Number(t.closest('[data-s]').dataset.s);
      if (t.dataset.rm != null) p.secoes.splice(i, 1);
      if (t.dataset.mv) { const j = i + Number(t.dataset.mv); if (j < 0 || j >= p.secoes.length) return; [p.secoes[i], p.secoes[j]] = [p.secoes[j], p.secoes[i]]; }
      drawSecs(); changed();
    });
    tabEl.querySelector('#esc-sel').onchange = (e) => {
      const tpl = st.catalogo.escopos.find((x) => x.id === e.target.value); e.target.value = '';
      if (tpl) { p.secoes.push({ id: uid('sec'), titulo: tpl.titulo, texto: tpl.texto }); drawSecs(); changed(); }
    };
    tabEl.querySelector('[data-act="blank"]').onclick = () => { p.secoes.push({ id: uid('sec'), titulo: 'Escopo do **projeto**', texto: '## Objetivo\n' }); drawSecs(); changed(); };
  }

  // ---------------------------------------------------------------- Aba Revisar
  function tabRevisar() {
    const cli = st.clientes.find((c) => c.id === p.clienteId);
    const checks = [
      [!!cli, 'Cliente selecionado'],
      [!!p.saudacao, 'Saudação preenchida'],
      [p.opcoes.length > 0 && p.opcoes.every((o) => o.itens.length), 'Todas as opções têm serviços'],
      [p.opcoes.every((o) => { const c = calcOpcao(o, regras); return c.final > 0 || c.unicoTotal > 0; }), 'Todas as opções têm valor'],
      [p.opcoes.some((o) => o.recomendado) || p.opcoes.length === 1, 'Uma opção marcada como recomendada'],
      [!!cli?.whatsapp, 'WhatsApp do cliente (para envio rápido)'],
    ];
    const ct = p.contratoId && store.find('contratos', p.contratoId);
    tabEl.innerHTML = `
      <div class="sec"><div class="sec-h"><h3>${ICON.check} Checklist</h3></div>
        <div class="box check-list">${checks.map(([ok, t]) => `<div><span class="${ok ? 'ok' : 'bad'}">${ok ? ICON.check : ICON.x}</span>${t}</div>`).join('')}</div></div>
      <div class="sec"><div class="sec-h"><h3>${ICON.send} Enviar</h3></div>
        <div class="box" style="display:flex;flex-direction:column;gap:10px">
          <button class="btn btn-dark" data-act="pdf">${ICON.download} Baixar PDF da proposta</button>
          <button class="btn btn-go" data-act="wa">${ICON.whatsapp} Enviar PDF + mensagem no WhatsApp</button>
          ${p.status === 'Enviada' ? `<button class="btn" data-act="follow">${ICON.whatsapp} Fazer follow-up${p.followups.length ? ` (último em ${fmtDate(p.followups[p.followups.length - 1])})` : ''}</button>` : ''}
          <button class="btn" data-act="enviada">${ICON.send} Marcar como enviada</button>
        </div></div>
      <div class="sec"><div class="sec-h"><h3>${ICON.sign} Fechamento</h3></div>
        <div class="box" style="display:flex;flex-direction:column;gap:10px">
          ${ct ? `<div class="note ok">${ICON.check}<span>Contrato <b>${esc(ct.numero)}</b> já gerado a partir desta proposta.</span></div><a class="btn btn-go" href="#/contrato/${ct.id}">Abrir contrato ${ICON.arrow}</a>`
            : `<button class="btn btn-go" data-act="aprovar">${ICON.sign} Cliente aprovou → gerar contrato</button><button class="btn btn-danger" data-act="recusada">Marcar como recusada</button>`}
        </div></div>
      <div class="sec">
        <div class="sec-h"><h3>🗑️ Excluir Proposta / Rascunho</h3></div>
        <div class="box" style="border:1px dashed var(--red);background:rgba(239,68,68,0.06);padding:14px;border-radius:10px">
          <p style="margin:0 0 10px;color:var(--red);font-size:13px;line-height:1.4">Deseja descartar este rascunho ou proposta? Os dados serão apagados permanentemente.</p>
          <button class="btn btn-danger" data-act="excluir" style="width:100%">${ICON.trash} Excluir definitivamente</button>
        </div>
      </div>`;
    tabEl.querySelector('[data-act="pdf"]').onclick = baixar;
    tabEl.querySelector('[data-act="aprovar"]')?.addEventListener('click', () => abrirAprovacao(p.id));
    tabEl.querySelector('[data-act="enviada"]').onclick = () => { p.status = 'Enviada'; p.enviadaEm = new Date().toISOString(); changed(); toast('Proposta marcada como enviada. Avisaremos perto do vencimento.'); };
    tabEl.querySelector('[data-act="recusada"]')?.addEventListener('click', () => { p.status = 'Recusada'; changed(); toast('Proposta marcada como recusada.', 'warn'); });
    tabEl.querySelector('[data-act="wa"]').onclick = async () => {
      const m = mensagemProposta(p, 'envio');
      if (!pages.length) pages = await renderProposta(p, store.state);
      enviarPDFWhatsApp(pages, nomeArquivo(), { ...m, onEnviado: () => {
        if (p.status === 'Rascunho') { p.status = 'Enviada'; p.enviadaEm = new Date().toISOString(); changed(); tabRevisar(); }
      } });
    };
    tabEl.querySelector('[data-act="follow"]')?.addEventListener('click', () => {
      const m = mensagemProposta(p, 'followup');
      window.open(waLink(m.tel, m.texto), '_blank');
      registrarFollowup(p); tabRevisar();
    });
  }

  const TABFN = { cliente: tabCliente, planos: tabPlanos, estrategia: tabEstrategia, conteudo: tabConteudo, revisar: tabRevisar };
  const showTab = (k) => {
    tab = k;
    main.querySelectorAll('#tabs button').forEach((b) => b.classList.toggle('on', b.dataset.tab === k));
    TABFN[k]();
    tabEl.scrollTop = 0;
    const i = TABS.findIndex((t) => t[0] === k);
    main.querySelector('[data-nav="-1"]').style.visibility = i ? 'visible' : 'hidden';
    main.querySelector('[data-nav="1"]').style.visibility = i < TABS.length - 1 ? 'visible' : 'hidden';
  };

  const nomeArquivo = () => {
    const cli = st.clientes.find((c) => c.id === p.clienteId);
    return `[${slug(cli?.nomeFantasia || cli?.nome || p.saudacao || 'CLIENTE').toUpperCase()}] PROPOSTA ${p.numero}`;
  };
  async function baixar() { if (!pages.length) pages = await renderProposta(p, store.state); exportPDF(pages, nomeArquivo()); }

  const excluirProposta = async () => {
    const isRascunho = p.status === 'Rascunho';
    const msg = p.contratoId
      ? `Excluir permanentemente a proposta ${p.numero}? Atenção: existe um contrato vinculado a ela.`
      : `Excluir permanentemente ${isRascunho ? 'o rascunho' : 'a proposta'} ${p.numero}? Esta ação não pode ser desfeita.`;
    if (!(await confirmDialog(msg, { ok: isRascunho ? 'Excluir Rascunho' : 'Excluir Proposta', danger: true }))) return;
    store.remove('propostas', p.id);
    toast(`${isRascunho ? 'Rascunho excluído' : 'Proposta excluída'} com sucesso.`);
    location.hash = '#/propostas';
  };

  main.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act="excluir"]');
    if (b) {
      e.preventDefault();
      excluirProposta();
    }
  });

  main.querySelector('#tabs').addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (b) showTab(b.dataset.tab); });
  main.querySelectorAll('[data-nav]').forEach((b) => b.onclick = () => { const i = TABS.findIndex((t) => t[0] === tab) + Number(b.dataset.nav); if (TABS[i]) showTab(TABS[i][0]); });
  main.querySelectorAll('[data-z]').forEach((b) => b.onclick = () => {
    zoom = Math.min(1.4, Math.max(0.3, (zoom || 1) + Number(b.dataset.z) * 0.1));
    const d = pv.querySelector('.fz-doc'); if (d) d.style.zoom = zoom;
    main.querySelector('#zv').textContent = `${Math.round(zoom * 100)}%`;
  });
  main.querySelector('.pv-bar [data-act="pdf"]').onclick = baixar;
  main.querySelector('.pv-bar [data-act="print"]').onclick = async () => { if (!pages.length) pages = await renderProposta(p, store.state); printPages(pages); };
  main.querySelector('.pv-bar [data-act="aprovar"]').onclick = () => abrirAprovacao(p.id);

  const onResize = debounce(() => { zoom = fitZoom(); const d = pv.querySelector('.fz-doc'); if (d) d.style.zoom = zoom; main.querySelector('#zv').textContent = `${Math.round(zoom * 100)}%`; }, 200);
  window.addEventListener('resize', onResize);
  cleanup = () => window.removeEventListener('resize', onResize);

  main.querySelector('#st-chip').innerHTML = statusChip(statusProposta(p));
  showTab(tab);
  preview();
}
