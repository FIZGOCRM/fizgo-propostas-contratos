// Tabela de serviços extras: documento A4 com a identidade da proposta, para mandar quando o cliente
// pede valores de sites, vídeos, podcast etc. Mostra o preço de cliente Fizgo e o avulso.
import { esc, inline, fmtDate, addDays, today, brlShort, num, waLink } from './util.js';
import { logoSVG } from './logo.js';
import { paginate, ensureFonts } from './paginate.js';
import { ICON } from './icons.js';
import { temaProposta } from './render-proposta.js';

const titulo = (s) => inline(s).replace(/\n/g, '<br>');
const siteUrl = (site) => (site ? (/^https?:/.test(site) ? site : `https://${site}`) : '');
const siteCurto = (site) => String(site || '').replace(/^https?:\/\//, '').replace(/\/$/, '').replace(/^www\./, '');

// cfg = settings.extras; opcoes = { mostrar: 'ambos'|'cliente'|'avulso', para: nome do cliente }
export function extrasBlocks(cfg, settings, { mostrar = 'ambos', para = '' } = {}) {
  const cols = mostrar === 'ambos' ? ['cliente', 'avulso'] : [mostrar];
  const rot = { cliente: cfg.rotuloCliente || 'Cliente Fizgo', avulso: cfg.rotuloAvulso || 'Avulso' };
  const preco = (v) => (num(v) ? brlShort(v) : 'Sob consulta');
  const blocks = [];
  const push = (html, keep = false) => blocks.push({ html, keep });

  push(`<div class="ex-hero">
    <span class="pill">✦ Tabela de serviços ${new Date().getFullYear()}</span>
    <h1 class="h1 t">${titulo(cfg.titulo || 'Serviços *extras*')}</h1>
    ${cfg.subtitulo ? `<p class="lead">${esc(cfg.subtitulo)}</p>` : ''}
    ${para ? `<div class="ex-para"><span>Preparada para</span><strong>${esc(para)}</strong></div>` : ''}
    ${mostrar === 'ambos' ? `<div class="ex-legend"><span class="ex-dot cli"></span><b>${esc(rot.cliente)}</b><small>quem tem plano mensal ativo</small><span class="ex-dot av"></span><b>${esc(rot.avulso)}</b><small>contratação avulsa</small></div>` : ''}
  </div>`, true);

  (cfg.categorias || []).filter((c) => c.ativo !== false && (c.itens || []).some((i) => i.nome)).forEach((cat) => {
    push(`<div class="ex-cat"><div class="ex-ico">${ICON[cat.icone] || ICON.tag}</div><div><h2>${esc(cat.nome)}</h2>${cat.descricao ? `<p>${esc(cat.descricao)}</p>` : ''}</div>
      <div class="ex-cols">${cols.map((k) => `<span class="${k}">${esc(rot[k])}</span>`).join('')}</div></div>`, true);
    cat.itens.filter((i) => i.nome).forEach((it, n, arr) => {
      const meta = [it.unidade && `por ${esc(it.unidade)}`, it.prazo && `prazo: ${esc(it.prazo)}`].filter(Boolean).join(' · ');
      push(`<div class="ex-row ${n === arr.length - 1 ? 'last' : ''}">
        <div class="ex-name"><strong>${esc(it.nome)}</strong>${it.descricao ? `<span>${esc(it.descricao)}</span>` : ''}${meta ? `<small>${meta}</small>` : ''}</div>
        <div class="ex-cols">${cols.map((k) => `<b class="${k}">${preco(it[k])}</b>`).join('')}</div>
      </div>`);
    });
  });

  const cond = String(cfg.condicoes || '').split('\n').map((x) => x.trim()).filter(Boolean);
  const e = settings.empresa;
  const validade = addDays(today(), num(cfg.validadeDias) || 30);
  push(`<div class="ex-end">
    ${cond.length ? `<div class="ex-cond"><div class="col-t">Condições</div><ul>${cond.map((c) => `<li>${ICON.check}<span>${esc(c)}</span></li>`).join('')}</ul>
      <p>Valores válidos até <b>${fmtDate(validade)}</b>.</p></div>` : ''}
    <a class="ex-cta" href="${esc(waLink(e.whatsapp, 'Olá! Vi a tabela de serviços extras e quero um orçamento.'))}">
      <span>Gostou de algum serviço?</span><strong>Chama a gente no WhatsApp ${ICON.arrow}</strong>
      <small>${esc(e.whatsapp || '')}${e.site ? ` · ${esc(siteCurto(e.site))}` : ''}</small></a>
  </div>`);
  return blocks;
}

export async function renderExtras(settings, opcoes = {}) {
  await ensureFonts();
  const T = temaProposta(settings);
  const cfg = settings.extras || {};
  const e = settings.empresa;
  const shell = `<section class="page ${T.cls} extras" style="${T.style}">
    <header class="pp-head">${logoSVG({ cor: T.tx, verde: T.acc, altura: 24, layout: 'horizontal' })}<div class="pp-head-r"><span>Serviços extras</span>${e.site ? `<a href="${esc(siteUrl(e.site))}">${esc(siteCurto(e.site))}</a>` : ''}</div></header>
    <div class="page-body">{{BODY}}</div>
    <footer class="pp-foot"><span>${esc(e.slogan || '')}</span><span class="pp-pg">{{PG}}</span></footer></section>`;
  const bodies = paginate(extrasBlocks(cfg, settings, opcoes), () => shell.replace('{{BODY}}', ''));
  return bodies.map((b, i) => shell.replace('{{PG}}', String(i + 1).padStart(2, '0')).replace('{{BODY}}', () => b));
}
