// Catálogo: serviços com preço de tabela e planos prontos (montados com a mesma calculadora).
import { store } from '../store.js';
import { ICON } from '../icons.js';
import { esc, brl, brlShort, uid, clone, toast, num } from '../util.js';
import { modal, bind, field, inp, money, confirmDialog } from '../ui.js';
import { calcOpcao, entregaveis } from '../calc.js';
import { itemDoCatalogo } from '../flow.js';

function abrirItem(id, after) {
  const st = store.state;
  const orig = id ? st.catalogo.itens.find((i) => i.id === id) : null;
  const it = orig ? clone(orig) : { id: '', categoria: 'Conteúdo', nome: '', unidade: 'un', preco: 0, cobranca: 'mensal', bullet: '', qtdPadrao: 1, semQtd: false, verba: 0 };
  const cats = [...new Set(st.catalogo.itens.map((i) => i.categoria))];
  const m = modal({
    title: orig ? 'Editar serviço' : 'Novo serviço',
    body: `<div class="fgrid">
      ${field('Nome do serviço', inp('nome'), 'c8')}
      ${field('Categoria', `<input class="in" data-bind="categoria" list="cats"><datalist id="cats">${cats.map((c) => `<option value="${esc(c)}">`).join('')}</datalist>`, 'c4')}
      ${field('Preço de tabela', money('preco'), 'c4')}
      ${field('Unidade', inp('unidade', 'placeholder="arte, vídeo, mês, hora…"'), 'c4')}
      ${field('Cobrança', `<select class="in" data-bind="cobranca"><option value="mensal">Mensal (recorrente)</option><option value="unico">Única (projeto / material visual)</option></select>`, 'c4')}
      ${field('Texto na proposta e no contrato', inp('bullet', 'placeholder="Ex.: {qtd} vídeos"'), 'c12', 'Use {qtd} para mostrar a quantidade. **negrito** funciona.')}
      ${field('Quantidade padrão', `<input class="in" type="number" data-type="num" data-bind="qtdPadrao">`, 'c4')}
      ${field('Verba de anúncios (se for tráfego)', money('verba'), 'c4', 'Usado na projeção de resultados.')}
      <div class="field c4" style="justify-content:flex-end"><label class="switch"><input type="checkbox" data-bind="semQtd"><i></i>Sem quantidade</label></div>
    </div>`,
    footer: `<button class="btn" data-close>Cancelar</button><button class="btn btn-go" data-ok>Salvar</button>`,
  });
  bind(m.el, it);
  m.el.querySelector('[data-ok]').onclick = () => {
    if (!it.nome) return toast('Dê um nome ao serviço.', 'err');
    if (!it.bullet) it.bullet = it.semQtd ? it.nome : `{qtd} ${it.nome}`;
    if (!it.id) { it.id = uid('srv'); st.catalogo.itens.push(it); } else Object.assign(orig, it);
    store.save(); m.close(); after();
  };
}

