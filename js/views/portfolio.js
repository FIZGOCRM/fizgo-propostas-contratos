// Portfólio: quem somos, equipe, cases, depoimentos, marcas atendidas e modelos por segmento.
// Tudo aqui alimenta as páginas de prova social da proposta.
import { store, freshState } from '../store.js';
import { ICON } from '../icons.js';
import { esc, uid, clone, toast, imagemReduzida } from '../util.js';
import { modal, bind, field, inp, money, numIn, sw, confirmDialog } from '../ui.js';

const ABAS = [['quem', 'Quem somos & equipe'], ['metodo', 'Certificações & método'], ['cases', 'Cases'], ['depoimentos', 'Depoimentos'], ['logos', 'Marcas atendidas'], ['segmentos', 'Modelos por segmento']];

// Botão de upload que reduz a imagem e devolve o dataURL
const upBtn = (key, label = 'Foto') => `<label class="btn btn-sm">${ICON.upload} ${label}<input type="file" accept="image/*" data-up="${key}" hidden></label>`;
async function lerImagem(input, png) {
  const f = input.files[0];
  if (!f) return null;
  return imagemReduzida(f, png ? 500 : 900, png);
}

export function render(main, abaInicial) {
  let aba = ABAS.find((a) => a[0] === abaInicial) ? abaInicial : 'quem';
  const st = store.state;
  const pf = st.settings.portfolio;
  const save = () => store.save();
  main.innerHTML = `
    <div class="top"><div><h1>Portfólio</h1><p>Provas de que a Fizgo entrega. Entram sozinhas nas propostas, com páginas de "Quem somos" e "Resultados".</p></div></div>
    <div class="toolbar"><div class="seg" id="seg">${ABAS.map(([k, l]) => `<button data-a="${k}">${l}</button>`).join('')}</div></div>
    <div id="out"></div>`;
  const out = main.querySelector('#out');

  // ------------------------------------------------------------ Quem somos
  const quem = () => {
    out.innerHTML = `<div class="grid g2" style="align-items:start">
      <div class="card"><div class="card-h"><h3>Quem somos</h3></div><div class="fgrid" id="qs">
        ${field('Título (use **negrito**)', inp('quemSomosTitulo'), 'c12')}
        ${field('Texto', '<textarea class="in" rows="7" data-bind="quemSomos"></textarea>', 'c12', 'Conte a história e o jeito Fizgo de trabalhar. Use **negrito** para destacar.')}
        ${field('Vídeo padrão (opcional)', inp('videoPadrao', 'placeholder="Link de um vídeo institucional"'), 'c12', 'Entra como QR code em toda proposta nova. Dá para trocar por um vídeo personalizado em cada proposta.')}
      </div>
        <div class="vid-fizgo">
          <video src="assets/video/como-funciona-fizgo.mp4" controls preload="metadata"></video>
          <div class="small"><b>Vídeo "Como funciona a Fizgo"</b> (1 min, sem valores). O cliente só consegue abrir pelo QR code se o vídeo estiver na internet: baixe, suba no YouTube como <b>não listado</b> e cole o link no campo acima.</div>
          <a class="btn btn-sm" href="assets/video/como-funciona-fizgo.mp4" download="Como funciona a Fizgo.mp4">${ICON.download} Baixar MP4</a>
        </div>
      </div>
      <div>
        <div class="card"><div class="card-h"><div><h3>Números da Fizgo</h3><p class="small muted" style="margin:4px 0 0">Até 4. Ex.: "+80" clientes atendidos, "R$ 2 mi" gerenciados em anúncios.</p></div><button class="btn btn-sm" data-act="add-num">${ICON.plus}</button></div>
          <div id="nums">${pf.numeros.map((n, i) => `<div class="fgrid" style="margin-bottom:8px" data-n="${i}"><input class="in c3" data-f="valor" value="${esc(n.valor)}" placeholder="+80"><input class="in c8" data-f="label" value="${esc(n.label)}" placeholder="clientes atendidos"><button class="btn btn-ghost btn-icon btn-sm c1" data-rmn="${i}">${ICON.x}</button></div>`).join('') || '<div class="small muted">Nenhum número ainda.</div>'}</div></div>
        <div class="card" style="margin-top:16px"><div class="card-h"><div><h3>Equipe</h3><p class="small muted" style="margin:4px 0 0">Aparece em "Quem vai cuidar de você".</p></div><button class="btn btn-sm" data-act="add-eq">${ICON.plus} Pessoa</button></div>
          <div id="eq">${pf.equipe.map((m, i) => `<div class="person" data-e="${i}"><div class="avatar">${m.foto ? `<img src="${m.foto}">` : esc((m.nome || '?')[0])}</div><input class="in" data-f="nome" value="${esc(m.nome)}" placeholder="Nome"><input class="in" data-f="cargo" value="${esc(m.cargo)}" placeholder="Cargo">${upBtn(`eq-${i}`)}<button class="btn btn-ghost btn-icon btn-sm" data-rme="${i}">${ICON.x}</button></div>`).join('') || '<div class="small muted">Adicione as pessoas do time com foto: gera muita confiança.</div>'}</div></div>
      </div></div>`;
    bind(out.querySelector('#qs'), pf, save);
    out.oninput = (e) => {
      const n = e.target.closest('[data-n]'); if (n) { pf.numeros[n.dataset.n][e.target.dataset.f] = e.target.value; save(); }
      const m = e.target.closest('[data-e]'); if (m && e.target.dataset.f) { pf.equipe[m.dataset.e][e.target.dataset.f] = e.target.value; save(); }
    };
    out.onchange = async (e) => {
      const k = e.target.dataset.up; if (!k) return;
      pf.equipe[Number(k.split('-')[1])].foto = await lerImagem(e.target, false); save(); quem();
    };
    out.onclick = (e) => {
      const t = e.target.closest('button'); if (!t) return;
      if (t.dataset.act === 'add-num') { if (pf.numeros.length >= 4) return toast('Use até 4 números.', 'warn'); pf.numeros.push({ valor: '', label: '' }); }
      else if (t.dataset.rmn) pf.numeros.splice(Number(t.dataset.rmn), 1);
      else if (t.dataset.act === 'add-eq') pf.equipe.push({ nome: '', cargo: '', foto: null });
      else if (t.dataset.rme) pf.equipe.splice(Number(t.dataset.rme), 1);
      else return;
      save(); quem();
    };
  };

  // ------------------------------------------------------------ Cases
  const editarCase = (orig) => {
    const c = orig ? clone(orig) : { id: uid('case'), ativo: true, cliente: '', segmento: '', segmentoId: '', desafio: '', solucao: '', metricas: [{ valor: '', label: '' }, { valor: '', label: '' }, { valor: '', label: '' }], imagem: null, logo: null };
    while (c.metricas.length < 3) c.metricas.push({ valor: '', label: '' });
    const m = modal({
      title: orig ? 'Editar case' : 'Novo case', size: 'lg',
      body: `<div class="fgrid">
        ${field('Cliente', inp('cliente', 'placeholder="Ex.: Clínica Viola"'), 'c6')}
        ${field('Segmento (como aparece)', inp('segmento', 'placeholder="Ex.: Odontologia"'), 'c6')}
        ${field('Modelo de segmento', `<select class="in" data-bind="segmentoId"><option value="">—</option>${st.catalogo.segmentos.map((g) => `<option value="${g.id}">${esc(g.nome)}</option>`).join('')}</select>`, 'c6', 'Propostas desse segmento mostram este case primeiro.')}
        <div class="field c6" style="justify-content:flex-end">${sw('ativo', 'Disponível para propostas')}</div>
        ${field('Desafio', '<textarea class="in" rows="2" data-bind="desafio" placeholder="Ex.: Agenda com horários vagos e dependência de indicação."></textarea>', 'c12')}
        ${field('O que fizemos', '<textarea class="in" rows="2" data-bind="solucao" placeholder="Ex.: Conteúdo educativo + campanhas de captação no Meta."></textarea>', 'c12')}
        <div class="field c12"><label>Resultados (até 3)</label>${c.metricas.map((_, i) => `<div class="fgrid" style="margin-bottom:6px"><input class="in c4" data-bind="metricas.${i}.valor" placeholder="+180%"><input class="in c8" data-bind="metricas.${i}.label" placeholder="contatos pelo WhatsApp em 3 meses"></div>`).join('')}</div>
        <div class="field c6"><label>Imagem (print, foto, antes/depois)</label><div class="logo-up"><div class="lg-prev" id="img-prev"></div>${upBtn('imagem', 'Enviar')}</div></div>
        <div class="field c6"><label>Logo do cliente</label><div class="logo-up"><div class="lg-prev sm" id="logo-prev"></div>${upBtn('logo', 'Enviar')}</div></div>
      </div>`,
      footer: `<button class="btn" data-close>Cancelar</button><button class="btn btn-go" data-ok>Salvar case</button>`,
    });
    bind(m.el, c);
    const prev = () => {
      m.el.querySelector('#img-prev').innerHTML = c.imagem ? `<img src="${c.imagem}">` : '<span class="small muted">sem imagem</span>';
      m.el.querySelector('#logo-prev').innerHTML = c.logo ? `<img src="${c.logo}">` : '<span class="small muted">sem logo</span>';
    };
    prev();
    m.el.querySelectorAll('[data-up]').forEach((i) => i.addEventListener('change', async () => { c[i.dataset.up] = await lerImagem(i, i.dataset.up === 'logo'); prev(); }));
    m.el.querySelector('[data-ok]').addEventListener('click', () => {
      if (!c.cliente.trim()) return toast('Informe o cliente do case.', 'err');
      c.metricas = c.metricas.filter((x) => x.valor || x.label);
      const i = pf.cases.findIndex((x) => x.id === c.id);
      if (i >= 0) pf.cases[i] = c; else pf.cases.push(c);
      save(); m.close(); cases(); toast('Case salvo!');
    });
  };
  const cases = () => {
    out.innerHTML = `<div class="card"><div class="card-h"><div><h3>${ICON.award} Cases de sucesso</h3><p class="small muted" style="margin:4px 0 0">Resultados reais de clientes. Cada proposta mostra até 3, priorizando o mesmo segmento.</p></div><button class="btn btn-go btn-sm" data-act="add">${ICON.plus} Novo case</button></div>
      ${pf.cases.length ? `<div class="case-list">${pf.cases.map((c) => `<div class="case-card ${c.ativo === false ? 'off' : ''}">
        <div class="cc-img">${c.imagem ? `<img src="${c.imagem}">` : ICON.image}</div>
        <div class="cc-body"><b>${esc(c.cliente)}</b><span class="small muted">${esc(c.segmento || '')}</span>
          <div class="cc-mets">${(c.metricas || []).map((x) => `<span><strong>${esc(x.valor)}</strong> ${esc(x.label)}</span>`).join('')}</div></div>
        <div class="acts"><button class="btn btn-sm btn-icon" data-ed="${c.id}">${ICON.pen}</button><button class="btn btn-sm btn-icon btn-danger" data-rm="${c.id}">${ICON.trash}</button></div></div>`).join('')}</div>`
        : `<div class="empty"><div class="big">🏆</div><h3>Nenhum case ainda</h3><p>Cadastre 2 ou 3 clientes com números (ex.: "+180% de contatos"). É o que mais convence quem está decidindo.</p></div>`}</div>`;
    out.onclick = async (e) => {
      const t = e.target.closest('button'); if (!t) return;
      if (t.dataset.act === 'add') editarCase(null);
      if (t.dataset.ed) editarCase(pf.cases.find((x) => x.id === t.dataset.ed));
      if (t.dataset.rm && await confirmDialog('Excluir este case?', { ok: 'Excluir', danger: true })) { pf.cases = pf.cases.filter((x) => x.id !== t.dataset.rm); save(); cases(); }
    };
    out.oninput = out.onchange = null;
  };

  // ------------------------------------------------------------ Depoimentos
  const depoimentos = () => {
    out.innerHTML = `<div class="card"><div class="card-h"><div><h3>${ICON.quote} Depoimentos</h3><p class="small muted" style="margin:4px 0 0">Até 4 aparecem na página de resultados. Copie de avaliações do Google ou mensagens de clientes (com autorização).</p></div><button class="btn btn-sm" data-act="add">${ICON.plus} Depoimento</button></div>
      ${pf.depoimentos.map((d, i) => `<div class="box" style="margin-bottom:10px" data-d="${i}"><div class="fgrid">
        <div class="field c2" style="align-items:center"><div class="avatar lg">${d.foto ? `<img src="${d.foto}">` : ICON.users}</div>${upBtn(`dep-${i}`)}</div>
        <div class="c10 fgrid" style="gap:8px"><textarea class="in c12" rows="3" data-f="texto" placeholder="O que o cliente disse">${esc(d.texto)}</textarea>
          <input class="in c5" data-f="nome" value="${esc(d.nome)}" placeholder="Nome"><input class="in c5" data-f="empresa" value="${esc(d.empresa)}" placeholder="Empresa / cargo">
          <label class="switch c1"><input type="checkbox" data-f="ativo" ${d.ativo !== false ? 'checked' : ''}><i></i></label><button class="btn btn-ghost btn-icon btn-sm c1" data-rm="${i}">${ICON.trash}</button></div>
      </div></div>`).join('') || '<div class="empty"><div class="big">💬</div><h3>Nenhum depoimento</h3><p>Prints de elogios no WhatsApp e avaliações do Google viram ótimos depoimentos.</p></div>'}</div>`;
    out.oninput = (e) => { const b = e.target.closest('[data-d]'); const f = e.target.dataset.f; if (!b || !f || f === 'ativo') return; pf.depoimentos[b.dataset.d][f] = e.target.value; save(); };
    out.onchange = async (e) => {
      const b = e.target.closest('[data-d]'); if (!b) return;
      if (e.target.dataset.f === 'ativo') { pf.depoimentos[b.dataset.d].ativo = e.target.checked; save(); }
      if (e.target.dataset.up) { pf.depoimentos[b.dataset.d].foto = await lerImagem(e.target, false); save(); depoimentos(); }
    };
    out.onclick = (e) => {
      const t = e.target.closest('button'); if (!t) return;
      if (t.dataset.act === 'add') pf.depoimentos.push({ id: uid('dep'), texto: '', nome: '', empresa: '', foto: null, ativo: true });
      else if (t.dataset.rm) pf.depoimentos.splice(Number(t.dataset.rm), 1);
      else return;
      save(); depoimentos();
    };
  };

  // ------------------------------------------------------------ Marcas atendidas
  const logos = () => {
    out.innerHTML = `<div class="card"><div class="card-h"><div><h3>${ICON.image} Marcas que confiam na Fizgo</h3><p class="small muted" style="margin:4px 0 0">Logos de clientes (PNG com fundo transparente fica melhor). Até 12 aparecem em "Quem somos".</p></div><label class="btn btn-sm">${ICON.upload} Enviar logos<input type="file" accept="image/*" multiple id="lg-up" hidden></label></div>
      ${pf.logosClientes.length ? `<div class="logo-grid">${pf.logosClientes.map((l, i) => `<div class="lg-item"><img src="${l.img}"><input class="in" data-l="${i}" value="${esc(l.nome || '')}" placeholder="Nome"><button class="btn btn-ghost btn-icon btn-sm" data-rm="${i}">${ICON.x}</button></div>`).join('')}</div>`
        : '<div class="empty"><div class="big">🤝</div><h3>Nenhuma marca ainda</h3><p>Selecione vários arquivos de uma vez.</p></div>'}</div>`;
    out.querySelector('#lg-up').onchange = async (e) => {
      for (const f of e.target.files) pf.logosClientes.push({ id: uid('lg'), nome: f.name.replace(/\.[^.]+$/, ''), img: await imagemReduzida(f, 400, true) });
      save(); logos(); toast('Logos adicionados!');
    };
    out.oninput = (e) => { const i = e.target.dataset.l; if (i == null) return; pf.logosClientes[i].nome = e.target.value; save(); };
    out.onclick = (e) => { const t = e.target.closest('[data-rm]'); if (!t) return; pf.logosClientes.splice(Number(t.dataset.rm), 1); save(); logos(); };
    out.onchange = null;
  };

  // ------------------------------------------------------------ Certificações, método e comparativo
  const metodo = () => {
    pf.selos ||= []; pf.pilares ||= []; pf.diferenciais ||= { titulo: '', colunas: ['', ''], linhas: [] };
    const D = pf.diferenciais;
    const lista = (key, titulo, dica, max) => `<div class="card"><div class="card-h"><div><h3>${titulo}</h3><p class="small muted" style="margin:4px 0 0">${dica}</p></div><button class="btn btn-sm" data-add="${key}" data-max="${max}">${ICON.plus}</button></div>
      ${pf[key].map((x, i) => `<div class="fgrid" style="margin-bottom:8px" data-k="${key}" data-i="${i}"><input class="in c4" data-f="titulo" value="${esc(x.titulo)}" placeholder="Título"><textarea class="in c7" rows="2" data-f="texto" placeholder="Texto curto">${esc(x.texto)}</textarea><button class="btn btn-ghost btn-icon btn-sm c1" data-rm>${ICON.x}</button></div>`).join('') || '<div class="small muted">Nada cadastrado.</div>'}</div>`;
    out.innerHTML = `<div class="grid g2" style="align-items:start">
      <div>
        <div class="card"><div class="card-h"><h3>Manifesto</h3></div><div class="fgrid" id="mf">
          ${field('Frase de destaque (página "Quem somos")', '<textarea class="in" rows="2" data-bind="manifesto"></textarea>', 'c12')}
        </div></div>
        <div style="margin-top:16px">${lista('selos', 'Certificações e parcerias', 'Até 3. Ex.: Google Partner Premier, Meta Business Partner.', 3)}</div>
        <div class="card" style="margin-top:16px"><div class="card-h"><h3>Método</h3></div><div class="fgrid" id="mt">
          ${field('Título (use *texto* para o destaque)', inp('metodoTitulo'), 'c12')}
          ${field('Texto', '<textarea class="in" rows="2" data-bind="metodoTexto"></textarea>', 'c12')}
        </div></div>
        <div style="margin-top:16px">${lista('pilares', 'Pilares do método', 'Até 6, na ordem em que aparecem.', 6)}</div>
      </div>
      <div class="card"><div class="card-h"><div><h3>Comparativo com o mercado</h3><p class="small muted" style="margin:4px 0 0">Tabela "Por que a Fizgo?": marque o que cada concorrente tem. A coluna da Fizgo sempre aparece com ✓.</p></div><button class="btn btn-sm" data-act="add-dif">${ICON.plus} Linha</button></div>
        <div class="fgrid" id="df">
          ${field('Título', inp('titulo'), 'c12')}
          ${field('Coluna 1', inp('colunas.0'), 'c6')}${field('Coluna 2', inp('colunas.1'), 'c6')}
        </div>
        <div style="margin-top:12px;display:flex;flex-direction:column;gap:8px">${D.linhas.map((l, i) => `<div class="box soft" data-l="${i}" style="padding:10px">
          <div class="fgrid"><input class="in c11" data-f="item" value="${esc(l.item)}" placeholder="Diferencial"><button class="btn btn-ghost btn-icon btn-sm c1" data-rml="${i}">${ICON.x}</button>
          <label class="switch c3"><input type="checkbox" data-f="a" ${l.a ? 'checked' : ''}><i></i>${esc(D.colunas[0] || 'Coluna 1')}</label>
          <label class="switch c3"><input type="checkbox" data-f="b" ${l.b ? 'checked' : ''}><i></i>${esc(D.colunas[1] || 'Coluna 2')}</label>
          <input class="in c6" data-f="nos" value="${esc(l.nos || '')}" placeholder="Fizgo: ex. Solução 100% unificada"></div></div>`).join('')}</div></div>
    </div>`;
    bind(out.querySelector('#mf'), pf, save);
    bind(out.querySelector('#mt'), pf, save);
    bind(out.querySelector('#df'), D, (path) => { save(); if (path.startsWith('colunas')) metodo(); });
    out.oninput = out.onchange = (e) => {
      const r = e.target.closest('[data-k]');
      if (r && e.target.dataset.f) { pf[r.dataset.k][r.dataset.i][e.target.dataset.f] = e.target.value; save(); return; }
      const l = e.target.closest('[data-l]');
      if (l && e.target.dataset.f) { D.linhas[l.dataset.l][e.target.dataset.f] = e.target.type === 'checkbox' ? e.target.checked : e.target.value; save(); }
    };
    out.onclick = (e) => {
      const t = e.target.closest('button'); if (!t) return;
      if (t.dataset.add) { if (pf[t.dataset.add].length >= Number(t.dataset.max)) return toast(`Use até ${t.dataset.max}.`, 'warn'); pf[t.dataset.add].push({ titulo: '', texto: '' }); }
      else if (t.dataset.rm != null) { const r = t.closest('[data-k]'); pf[r.dataset.k].splice(Number(r.dataset.i), 1); }
      else if (t.dataset.act === 'add-dif') D.linhas.push({ item: '', a: false, b: false, nos: '' });
      else if (t.dataset.rml) D.linhas.splice(Number(t.dataset.rml), 1);
      else return;
      save(); metodo();
    };
  };

  // ------------------------------------------------------------ Segmentos
  let segAberto = null;
  const segmentos = () => {
    const segs = st.catalogo.segmentos;
    out.innerHTML = `<div class="card"><div class="card-h"><div><h3>${ICON.sparkle} Modelos por segmento</h3><p class="small muted" style="margin:4px 0 0">Ao escolher o segmento do cliente, a proposta já sai com diagnóstico, projeção e plano sugerido.</p></div>
        <div style="display:flex;gap:6px"><button class="btn btn-sm btn-ghost" data-act="reset">${ICON.refresh} Restaurar padrões</button><button class="btn btn-sm" data-act="add">${ICON.plus} Segmento</button></div></div>
      ${segs.map((g, i) => `<details class="clause" data-g="${i}" ${segAberto === g.id ? 'open' : ''}><summary class="clause-h"><span class="num">${i + 1}</span><span class="t">${esc(g.nome)}</span></summary>
        <div class="clause-b"><div class="fgrid">
          ${field('Nome', inp('nome'), 'c6')}
          ${field('Plano sugerido', `<select class="in" data-bind="planoId"><option value="">— manter o atual —</option>${st.catalogo.planos.map((pl) => `<option value="${pl.id}">${esc(pl.nome)}</option>`).join('')}</select>`, 'c6')}
          ${field('Verba de anúncios', money('verba'), 'c3')}${field('Custo por lead', money('cpl'), 'c3')}${field('Conversão', numIn('conversao', '%'), 'c3')}${field('Ticket médio', money('ticket'), 'c3')}
          ${field('Resumo do momento', '<textarea class="in" rows="2" data-bind="resumo"></textarea>', 'c12')}
          ${field('Desafios (um por linha)', '<textarea class="in" rows="4" data-bind="desafios"></textarea>', 'c6')}
          ${field('Objetivos (um por linha)', '<textarea class="in" rows="4" data-bind="objetivos"></textarea>', 'c6')}
          <div class="c12" style="text-align:right"><button class="btn btn-sm btn-danger" data-rm="${i}">${ICON.trash} Excluir segmento</button></div>
        </div></div></details>`).join('')}</div>`;
    out.querySelectorAll('details[data-g]').forEach((d) => {
      const g = segs[d.dataset.g];
      bind(d, g, (path) => { if (path === 'nome') d.querySelector('.t').textContent = g.nome; save(); });
      d.addEventListener('toggle', () => { if (d.open) segAberto = g.id; });
    });
    out.onclick = async (e) => {
      const t = e.target.closest('button'); if (!t) return;
      if (t.dataset.act === 'add') { const g = { id: uid('seg'), nome: 'Novo segmento', planoId: '', verba: 1000, cpl: 15, conversao: 10, ticket: 500, resumo: '', desafios: '', objetivos: '' }; segs.push(g); segAberto = g.id; }
      else if (t.dataset.rm && await confirmDialog('Excluir este segmento?', { ok: 'Excluir', danger: true })) segs.splice(Number(t.dataset.rm), 1);
      else if (t.dataset.act === 'reset' && await confirmDialog('Restaurar os modelos de segmento padrão? Edições feitas aqui serão perdidas.', { ok: 'Restaurar' })) st.catalogo.segmentos = freshState().catalogo.segmentos;
      else return;
      save(); segmentos();
    };
    out.oninput = out.onchange = null;
  };

  const FN = { quem, metodo, cases, depoimentos, logos, segmentos };
  const show = (k) => { aba = k; out.oninput = out.onchange = out.onclick = null; main.querySelectorAll('#seg button').forEach((b) => b.classList.toggle('on', b.dataset.a === k)); FN[k](); };
  main.querySelector('#seg').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) show(b.dataset.a); });
  show(aba);
}
