// Editor de contrato: dados herdados da proposta, condições, cláusulas e assinatura.
import { store } from '../store.js';
import { ICON } from '../icons.js';
import { esc, brl, brlShort, pct, uid, clone, debounce, fmtDate, addMonths, toast, slug, num, round2, today, fileToDataURL, download, waLink } from '../util.js';
import { bind, field, inp, money, numIn, sw, statusChip, confirmDialog } from '../ui.js';
import { calcOpcao } from '../calc.js';
import { renderContrato, camposFaltando, numerarClausulas } from '../render-contrato.js';
import { exportPDF, printPages } from '../pdf.js';
import { aplicarCondicoes, trocarModelo, mensagemContrato } from '../flow.js';
import { autentiqueAtivo, signatariosAutentique, enviarContrato, atualizarStatus, cancelarEnvio, linkPainel } from '../autentique.js';
import { clienteForm, wireClienteForm } from './clientes.js';

const TABS = [['contratante', 'Contratante'], ['plano', 'Plano & valores'], ['condicoes', 'Condições'], ['clausulas', 'Cláusulas'], ['assinatura', 'Assinatura']];

let cleanup = null;
export function unmount() { cleanup && cleanup(); cleanup = null; }

export function render(main, id) {
  const ct = store.find('contratos', id);
  if (!ct) { main.innerHTML = `<div class="empty"><h3>Contrato não encontrado</h3><a class="btn" href="#/contratos">Voltar</a></div>`; return; }
  const st = store.state;
  let tab = 'contratante';
  let zoom = null;
  let pages = [];
  const openCl = new Set();

  main.innerHTML = `
  <div class="editor">
    <div class="ed-left">
      <div class="ed-head">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
          <a class="crumb" href="#/contratos" style="margin:0">${ICON.back} Contratos</a>
          <button class="btn btn-sm btn-ghost btn-danger" data-act="excluir" title="Excluir este contrato">${ICON.trash} Excluir</button>
        </div>
        <div class="ed-title"><h1 class="mono">${esc(ct.numero)}</h1><span id="st-chip"></span></div>
        <div class="small muted">${ct.propostaNumero ? `Gerado da proposta <a href="#/proposta/${ct.propostaId}">${esc(ct.propostaNumero)}</a>` : ''}</div>
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
          <button class="btn btn-sm btn-go" data-act="pdf">${ICON.download} Baixar PDF</button>
          <button class="btn btn-sm btn-danger" data-act="excluir" title="Excluir este contrato">${ICON.trash} Excluir</button>
        </div>
      </div>
      <div class="pv" id="pv"><div class="pv-loading">Montando o contrato…</div></div>
    </div>
  </div>`;

  const tabEl = main.querySelector('#tab');
  const pv = main.querySelector('#pv');
  const fitZoom = () => Math.min(1, Math.max(0.35, (pv.clientWidth - 48) / 794));
  const preview = debounce(async () => {
    pages = await renderContrato(ct, store.state);
    if (zoom == null) zoom = fitZoom();
    const sc = pv.scrollTop;
    pv.innerHTML = `<div class="fz-doc" style="zoom:${zoom}">${pages.join('')}</div>`;
    pv.scrollTop = sc;
    main.querySelector('#zv').textContent = `${Math.round(zoom * 100)}%`;
    main.querySelector('#pgc').textContent = `${pages.length} páginas`;
  }, 260);
  const changed = () => { ct.atualizadoEm = new Date().toISOString(); store.upsert('contratos', ct); main.querySelector('#st-chip').innerHTML = statusChip(ct.status); preview(); };

  // ---------------------------------------------------------------- Contratante
  function tabContratante() {
    tabEl.innerHTML = `<div id="miss"></div>
      <div class="sec"><div class="sec-h"><div><h3>${ICON.users} Dados do contratante</h3><p>Vieram do cadastro do cliente. Alterações aqui valem só para este contrato.</p></div></div>
        <div id="cf">${clienteForm()}</div></div>
      <div class="sec" style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-sm" data-act="pull">${ICON.refresh} Puxar de novo do cadastro</button>
        ${(ct.clienteId || ct.colaboradorId) ? `<button class="btn btn-sm" data-act="push">${ICON.upload} Salvar no cadastro</button>` : ''}
      </div>`;
    const miss = () => {
      const f = camposFaltando(ct.contratante);
      tabEl.querySelector('#miss').innerHTML = f.length ? `<div class="note" style="margin-bottom:14px">${ICON.alert}<span>Faltam: <b>${f.join(', ')}</b></span></div>` : `<div class="note ok" style="margin-bottom:14px">${ICON.check}<span>Qualificação completa do contratante.</span></div>`;
    };
    wireClienteForm(tabEl.querySelector('#cf'), ct.contratante, () => { miss(); changed(); });
    miss();
    tabEl.querySelector('[data-act="pull"]').onclick = () => {
      const c = store.find('clientes', ct.clienteId) || store.find('colaboradores', ct.colaboradorId);
      if (!c) return toast('Registro não encontrado no cadastro.', 'err');
      const { id, criadoEm, observacoes, documentos, ...rest } = clone(c);
      Object.assign(ct.contratante, rest); changed(); tabContratante(); toast('Dados atualizados do cadastro.');
    };
    tabEl.querySelector('[data-act="push"]')?.addEventListener('click', () => {
      const cCli = ct.clienteId ? store.find('clientes', ct.clienteId) : null;
      if (cCli) { Object.assign(cCli, clone(ct.contratante)); store.upsert('clientes', cCli); return toast('Cadastro do cliente atualizado.'); }
      const cColab = ct.colaboradorId ? store.find('colaboradores', ct.colaboradorId) : null;
      if (cColab) { Object.assign(cColab, clone(ct.contratante)); store.upsert('colaboradores', cColab); return toast('Cadastro do colaborador atualizado.'); }
    });
  }

  // ---------------------------------------------------------------- Plano
  function tabPlano() {
    const op = ct.opcao;
    const p = store.find('propostas', ct.propostaId);
    tabEl.innerHTML = `
      ${p ? `<div class="note info" style="margin-bottom:14px">${ICON.file}<span>Plano copiado da proposta <b>${esc(p.numero)}</b>. <a href="#" data-act="resync">Puxar novamente da proposta</a></span></div>` : ''}
      <div class="sec"><div class="fgrid">${field('Nome do plano', inp('nome'), 'c12')}</div></div>
      <div class="sec"><div class="sec-h"><h3>${ICON.calc} Serviços contratados</h3></div><div class="items" id="items"></div></div>
      <div class="sec"><div class="sec-h"><h3>Entregas extras</h3></div><div class="field"><textarea class="in" rows="2" id="extras"></textarea></div></div>
      <div class="sec"><div class="sec-h"><h3>${ICON.wallet} Valores</h3></div>
        <div class="fgrid" id="vals">
          ${field('Valor de tabela', `<select class="in" data-bind="precoModo"><option value="auto">Somar serviços</option><option value="fixo">Valor fixo</option></select>`, 'c6')}
          ${field('Valor fixo', money('valorTabela'), 'c6')}
          <div class="field c12"><label>Condição especial</label><div class="in-group"><input class="in" type="number" step="0.01" data-type="num" data-bind="desconto.valor"><select class="in" data-bind="desconto.tipo" style="max-width:80px"><option value="valor">R$</option><option value="pct">%</option></select></div></div>
          <div class="field c12" style="flex-direction:row;gap:22px">${sw('pontualidade', 'Desconto de pontualidade')}${sw('kickoff', 'Cobrar kickoff')}</div>
        </div>
        <div id="sum" style="margin-top:12px"></div></div>`;
    const drawItems = () => {
      tabEl.querySelector('#items').innerHTML = op.itens.map((it, i) => `<div class="item ${it.cobranca === 'unico' ? 'unico' : ''}" data-i="${i}">
        <div class="nm"><b>${esc(it.nome)}</b><small>${it.cobranca === 'unico' ? 'cobrança única' : 'mensal'}</small></div>
        <div class="stepper ${it.semQtd ? 'off' : ''}"><button data-q="-1">${ICON.minus}</button><input value="${it.qtd}" data-f="qtd"><button data-q="1">${ICON.plus}</button></div>
        <div class="money"><input type="number" step="0.01" value="${it.preco}" data-f="preco"></div>
        <div class="tot">${brlShort(num(it.qtd) * num(it.preco))}</div>
        <button class="btn btn-ghost btn-icon btn-sm" data-rm="${i}">${ICON.x}</button></div>`).join('');
    };
    const drawSum = () => {
      const c = calcOpcao(op, ct.params);
      tabEl.querySelector('#sum').innerHTML = `<div class="sum">
        ${c.temMensal ? `<div class="sum-row"><span>Mensalidade integral</span><b>${brl(c.cheia)}</b></div>
        <div class="sum-row"><span>Com pontualidade (até dia ${ct.params.diaPontualidade})</span><b>${brl(c.final)}</b></div>
        <div class="sum-row"><span>Kickoff (${pct(c.kickoffPct)})</span><b>${brl(c.kickoff)}</b></div>` : ''}
        ${c.temUnico ? `<div class="sum-row"><span>Entrega única</span><b>${brl(c.unicoTotal)}</b></div><div class="sum-row"><span>Entrada + saldo</span><b>${brl(c.unicoEntrada)} + ${brl(c.unicoSaldo)}</b></div>` : ''}
      </div>`;
    };
    const after = () => { aplicarCondicoes(ct); drawSum(); changed(); };
    drawItems(); drawSum();
    bind(tabEl.querySelector('.sec .fgrid'), op, changed);
    bind(tabEl.querySelector('#vals'), op, after);
    const ex = tabEl.querySelector('#extras'); ex.value = (op.extras || []).join('\n'); ex.oninput = () => { op.extras = ex.value.split('\n'); changed(); };
    const items = tabEl.querySelector('#items');
    items.addEventListener('input', (e) => {
      const r = e.target.closest('.item'); const it = op.itens[r.dataset.i];
      if (e.target.dataset.f === 'qtd') it.qtd = Math.max(0, Math.round(num(e.target.value)));
      if (e.target.dataset.f === 'preco') it.preco = num(e.target.value);
      r.querySelector('.tot').textContent = brlShort(num(it.qtd) * num(it.preco)); after();
    });
    items.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return; const r = b.closest('.item');
      if (b.dataset.q) { const it = op.itens[r.dataset.i]; it.qtd = Math.max(0, num(it.qtd) + Number(b.dataset.q)); r.querySelector('[data-f="qtd"]').value = it.qtd; r.querySelector('.tot').textContent = brlShort(num(it.qtd) * num(it.preco)); after(); }
      if (b.dataset.rm != null) { op.itens.splice(Number(b.dataset.rm), 1); drawItems(); after(); }
    });
    tabEl.querySelector('[data-act="resync"]')?.addEventListener('click', async (e) => {
      e.preventDefault();
      const src = p.opcoes.find((o) => o.id === (p.opcaoAprovadaId || op.id)) || p.opcoes[0];
      if (!(await confirmDialog(`Substituir o plano do contrato pela opção "${esc(src.nome)}" da proposta?`, { ok: 'Puxar' }))) return;
      ct.opcao = clone(src); aplicarCondicoes(ct); changed(); tabPlano();
    });
  }

  // ---------------------------------------------------------------- Condições
  function tabCondicoes() {
    tabEl.innerHTML = `
      <div class="sec"><div class="sec-h"><h3>${ICON.file} Modelo e datas</h3></div>
        <div class="fgrid">
          ${field('Modelo de contrato', `<select class="in" id="modelo">${st.modelos.map((m) => `<option value="${m.id}" ${m.id === ct.modeloId ? 'selected' : ''}>${esc(m.nome)}</option>`).join('')}</select>`, 'c12', 'Trocar o modelo recarrega as cláusulas.')}
          ${field('Título do contrato', inp('tituloContrato'), 'c12')}
          ${field('Início dos serviços', inp('dataInicio', 'type="date"'), 'c6')}
          ${field('Data da assinatura', inp('dataAssinatura', 'type="date"'), 'c6')}
          ${field('Local da assinatura', inp('cidadeAssinatura'), 'c12')}
        </div></div>
      <div class="sec"><div class="sec-h"><div><h3>${ICON.wallet} Pagamento</h3><p>Vieram das regras comerciais; ajuste só se este cliente negociou diferente.</p></div></div>
        <div class="fgrid">
          ${field('Vencimento (dia)', numIn('params.diaVencimento'), 'c4')}
          ${field('Pontualidade até dia', numIn('params.diaPontualidade'), 'c4')}
          ${field('Desconto pontualidade', money('params.descontoPontualidade'), 'c4')}
          ${field('Kickoff', numIn('params.kickoffPct', '%'), 'c4')}
          ${field('Kickoff abaixo de', money('params.kickoffLimite'), 'c4')}
          ${field('Kickoff nesse caso', numIn('params.kickoffPctAbaixo', '%'), 'c4')}
          ${field('Base do kickoff', `<select class="in" data-bind="params.kickoffBase"><option value="pontualidade">Mensalidade com pontualidade</option><option value="cheia">Mensalidade integral</option></select>`, 'c6')}
          ${field('Entrada material visual', numIn('params.entradaMaterialPct', '%'), 'c6')}
        </div></div>
      <div class="sec"><div class="sec-h"><h3>${ICON.clock} Prazos</h3></div>
        <div class="fgrid">
          ${field('Duração', numIn('params.prazoMeses', 'meses'), 'c4')}
          ${field('Sem fidelidade', numIn('params.mesesSemFidelidade', 'meses'), 'c4')}
          ${field('Renovação', numIn('params.renovacaoMeses', 'meses'), 'c4')}
          ${field('Aviso prévio', numIn('params.avisoPrevioDias', 'dias'), 'c4')}
          ${field('Multa rescisória', numIn('params.multaRescisoriaPct', '%'), 'c4')}
          ${field('Aprovação de materiais', numIn('params.aprovacaoHoras', 'h'), 'c4')}
          ${field('Prazo de entrega (projetos)', inp('params.prazoEntrega'), 'c8')}
          ${field('Rodadas de ajuste', numIn('params.rodadasAjuste'), 'c4')}
          ${field('Foro (cidade)', inp('params.foroCidade'), 'c6')}
          ${field('Foro (estado)', inp('params.foroEstado'), 'c6')}
        </div></div>`;
    bind(tabEl, ct, (path) => { if (path.startsWith('params.')) aplicarCondicoes(ct); changed(); });
    tabEl.querySelector('#modelo').onchange = async (e) => {
      if (!(await confirmDialog('Trocar o modelo vai recarregar todas as cláusulas (edições manuais nas cláusulas serão perdidas). Continuar?', { ok: 'Trocar' }))) { e.target.value = ct.modeloId; return; }
      trocarModelo(ct, e.target.value); changed(); tabCondicoes();
    };
  }

  // ---------------------------------------------------------------- Cláusulas
  function tabClausulas() {
    const refs = numerarClausulas(ct.clausulas);
    tabEl.innerHTML = `
      <div class="note info" style="margin-bottom:12px">${ICON.sparkle}<span>As variáveis entre <b>{{ }}</b> são preenchidas sozinhas (valores, datas, extenso). <b>{{n}}</b> é o número da cláusula. Desligue o que não se aplica.</span></div>
      <div id="cls">${ct.clausulas.map((cl, i) => `<div class="clause ${cl.ativo ? '' : 'off'}" data-c="${i}">
        <div class="clause-h"><label class="switch"><input type="checkbox" data-f="ativo" ${cl.ativo ? 'checked' : ''}><i></i></label>
          <span class="num">${cl.ativo ? `${refs[cl.id]}ª` : '—'}</span><span class="t" data-toggle>${esc(cl.titulo)}</span>
          <button class="btn btn-ghost btn-icon btn-sm" data-mv="-1">${ICON.up}</button><button class="btn btn-ghost btn-icon btn-sm" data-mv="1">${ICON.down}</button><button class="btn btn-ghost btn-icon btn-sm" data-toggle>${ICON.pen}</button></div>
        ${openCl.has(cl.id) ? `<div class="clause-b"><input class="in" data-f="titulo" value="${esc(cl.titulo)}" style="margin-bottom:6px"><textarea class="in" data-f="texto">${esc(cl.texto)}</textarea>
          <div style="display:flex;justify-content:space-between;margin-top:6px"><button class="btn btn-sm" data-reset>${ICON.refresh} Restaurar padrão</button>${cl.custom ? `<button class="btn btn-sm btn-danger" data-rm>${ICON.trash} Remover</button>` : ''}</div></div>` : ''}
      </div>`).join('')}</div>
      <div class="add-row"><button class="btn" data-act="add">${ICON.plus} Nova cláusula</button><button class="btn btn-ghost" data-act="restore">${ICON.refresh} Restaurar todas do modelo</button></div>`;
    const cls = tabEl.querySelector('#cls');
    cls.addEventListener('input', (e) => {
      const i = Number(e.target.closest('[data-c]').dataset.c); const f = e.target.dataset.f;
      if (f === 'titulo' || f === 'texto') { ct.clausulas[i][f] = e.target.value; changed(); }
    });
    cls.addEventListener('change', (e) => {
      if (e.target.dataset.f !== 'ativo') return;
      const i = Number(e.target.closest('[data-c]').dataset.c); ct.clausulas[i].ativo = e.target.checked; changed(); tabClausulas();
    });
    cls.addEventListener('click', (e) => {
      const t = e.target.closest('[data-toggle],[data-mv],[data-reset],[data-rm]'); if (!t) return;
      const i = Number(t.closest('[data-c]').dataset.c); const cl = ct.clausulas[i];
      if (t.dataset.toggle != null) { openCl.has(cl.id) ? openCl.delete(cl.id) : openCl.add(cl.id); tabClausulas(); return; }
      if (t.dataset.mv) { const j = i + Number(t.dataset.mv); if (j < 0 || j >= ct.clausulas.length) return; [ct.clausulas[i], ct.clausulas[j]] = [ct.clausulas[j], ct.clausulas[i]]; }
      if (t.dataset.reset != null) { const m = st.modelos.find((x) => x.id === ct.modeloId); const orig = m?.clausulas.find((x) => x.id === cl.id); if (orig) Object.assign(cl, { titulo: orig.titulo, texto: orig.texto }); }
      if (t.dataset.rm != null) ct.clausulas.splice(i, 1);
      changed(); tabClausulas();
    });
    tabEl.querySelector('[data-act="add"]').onclick = () => {
      const cl = { id: uid('cl'), titulo: 'NOVA CLÁUSULA', texto: 'Texto da cláusula. Use **negrito** e {{n}}.1. para subitens.', ativo: true, custom: true };
      const idx = ct.clausulas.findIndex((x) => x.id === 'foro');
      ct.clausulas.splice(idx >= 0 ? idx : ct.clausulas.length, 0, cl); openCl.add(cl.id); changed(); tabClausulas();
    };
    tabEl.querySelector('[data-act="restore"]').onclick = async () => {
      if (!(await confirmDialog('Restaurar todas as cláusulas do modelo? Edições feitas neste contrato serão perdidas.', { ok: 'Restaurar' }))) return;
      trocarModelo(ct, ct.modeloId); changed(); tabClausulas();
    };
  }

  // ---------------------------------------------------------------- Assinatura
  function signatarios() {
    const k = ct.contratante;
    const e = st.settings.empresa;
    const lista = [
      { nome: k.tipo === 'PF' ? k.nome : (k.representante?.nome || k.nome), email: k.email, papel: 'Contratante' },
      { nome: e.representante, email: e.email, papel: 'Contratada (Fizgo)' },
    ];
    (ct.testemunhas || []).filter((t) => t.nome).forEach((t) => lista.push({ nome: t.nome, email: t.email || '', papel: 'Testemunha' }));
    return lista;
  }
  // Envio manual (sem token do Autentique)
  function secManual(c) {
    return `<div class="sec"><div class="sec-h"><div><h3>${ICON.send} Assinatura pelo Autentique</h3><p>3 passos: baixe o PDF, crie o documento no Autentique e avise o cliente. <a href="#/config/autentique">Conecte o Autentique</a> para fazer tudo com 1 clique.</p></div></div>
        <div class="box" style="display:flex;flex-direction:column;gap:10px">
          <div class="steps-mini"><b>1</b><button class="btn btn-dark" data-act="pdf2">${ICON.download} Baixar PDF do contrato</button></div>
          <div class="steps-mini"><b>2</b><a class="btn" href="https://painel.autentique.com.br" target="_blank" rel="noopener">${ICON.sign} Abrir o Autentique</a></div>
          <div class="signers">${signatarios().map((x, i) => `<div class="signer"><div><b>${esc(x.nome || '—')}</b><span>${esc(x.papel)}</span></div><span class="mono small">${esc(x.email || 'sem e-mail')}</span>${x.email ? `<button class="btn btn-sm btn-ghost" data-copy="${i}" title="Copiar e-mail">${ICON.copy}</button>` : ''}</div>`).join('')}</div>
          <div class="steps-mini"><b>3</b><button class="btn btn-wa" data-act="wa">${ICON.whatsapp} Avisar o cliente no WhatsApp</button></div>
          ${c.kickoff && !ct.kickoffPago ? `<button class="btn" data-act="wa-kick">${ICON.wallet} Cobrar kickoff (${brlShort(c.kickoff)}) no WhatsApp</button>` : ''}
          <p class="small muted" style="margin:0">Quando o Autentique avisar que todos assinaram, baixe a via assinada e anexe abaixo: o contrato vira "Assinado".</p>
        </div></div>`;
  }
  // Envio e acompanhamento automáticos pelo Autentique
  function secAutentique(c) {
    const a = ct.autentique;
    const teste = st.settings.autentique.sandbox;
    if (!a) {
      const sig = signatariosAutentique(ct);
      return `<div class="sec"><div class="sec-h"><div><h3>${ICON.send} Assinatura pelo Autentique</h3><p>${st.settings.autentique.envioCliente === 'link' ? 'O Autentique gera o link de assinatura e você manda para o cliente no WhatsApp.' : 'O contrato vai em PDF para todos assinarem por e-mail ou WhatsApp.'}</p></div></div>
        <div class="box" style="display:flex;flex-direction:column;gap:10px">
          ${teste ? `<div class="note">${ICON.alert}<span><b>Modo teste ligado</b>: o documento não vale juridicamente. Desligue em <a href="#/config/autentique">Configurações → Autentique</a> para enviar de verdade.</span></div>` : ''}
          <div class="signers" style="margin:0">${sig.map((x) => `<div class="signer"><div><b>${esc(x.nome || '—')}</b><span>${esc(x.papel)}${x.via ? ` · via ${x.via}` : ''}</span></div>${x.faltando ? `<span class="small" style="color:var(--red);font-weight:700">falta ${esc(x.faltando)}</span>` : `<span class="mono small">${esc(x.signer.email || x.signer.phone || 'link')}</span>`}</div>`).join('')}</div>
          <button class="btn btn-go" data-act="aut-enviar">${ICON.send} ${teste ? 'Enviar teste' : 'Enviar para assinatura'} no Autentique</button>
          ${c.kickoff && !ct.kickoffPago ? `<button class="btn" data-act="wa-kick">${ICON.wallet} Cobrar kickoff (${brlShort(c.kickoff)}) no WhatsApp</button>` : ''}
        </div></div>`;
    }
    const ass = a.assinaturas || [];
    const estado = (x) => x.recusou ? `<span class="chip s-recusada">Recusou${x.motivo ? `: ${esc(x.motivo)}` : ''}</span>` : x.assinou ? `<span class="chip s-assinado">Assinou ${fmtDate(x.assinou.slice(0, 10))}</span>` : x.visualizou ? '<span class="chip s-enviada">Visualizou</span>' : '<span class="chip">Aguardando</span>';
    return `<div class="sec"><div class="sec-h"><div><h3>${ICON.send} Assinatura pelo Autentique ${a.sandbox ? '<span class="chip s-expirada">teste</span>' : ''}</h3><p>Enviado em ${fmtDate(a.enviadoEm.slice(0, 10))} · atualizado ${new Date(a.verificadoEm).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</p></div></div>
      <div class="box" style="display:flex;flex-direction:column;gap:10px">
        ${a.linkCliente && ct.status !== 'Assinado' && !ass.some((x) => x.visualizou || x.assinou) ? `<div class="note info">${ICON.whatsapp}<span>Pronto! Agora mande o link de assinatura para o cliente no WhatsApp.</span></div>` : ''}
        <div class="signers" style="margin:0">${ass.map((x, i) => `<div class="signer"><div><b>${esc(x.nome || x.email)}</b><span>${esc(x.email)}</span></div>${estado(x)}${x.link && !x.assinou ? `<button class="btn btn-sm btn-ghost" data-link="${i}" title="Copiar link de assinatura">${ICON.copy}</button>` : ''}</div>`).join('')}</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn btn-dark" data-act="aut-status">${ICON.refresh} Atualizar status</button>
          <a class="btn" href="${linkPainel(ct)}" target="_blank" rel="noopener">Abrir no Autentique</a>
          ${ct.status !== 'Assinado' ? `<button class="btn btn-wa" data-act="wa">${ICON.whatsapp} ${a.linkCliente ? 'Mandar link no WhatsApp' : 'Avisar o cliente'}</button>` : ''}
          ${a.linkCliente && ct.status !== 'Assinado' ? `<button class="btn" data-act="copy-link">${ICON.copy} Copiar link</button>` : ''}
          ${c.kickoff && !ct.kickoffPago ? `<button class="btn" data-act="wa-kick">${ICON.wallet} Cobrar kickoff</button>` : ''}
        </div>
        ${ct.status !== 'Assinado' ? `<button class="btn btn-ghost btn-sm btn-danger" data-act="aut-cancelar" style="align-self:flex-start">${ICON.trash} Cancelar envio</button>` : ''}
        ${ct.status === 'Assinado' && !ct.arquivoAssinado && a.arquivos?.signed ? `<a class="btn btn-sm" href="${esc(a.arquivos.signed)}" target="_blank" rel="noopener">${ICON.download} Via assinada no Autentique</a>` : ''}
      </div></div>`;
  }
  function comemorar() {
    if (window.confetti) window.confetti({ particleCount: 160, spread: 90, origin: { y: 0.6 }, colors: ['#00F07A', '#233C42', '#ffffff'] });
    toast('Contrato assinado! Bem-vindo(a) à Fizgo 🚀');
  }
  function tabAssinatura() {
    const c = calcOpcao(ct.opcao, ct.params);
    // Ao abrir a aba, confere o Autentique se a última consulta tem mais de 1 minuto
    if (ct.autentique?.id && ct.status === 'Enviado' && autentiqueAtivo() && Date.now() - new Date(ct.autentique.verificadoEm).getTime() > 60000 && !tabAssinatura.busy) {
      tabAssinatura.busy = true;
      atualizarStatus(ct).then(() => { if (ct.autentique?.concluidoAgora) { delete ct.autentique.concluidoAgora; comemorar(); } changed(); if (tab === 'assinatura') tabAssinatura(); }).catch(() => {}).finally(() => { tabAssinatura.busy = false; });
    }
    tabEl.innerHTML = `
      <div class="sec"><div class="sec-h"><h3>${ICON.sign} Status</h3></div>
        <div class="fgrid">${field('Situação do contrato', `<select class="in" data-bind="status">${['Rascunho', 'Enviado', 'Assinado', 'Encerrado'].map((s) => `<option>${s}</option>`).join('')}</select>`, 'c12')}
        ${c.kickoff ? `<div class="field c12">${sw('kickoffPago', `Kickoff de ${brlShort(c.kickoff)} recebido`)}</div>` : ''}</div></div>
      <div class="sec"><div class="sec-h"><h3>${ICON.users} Testemunhas</h3></div>
        <div class="fgrid">
          ${field('Testemunha 1', inp('testemunhas.0.nome'), 'c5')}${field('CPF', inp('testemunhas.0.cpf'), 'c3')}${field('E-mail (Autentique)', inp('testemunhas.0.email'), 'c4')}
          ${field('Testemunha 2', inp('testemunhas.1.nome'), 'c5')}${field('CPF', inp('testemunhas.1.cpf'), 'c3')}${field('E-mail (Autentique)', inp('testemunhas.1.email'), 'c4')}
        </div></div>
      ${autentiqueAtivo() ? secAutentique(c) : secManual(c)}
      <div class="sec"><div class="sec-h"><div><h3>${ICON.clip} Contrato assinado</h3><p>Guarde aqui a via assinada (PDF).</p></div></div>
        <div class="box">${ct.arquivoAssinado ? `<div style="display:flex;gap:8px;align-items:center;justify-content:space-between"><span class="small"><b>${esc(ct.arquivoAssinado.nome)}</b></span><span><button class="btn btn-sm" data-act="dl">${ICON.download}</button><button class="btn btn-sm btn-danger" data-act="rmf">${ICON.trash}</button></span></div>`
          : `<input type="file" accept="application/pdf,image/*" id="up" class="in">`}</div></div>
      ${c.temMensal ? `<div class="sec"><div class="sec-h"><h3>${ICON.clock} Linha do tempo</h3></div><div class="box small" style="display:grid;gap:6px">
        <div>Início: <b>${fmtDate(ct.dataInicio)}</b></div>
        <div>Fim do período sem fidelidade: <b>${fmtDate(addMonths(ct.dataInicio, ct.params.mesesSemFidelidade))}</b></div>
        <div>Fim da vigência / renovação: <b>${fmtDate(addMonths(ct.dataInicio, ct.params.prazoMeses))}</b></div>
        <div>Reajuste IGP-M a partir de: <b>${fmtDate(addMonths(ct.dataInicio, 12))}</b></div></div></div>
      <div class="sec"><div class="sec-h"><div><h3>${ICON.trending} Reajuste anual</h3><p>Informe o IGP-M acumulado de 12 meses. O contrato assinado não muda; a nova mensalidade passa a valer no painel.</p></div></div>
        <div class="box"><div class="in-group"><div class="suffix" data-s="%" style="flex:1"><input class="in" type="number" step="0.01" id="igpm" placeholder="Ex.: 4,5"></div><button class="btn btn-dark" data-act="reajustar">Aplicar reajuste</button></div>
          <div class="small muted" id="reaj-prev" style="margin-top:6px">Mensalidade atual: <b>${brlShort(ct.mensalidadeVigente || c.final)}</b></div>
          ${(ct.reajustes || []).length ? `<div class="small" style="margin-top:8px">${ct.reajustes.map((r) => `<div>${fmtDate(r.data)}: ${pct(r.pct)} · ${brlShort(r.de)} → <b>${brlShort(r.para)}</b></div>`).join('')}</div>` : ''}</div></div>` : ''}
      <div class="sec">
        <div class="sec-h"><h3>🗑️ Excluir Contrato</h3></div>
        <div class="box" style="border:1px dashed var(--red);background:rgba(239,68,68,0.06);padding:14px;border-radius:10px">
          <p style="margin:0 0 10px;color:var(--red);font-size:13px;line-height:1.4">Deseja excluir este contrato permanentemente? Se foi gerado a partir de uma proposta, a proposta voltará a ficar disponível para gerar novo contrato.</p>
          <button class="btn btn-danger" data-act="excluir" style="width:100%">${ICON.trash} Excluir contrato definitivamente</button>
        </div>
      </div>`;
    bind(tabEl, ct, (path) => {
      if (path === 'status' && ct.status === 'Assinado') {
        ct.assinadoEm ||= new Date().toISOString();
        comemorar();
      }
      changed();
    });
    tabEl.querySelector('[data-act="pdf2"]')?.addEventListener('click', baixar);
    const enviarWa = (chave) => { const m = mensagemContrato(ct, chave); window.open(waLink(m.tel, m.texto), '_blank'); };
    tabEl.querySelector('[data-act="wa"]')?.addEventListener('click', () => {
      enviarWa(ct.autentique?.linkCliente ? 'assinatura' : 'contrato');
      if (ct.status === 'Rascunho') { ct.status = 'Enviado'; ct.enviadoEm = new Date().toISOString(); changed(); tabAssinatura(); }
    });
    const ocupado = async (btn, fn) => { btn.disabled = true; try { await fn(); } catch (err) { toast(err.message, 'err', 6000); } btn.disabled = false; };
    tabEl.querySelector('[data-act="aut-enviar"]')?.addEventListener('click', (e) => ocupado(e.currentTarget, async () => {
      const teste = st.settings.autentique.sandbox;
      if (!(await confirmDialog(`${teste ? 'Enviar um <b>teste</b>' : 'Enviar'} o contrato ${esc(ct.numero)} para assinatura no Autentique? ${st.settings.autentique.envioCliente === 'link' ? 'Depois é só mandar o link para o cliente no WhatsApp.' : 'Todos os signatários recebem o convite.'}`, { ok: 'Enviar' }))) return;
      await enviarContrato(ct);
      changed(); tabAssinatura(); toast(teste ? 'Teste enviado ao Autentique!' : 'Contrato enviado para assinatura!');
    }));
    tabEl.querySelector('[data-act="aut-status"]')?.addEventListener('click', (e) => ocupado(e.currentTarget, async () => {
      await atualizarStatus(ct);
      if (ct.autentique.concluidoAgora) { delete ct.autentique.concluidoAgora; comemorar(); }
      changed(); tabAssinatura();
    }));
    tabEl.querySelector('[data-act="aut-cancelar"]')?.addEventListener('click', (e) => ocupado(e.currentTarget, async () => {
      if (!(await confirmDialog('Cancelar o envio? O documento é removido do Autentique e você pode enviar de novo depois de ajustar o contrato.', { ok: 'Cancelar envio', danger: true }))) return;
      await cancelarEnvio(ct);
      changed(); tabAssinatura(); toast('Envio cancelado.', 'warn');
    }));
    tabEl.querySelectorAll('[data-link]').forEach((b) => b.onclick = () => navigator.clipboard.writeText(ct.autentique.assinaturas[b.dataset.link].link).then(() => toast('Link de assinatura copiado!')));
    tabEl.querySelector('[data-act="copy-link"]')?.addEventListener('click', () => navigator.clipboard.writeText(ct.autentique.linkCliente).then(() => toast('Link de assinatura copiado!')));
    tabEl.querySelector('[data-act="wa-kick"]')?.addEventListener('click', () => enviarWa('kickoff'));
    tabEl.querySelectorAll('[data-copy]').forEach((b) => b.onclick = () => { navigator.clipboard.writeText(signatarios()[b.dataset.copy].email).then(() => toast('E-mail copiado!')); });
    const igpm = tabEl.querySelector('#igpm');
    const atual = ct.mensalidadeVigente || c.final;
    igpm?.addEventListener('input', () => {
      tabEl.querySelector('#reaj-prev').innerHTML = `Mensalidade atual: <b>${brlShort(atual)}</b>${num(igpm.value) ? ` → nova: <b>${brl(round2(atual * (1 + num(igpm.value) / 100)))}</b>` : ''}`;
    });
    tabEl.querySelector('[data-act="reajustar"]')?.addEventListener('click', async () => {
      const v = num(igpm.value);
      if (!v) return toast('Informe o percentual do IGP-M.', 'warn');
      const para = round2(atual * (1 + v / 100));
      if (!(await confirmDialog(`Reajustar em ${pct(v)}: mensalidade de ${brl(atual)} para ${brl(para)}?`, { ok: 'Aplicar reajuste' }))) return;
      ct.mensalidadeVigente = para;
      (ct.reajustes ||= []).push({ data: today(), pct: v, de: atual, para });
      changed(); tabAssinatura(); toast('Reajuste aplicado ao contrato.');
    });
    tabEl.querySelector('#up')?.addEventListener('change', async (e) => {
      const f = e.target.files[0]; if (!f) return;
      if (f.size > 8 * 1024 * 1024) return toast('Arquivo muito grande (máx. 8 MB).', 'err');
      ct.arquivoAssinado = { nome: f.name, tipo: f.type, data: await fileToDataURL(f) };
      if (ct.status !== 'Assinado') { ct.status = 'Assinado'; ct.assinadoEm = new Date().toISOString(); }
      changed(); tabAssinatura(); toast('Via assinada anexada.');
    });
    tabEl.querySelector('[data-act="dl"]')?.addEventListener('click', () => { const a = document.createElement('a'); a.href = ct.arquivoAssinado.data; a.download = ct.arquivoAssinado.nome; a.click(); });
    tabEl.querySelector('[data-act="rmf"]')?.addEventListener('click', () => { ct.arquivoAssinado = null; changed(); tabAssinatura(); });
  }

  const TABFN = { contratante: tabContratante, plano: tabPlano, condicoes: tabCondicoes, clausulas: tabClausulas, assinatura: tabAssinatura };
  const showTab = (k) => {
    tab = k;
    main.querySelectorAll('#tabs button').forEach((b) => b.classList.toggle('on', b.dataset.tab === k));
    TABFN[k]();
    tabEl.scrollTop = 0;
    const i = TABS.findIndex((t) => t[0] === k);
    main.querySelector('[data-nav="-1"]').style.visibility = i ? 'visible' : 'hidden';
    main.querySelector('[data-nav="1"]').style.visibility = i < TABS.length - 1 ? 'visible' : 'hidden';
  };
  const nome = () => `[${slug(ct.contratante.nomeFantasia || ct.contratante.nome || 'CLIENTE').toUpperCase()}] CONTRATO ${ct.numero}`;
  async function baixar() { if (!pages.length) pages = await renderContrato(ct, store.state); exportPDF(pages, nome()); }

  const excluirContrato = async () => {
    const msg = `Excluir permanentemente o contrato ${ct.numero}? Esta ação não pode ser desfeita.`;
    if (!(await confirmDialog(msg, { ok: 'Excluir Contrato', danger: true }))) return;
    if (ct.propostaId) {
      const prop = store.find('propostas', ct.propostaId);
      if (prop && prop.contratoId === ct.id) {
        prop.contratoId = '';
        store.upsert('propostas', prop);
      }
    }
    store.remove('contratos', ct.id);
    toast('Contrato excluído com sucesso.');
    location.hash = '#/contratos';
  };

  main.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act="excluir"]');
    if (b) {
      e.preventDefault();
      excluirContrato();
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
  main.querySelector('.pv-bar [data-act="print"]').onclick = async () => { if (!pages.length) pages = await renderContrato(ct, store.state); printPages(pages); };
  const onResize = debounce(() => { zoom = fitZoom(); const d = pv.querySelector('.fz-doc'); if (d) d.style.zoom = zoom; }, 200);
  window.addEventListener('resize', onResize);
  cleanup = () => window.removeEventListener('resize', onResize);

  main.querySelector('#st-chip').innerHTML = statusChip(ct.status);
  showTab(tab);
  preview();
}