function abrirPlano(id, after) {
  const st = store.state;
  const orig = id ? st.catalogo.planos.find((p) => p.id === id) : null;
  const pl = orig ? clone(orig) : { id: '', nome: '', descricao: '', itens: [], extras: [], bonus: [], precoModo: 'auto', valorTabela: 0, desconto: { tipo: 'valor', valor: 0 } };
  const regras = st.settings.regras;
  const asOp = () => ({ ...pl, itens: pl.itens.map((i) => itemDoCatalogo(i.ref, i.qtd)).filter(Boolean) });
  const m = modal({
    title: orig ? 'Editar plano' : 'Novo plano', size: 'lg',
    body: `<div class="fgrid">
      ${field('Nome do plano', inp('nome'), 'c6')}${field('Frase de apoio', inp('descricao'), 'c6')}
    </div>
    <div class="sec" style="margin-top:16px"><div class="sec-h"><h3>Serviços inclusos</h3></div><div class="items" id="pi"></div>
      <div class="add-row"><select class="in" id="pa"><option value="">+ Adicionar serviço…</option>${st.catalogo.itens.map((i) => `<option value="${i.id}">${esc(i.nome)} — ${brlShort(i.preco)}</option>`).join('')}</select></div></div>
    <div class="fgrid">
      ${field('Bônus (um por linha: nome | valor)', '<textarea class="in" id="pb" rows="2" placeholder="Dashboard de indicadores | 200"></textarea>', 'c12')}
      ${field('Valor de tabela', `<select class="in" data-bind="precoModo"><option value="auto">Somar serviços</option><option value="fixo">Valor fixo</option></select>`, 'c4')}
      ${field('Valor fixo', money('valorTabela'), 'c4')}
      ${field('Condição especial (R$)', money('desconto.valor'), 'c4')}
    </div><div id="ps" style="margin-top:12px"></div>`,
    footer: `<button class="btn" data-close>Cancelar</button><button class="btn btn-go" data-ok>Salvar plano</button>`,
  });
  const draw = () => {
    m.el.querySelector('#pi').innerHTML = pl.itens.map((i, k) => {
      const c = st.catalogo.itens.find((x) => x.id === i.ref);
      return `<div class="item" data-k="${k}"><div class="nm"><b>${esc(c?.nome || i.ref)}</b><small>${brlShort(c?.preco || 0)} / ${esc(c?.unidade || '')}</small></div>
        <div class="stepper ${c?.semQtd ? 'off' : ''}"><button data-q="-1">${ICON.minus}</button><input value="${i.qtd}" data-f="qtd"><button data-q="1">${ICON.plus}</button></div><div></div>
        <div class="tot">${brlShort(num(i.qtd) * num(c?.preco))}</div><button class="btn btn-ghost btn-icon btn-sm" data-rm="${k}">${ICON.x}</button></div>`;
    }).join('');
    const c = calcOpcao(asOp(), regras);
    m.el.querySelector('#ps').innerHTML = `<div class="sum"><div class="sum-row"><span>Soma dos serviços</span><b>${brl(calcOpcao({ ...asOp(), precoModo: 'auto' }, regras).somaMensal)}</b></div><div class="sum-big"><span>Cliente paga em dia ${c.tabela > c.final ? `(de ${brlShort(c.tabela)})` : ''}</span><strong>${brlShort(c.final)}<small>/mês</small></strong></div></div>`;
  };
  bind(m.el, pl, draw);
  const pb = m.el.querySelector('#pb');
  pb.value = pl.bonus.map((b) => `${b.nome}${b.valor ? ' | ' + b.valor : ''}`).join('\n');
  pb.oninput = () => { pl.bonus = pb.value.split('\n').filter((l) => l.trim()).map((l) => { const [n, v] = l.split('|'); return { nome: n.trim(), valor: num(v) }; }); };
  m.el.querySelector('#pa').onchange = (e) => { const c = st.catalogo.itens.find((x) => x.id === e.target.value); e.target.value = ''; if (c) { pl.itens.push({ ref: c.id, qtd: c.qtdPadrao || 1 }); draw(); } };
  m.el.querySelector('#pi').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return; const k = Number(b.closest('.item').dataset.k);
    if (b.dataset.q) pl.itens[k].qtd = Math.max(0, num(pl.itens[k].qtd) + Number(b.dataset.q));
    if (b.dataset.rm != null) pl.itens.splice(k, 1);
    draw();
  });
  m.el.querySelector('#pi').addEventListener('change', (e) => { const k = Number(e.target.closest('.item').dataset.k); pl.itens[k].qtd = num(e.target.value); draw(); });
  draw();
  m.el.querySelector('[data-ok]').onclick = () => {
    if (!pl.nome) return toast('Dê um nome ao plano.', 'err');
    if (!pl.id) { pl.id = uid('pl'); st.catalogo.planos.push(pl); } else Object.assign(orig, pl);
    store.save(); m.close(); after();
  };
}

