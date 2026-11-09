// Tabela de serviços extras: edita itens e preços (cliente Fizgo × avulso) e manda o PDF no WhatsApp.
import { store } from '../store.js';
import { ICON } from '../icons.js';
import { esc, debounce, preencher, slug } from '../util.js';
import { bind, field, inp, money, numIn, sw, confirmDialog } from '../ui.js';
import { renderExtras } from '../render-extras.js';
import { exportPDF, enviarPDFWhatsApp } from '../pdf.js';

const ICONES = [['globe', 'Sites'], ['video', 'Vídeo'], ['mic', 'Podcast'], ['layers', 'Design'], ['zap', 'IA & vendas'], ['tag', 'Outros']];

export function render(main) {
  const st = store.state;
  const cfg = st.settings.extras;
  const envio = { clienteId: '', mostrar: cfg.mostrar || 'ambos' };
  let zoom = null;
  let pages = [];

  main.innerHTML = `
  <div class="editor">
    <div class="ed-left">
      <div class="ed-head">
        <div class="ed-title"><h1>Tabela de extras</h1></div>
        <p class="small muted" style="margin:4px 0 0">Sites, vídeos, podcast, design e mais, com preço de cliente e avulso. Edite aqui e mande o PDF quando pedirem valores.</p>
      </div>
      <div class="ed-body" id="ed"></div>
    </div>
    <div class="ed-right">
      <div class="pv-bar">
        <div class="pv-zoom"><button class="btn btn-sm btn-icon" data-z="-1">${ICON.minus}</button><span id="zv">100%</span><button class="btn btn-sm btn-icon" data-z="1">${ICON.plus}</button><span id="pgc" style="margin-left:8px"></span></div>
        <div class="actions">
          <button class="btn btn-sm" data-act="pdf">${ICON.download} Baixar PDF</button>
          <button class="btn btn-sm btn-go" data-act="wa">${ICON.whatsapp} Enviar no WhatsApp</button>
        </div>
      </div>
      <div class="pv" id="pv"><div class="pv-loading">Montando a tabela…</div></div>
    </div>
  </div>`;

  const ed = main.querySelector('#ed');
  const pv = main.querySelector('#pv');
  const cliente = () => st.clientes.find((c) => c.id === envio.clienteId);
  const opcoes = () => { const c = cliente(); return { mostrar: envio.mostrar, para: c ? (c.nomeFantasia || c.nome) : '' }; };

  const fitZoom = () => Math.min(1, Math.max(0.35, (pv.clientWidth - 48) / 794));
  const preview = debounce(async () => {
    pages = await renderExtras(st.settings, opcoes());
    if (zoom == null) zoom = fitZoom();
    const sc = pv.scrollTop;
    pv.innerHTML = `<div class="fz-doc" style="zoom:${zoom}">${pages.join('')}</div>`;
    pv.scrollTop = sc;
    main.querySelector('#zv').textContent = `${Math.round(zoom * 100)}%`;
    main.querySelector('#pgc').textContent = `${pages.length} página${pages.length > 1 ? 's' : ''}`;
  }, 220);
  const changed = () => { store.save(); preview(); };

  function draw() {
    const clientes = [...st.clientes].sort((a, b) => (a.nomeFantasia || a.nome || '').localeCompare(b.nomeFantasia || b.nome || ''));
    ed.innerHTML = `
      <div class="sec" id="envio">
        <div class="sec-h"><h3>${ICON.send} Enviar</h3></div>
        <div class="box fgrid">
          ${field('Para quem (opcional)', `<select class="in" data-bind="clienteId"><option value="">— tabela geral —</option>${clientes.map((c) => `<option value="${c.id}">${esc(c.nomeFantasia || c.nome)}</option>`).join('')}</select>`, 'c6', 'Coloca o nome na tabela e já abre a conversa dele.')}
          ${field('Valores que aparecem', `<select class="in" data-bind="mostrar"><option value="ambos">Cliente e avulso</option><option value="cliente">Só valor de cliente</option><option value="avulso">Só valor avulso</option></select>`, 'c6')}
        </div>
      </div>
      <div class="sec" id="textos">
        <div class="sec-h"><h3>${ICON.file} Textos</h3></div>
        <div class="box fgrid">
          ${field('Título', inp('titulo'), 'c6', 'Use *palavra* para o destaque em itálico.')}
          ${field('Validade dos valores', numIn('validadeDias', 'dias'), 'c6')}
          ${field('Subtítulo', `<textarea class="in" rows="2" data-bind="subtitulo"></textarea>`, 'c12')}
          ${field('Nome do preço de cliente', inp('rotuloCliente'), 'c6')}
          ${field('Nome do preço avulso', inp('rotuloAvulso'), 'c6')}
          ${field('Condições (uma por linha)', `<textarea class="in" rows="3" data-bind="condicoes"></textarea>`, 'c12')}
        </div>
      </div>
      ${cfg.categorias.map((cat, ci) => `
      <div class="sec" data-cat="${ci}">
        <div class="sec-h"><div><h3>${ICON[cat.icone] || ICON.tag} ${esc(cat.nome || 'Categoria')}</h3><p>${cat.itens.length} serviço${cat.itens.length === 1 ? '' : 's'}</p></div>
          <div style="display:flex;gap:6px;align-items:center">${sw(`categorias.${ci}.ativo`, 'Na tabela')}<button class="btn btn-sm btn-ghost btn-danger" data-rmcat="${ci}" title="Excluir categoria">${ICON.trash}</button></div></div>
        <div class="box">
          <div class="fgrid" style="margin-bottom:12px">
            ${field('Categoria', inp(`categorias.${ci}.nome`), 'c6')}
            ${field('Ícone', `<select class="in" data-bind="categorias.${ci}.icone">${ICONES.map(([k, l]) => `<option value="${k}">${l}</option>`).join('')}</select>`, 'c6')}
            ${field('Descrição curta', inp(`categorias.${ci}.descricao`), 'c12')}
          </div>
          ${cat.itens.map((it, ii) => `
          <div class="fgrid ex-item" style="padding:12px 0;border-top:1px solid var(--line, #e5e7eb)">
            ${field('Serviço', inp(`categorias.${ci}.itens.${ii}.nome`), 'c8')}
            ${field('Unidade', inp(`categorias.${ci}.itens.${ii}.unidade`, 'placeholder="projeto, vídeo, mês…"'), 'c4')}
            ${field('Descrição', inp(`categorias.${ci}.itens.${ii}.descricao`), 'c12')}
            ${field('Prazo', inp(`categorias.${ci}.itens.${ii}.prazo`, 'placeholder="10 dias úteis"'), 'c4')}
            ${field(esc(cfg.rotuloCliente || 'Cliente'), money(`categorias.${ci}.itens.${ii}.cliente`), 'c3')}
            ${field(esc(cfg.rotuloAvulso || 'Avulso'), money(`categorias.${ci}.itens.${ii}.avulso`), 'c3')}
            <div class="field c2" style="justify-content:flex-end"><button class="btn btn-sm btn-ghost btn-danger" data-rmit="${ci}.${ii}" title="Remover serviço">${ICON.trash}</button></div>
          </div>`).join('')}
          <button class="btn btn-sm" data-addit="${ci}">${ICON.plus} Serviço</button>
        </div>
      </div>`).join('')}
      <button class="btn" data-act="addcat" style="width:100%;margin-bottom:24px">${ICON.plus} Nova categoria</button>`;

    bind(ed.querySelector('#envio'), envio, () => { cfg.mostrar = envio.mostrar; changed(); });
    ed.querySelectorAll('#textos, [data-cat]').forEach((el) => bind(el, cfg, (path) => {
      if (/\.(nome|icone)$/.test(path) && /^categorias\.\d+\.(nome|icone)$/.test(path)) {
        const ci = Number(path.split('.')[1]);
        const h = ed.querySelector(`[data-cat="${ci}"] .sec-h h3`);
        if (h) h.innerHTML = `${ICON[cfg.categorias[ci].icone] || ICON.tag} ${esc(cfg.categorias[ci].nome || 'Categoria')}`;
      }
      changed();
    }));
  }

  ed.addEventListener('click', async (e) => {
    const t = e.target.closest('button');
    if (!t) return;
    if (t.dataset.addit) {
      cfg.categorias[Number(t.dataset.addit)].itens.push({ nome: '', descricao: '', unidade: 'projeto', prazo: '', cliente: 0, avulso: 0 });
      draw(); changed();
      ed.querySelector(`[data-cat="${t.dataset.addit}"] .ex-item:last-of-type input`)?.focus();
    } else if (t.dataset.rmit) {
      const [ci, ii] = t.dataset.rmit.split('.').map(Number);
      cfg.categorias[ci].itens.splice(ii, 1);
      draw(); changed();
    } else if (t.dataset.rmcat) {
      const cat = cfg.categorias[Number(t.dataset.rmcat)];
      if (!(await confirmDialog(`Excluir a categoria <b>${esc(cat.nome)}</b> e os ${cat.itens.length} serviços dela?`, { ok: 'Excluir', danger: true }))) return;
      cfg.categorias.splice(Number(t.dataset.rmcat), 1);
      draw(); changed();
    } else if (t.dataset.act === 'addcat') {
      cfg.categorias.push({ id: `cat${Date.now()}`, nome: 'Nova categoria', icone: 'tag', ativo: true, descricao: '', itens: [{ nome: '', descricao: '', unidade: 'projeto', prazo: '', cliente: 0, avulso: 0 }] });
      draw(); changed();
      ed.querySelector('[data-cat]:last-of-type')?.scrollIntoView({ behavior: 'smooth' });
    }
  });

  const nomeArquivo = () => { const c = cliente(); return `[${slug(c ? (c.nomeFantasia || c.nome) : 'FIZGO').toUpperCase()}] SERVIÇOS EXTRAS`; };
  const garantir = async () => { if (!pages.length) pages = await renderExtras(st.settings, opcoes()); return pages; };
  main.querySelector('[data-act="pdf"]').onclick = async () => exportPDF(await garantir(), nomeArquivo());
  main.querySelector('[data-act="wa"]').onclick = async () => {
    const c = cliente();
    const e = st.settings.empresa;
    const texto = preencher(st.settings.mensagens.extras || '', { nome: c ? (c.contato || c.nomeFantasia || c.nome) : '', empresa: e.nomeFantasia, slogan: e.slogan })
      .replace('Oi, !', 'Oi!');
    enviarPDFWhatsApp(await garantir(), nomeArquivo(), { tel: c?.whatsapp || '', texto });
  };
  main.querySelectorAll('[data-z]').forEach((b) => b.onclick = () => {
    zoom = Math.min(1.4, Math.max(0.3, (zoom || 1) + Number(b.dataset.z) * 0.1));
    const d = pv.querySelector('.fz-doc'); if (d) d.style.zoom = zoom;
    main.querySelector('#zv').textContent = `${Math.round(zoom * 100)}%`;
  });

  draw();
  preview();
}