export function render(main) {
  let aba = 'servicos';
  const draw = () => {
    const st = store.state;
    const regras = st.settings.regras;
    main.querySelectorAll('#seg button').forEach((b) => b.classList.toggle('on', b.dataset.a === aba));
    const out = main.querySelector('#out');
    if (aba === 'servicos') {
      const cats = [...new Set(st.catalogo.itens.map((i) => i.categoria))];
      out.innerHTML = cats.map((c) => `<div class="card"><div class="card-h"><h3>${esc(c)}</h3></div><table class="table"><thead><tr><th>Serviço</th><th>Como aparece</th><th>Cobrança</th><th class="r">Preço</th><th></th></tr></thead><tbody>
        ${st.catalogo.itens.filter((i) => i.categoria === c).map((i) => `<tr><td class="cell-main">${esc(i.nome)}</td><td class="small muted">${esc(i.bullet).replace('{qtd}', i.qtdPadrao || 1)}</td><td>${i.cobranca === 'unico' ? '<span class="chip s-expirada">única</span>' : '<span class="chip s-enviada">mensal</span>'}</td>
          <td class="r mono">${brl(i.preco)}<span class="small muted"> / ${esc(i.unidade)}</span></td>
          <td class="acts"><button class="btn btn-sm btn-icon" data-ei="${i.id}">${ICON.pen}</button><button class="btn btn-sm btn-icon btn-danger" data-di="${i.id}">${ICON.trash}</button></td></tr>`).join('')}
      </tbody></table></div>`).join('');
    } else {
      out.innerHTML = `<div class="grid g3">${st.catalogo.planos.map((pl) => {
        const op = { ...pl, itens: pl.itens.map((i) => itemDoCatalogo(i.ref, i.qtd)).filter(Boolean) };
        const c = calcOpcao(op, regras);
        return `<div class="plan-card"><h4>${esc(pl.nome)}</h4><div class="small muted">${esc(pl.descricao || '')}</div>
          <ul>${entregaveis(op).map((x) => `<li>${x}</li>`).join('')}</ul>
          ${pl.bonus.length ? `<div class="small" style="color:#0E9A52;font-weight:700">${ICON.gift} ${pl.bonus.map((b) => esc(b.nome)).join(', ')}</div>` : ''}
          <div class="pr">${c.tabela > c.final ? `<s>${brlShort(c.tabela)}</s>` : ''}${brlShort(c.final)}<span class="small muted">/mês</span></div>
          <div class="small muted">Kickoff ${brlShort(c.kickoff)} · sem pontualidade ${brlShort(c.cheia)}</div>
          <div style="display:flex;gap:6px;margin-top:auto"><button class="btn btn-sm" data-ep="${pl.id}">${ICON.pen} Editar</button><button class="btn btn-sm btn-icon btn-danger" data-dp="${pl.id}">${ICON.trash}</button></div></div>`;
      }).join('')}</div>`;
    }
  };
  main.innerHTML = `
    <div class="top"><div><h1>Serviços & planos</h1><p>Preços de tabela que alimentam a calculadora das propostas.</p></div>
      <div class="actions"><button class="btn btn-go" data-act="novo">${ICON.plus} Novo</button></div></div>
    <div class="toolbar"><div class="seg" id="seg"><button data-a="servicos">Serviços</button><button data-a="planos">Planos prontos</button></div></div>
    <div id="out"></div>`;
  draw();
  main.querySelector('#seg').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { aba = b.dataset.a; draw(); } });
  main.querySelector('[data-act="novo"]').onclick = () => (aba === 'servicos' ? abrirItem(null, draw) : abrirPlano(null, draw));
  main.addEventListener('click', async (e) => {
    const t = e.target.closest('button'); if (!t) return;
    const st = store.state;
    if (t.dataset.ei) abrirItem(t.dataset.ei, draw);
    if (t.dataset.ep) abrirPlano(t.dataset.ep, draw);
    if (t.dataset.di && await confirmDialog('Excluir este serviço do catálogo? Propostas já feitas não mudam.', { ok: 'Excluir', danger: true })) { st.catalogo.itens = st.catalogo.itens.filter((i) => i.id !== t.dataset.di); store.save(); draw(); }
    if (t.dataset.dp && await confirmDialog('Excluir este plano?', { ok: 'Excluir', danger: true })) { st.catalogo.planos = st.catalogo.planos.filter((i) => i.id !== t.dataset.dp); store.save(); draw(); }
  });
}
