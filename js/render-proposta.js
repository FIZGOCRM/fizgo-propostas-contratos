// Gera as páginas A4 da proposta comercial com a identidade do site da Fizgo
// (fundo escuro, verde-limão, Plus Jakarta Sans + Instrument Serif). Tema claro opcional.
import { esc, inline, md, mdBlocks, fmtDate, addDays, brl, brlShort, pct, num, round2, waLink } from './util.js';
import { calcOpcao, entregaveis, calcProjecao, textoAviso, bulletDoItem } from './calc.js';
import { logoSVG } from './logo.js';
import { paginate, ensureFonts } from './paginate.js';
import { ICON } from './icons.js';
import { casesDaProposta } from './flow.js';

const br = (s) => esc(s).replace(/\n/g, '<br>');
// Títulos: *texto* vira o destaque em itálico serifado (como no site)
const titulo = (s) => inline(s).replace(/\n/g, '<br>');

// ---------- Tema ----------
let T = null;
function hexRgb(h) { const n = parseInt(String(h).replace('#', '').padEnd(6, '0').slice(0, 6), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
const toHex = (rgb) => `#${rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;
const luz = ([r, g, b]) => (0.299 * r + 0.587 * g + 0.114 * b) / 255;
function tema(settings) {
  const t = settings.proposta?.tema || {};
  const escuro = t.modo !== 'claro';
  const acc = /^#[0-9a-f]{6}$/i.test(t.cor || '') ? t.cor : '#C2FF00';
  const rgb = hexRgb(acc);
  // No fundo branco, o verde-limão some: o texto de destaque usa a cor escurecida
  const accTx = escuro ? acc : (luz(rgb) > 0.55 ? toHex(rgb.map((v) => v * 0.48)) : acc);
  const accInk = luz(rgb) > 0.6 ? '#070A08' : '#FFFFFF';
  return {
    escuro, acc, accTx, accInk,
    tx: escuro ? '#F4F7F4' : '#0B110D',
    cls: `pp ${escuro ? 'dark' : 'light'}`,
    style: `--acc:${acc};--acc-tx:${accTx};--acc-ink:${accInk};--acc-soft:rgba(${rgb.join(',')},${escuro ? 0.1 : 0.16})`,
  };
}
const logo = (altura, layout = 'horizontal', cor) => logoSVG({ cor: cor || T.tx, verde: T.acc, altura, layout });
const siteUrl = (site) => (site ? (/^https?:/.test(site) ? site : `https://${site}`) : '');
const siteCurto = (site) => String(site || '').replace(/^https?:\/\//, '').replace(/\/$/, '');

function head(p, settings) {
  const site = settings.empresa.site;
  return `<header class="pp-head">${logo(24)}<div class="pp-head-r"><span>Proposta ${esc(p.numero)}</span>${site ? `<a href="${esc(siteUrl(site))}">${esc(siteCurto(site).replace(/^www\./, ''))}</a>` : ''}</div></header>`;
}
function foot(settings) {
  return `<footer class="pp-foot"><span>${esc(settings.empresa.slogan || '')}</span><span class="pp-pg">{{PG}}</span></footer>`;
}
const pageFn = (p, settings) => (inner, cls = '') => `<section class="page ${T.cls} ${cls}" style="${T.style}">${head(p, settings)}<div class="page-body">${inner}</div>${foot(settings)}</section>`;
const eyebrow = (t) => `<div class="eyebrow">✦ ${esc(t)}</div>`;

export function clienteDaProposta(p, state) {
  return state.clientes.find((c) => c.id === p.clienteId) || {};
}

function qrSVG(texto, size = 92) {
  if (!window.qrcode || !texto) return '';
  const qr = window.qrcode(0, 'M');
  qr.addData(texto); qr.make();
  const n = qr.getModuleCount();
  let d = '';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`;
  return `<svg width="${size}" height="${size}" viewBox="-2 -2 ${n + 4} ${n + 4}" shape-rendering="crispEdges"><rect x="-2" y="-2" width="${n + 4}" height="${n + 4}" fill="#fff"/><path d="${d}" fill="#070A08"/></svg>`;
}

function siteCard(site, texto) {
  return `<a class="site-card" href="${esc(siteUrl(site))}"><div class="qr">${qrSVG(siteUrl(site), 74)}</div><div><span class="pill sm">${ICON.globe} Conheça mais</span><strong>${esc(texto)}</strong><small>${esc(siteCurto(site))}</small></div></a>`;
}

// ---------- Capa ----------
function capa(p, cliente, settings) {
  const validade = addDays(p.data, p.validadeDias);
  const nome = cliente.nomeFantasia || cliente.nome || p.saudacao || 'Cliente';
  const nums = (settings.portfolio.numeros || []).filter((n) => n.valor).slice(0, 3);
  const site = settings.empresa.site;
  return `<section class="page ${T.cls} cover" style="${T.style}">
    <div class="cv-glow"></div><div class="cv-grid"></div>
    <div class="cv-top">${logo(44)}<span class="cv-num">Nº ${esc(p.numero)}</span></div>
    <div class="cv-mid">
      <span class="pill">✦ Proposta comercial</span>
      <h1 class="cv-frase t">${titulo(p.capaFrase || settings.proposta.capaFrase || '')}</h1>
      <div class="cv-for">
        <span>Preparada especialmente para</span>
        <strong>${esc(nome)}</strong>
        ${p.titulo ? `<em>${esc(p.titulo)}</em>` : ''}
      </div>
    </div>
    ${nums.length ? `<div class="cv-proof">${nums.map((n) => `<div><i></i><strong>${esc(n.valor)}</strong><span>${esc(n.label)}</span></div>`).join('')}</div>` : ''}
    <div class="cv-bot"><span>Emitida em ${fmtDate(p.data)}</span><span>Válida até ${fmtDate(validade)}</span>${site ? `<a href="${esc(siteUrl(site))}">${esc(siteCurto(site))}</a>` : ''}</div>
  </section>`;
}

// ---------- Introdução e processo ----------
function kickNote(regras) {
  return `Todos os projetos têm taxa de kickoff de <b>${pct(regras.kickoffPct)}</b> do valor da mensalidade. Para valores inferiores a ${brlShort(regras.kickoffLimite)}, a taxa é de ${pct(regras.kickoffPctAbaixo)}.`;
}
function intro(p, settings, page) {
  const cfg = settings.proposta;
  const etapas = cfg.etapas || [];
  const processo = p.mostrarProcesso !== false && etapas.length ? `
    <h3 class="sec-t">${br(cfg.processoTitulo)}</h3>
    <div class="steps" style="--n:${etapas.length}">
      ${etapas.map((e, i) => `<div class="step ${i === etapas.length - 1 ? 'last' : ''}"><b>${String(i + 1).padStart(2, '0')}</b><strong>${esc(e.titulo)}</strong><span>${esc(e.texto)}</span></div>`).join('')}
    </div>` : '';
  return page(`
    ${eyebrow(`Olá, ${p.saudacao || 'tudo bem?'}`)}
    <h1 class="h1 t">${inline(String(cfg.introTitulo || '').replace(/\s*\n\s*/g, ' '))}</h1>
    <div class="lead">${md(p.introTexto || cfg.intro)}</div>
    <div class="spacer"></div>
    ${processo}
    <div class="spacer"></div>
    ${p.opcoes.some((o) => calcOpcao(o, settings.regras).kickoff) ? `<div class="note-box">${ICON.zap}<span>${kickNote(settings.regras)}</span></div>` : ''}`, 'intro');
}

// ---------- Quem somos (números, selos, equipe e marcas) ----------
function quemSomos(p, settings, page) {
  const pf = settings.portfolio;
  if (p.paginas?.quemSomos === false) return [];
  const numeros = (pf.numeros || []).filter((n) => n.valor).slice(0, 4);
  const selos = (pf.selos || []).filter((s) => s.titulo).slice(0, 3);
  const equipe = (pf.equipe || []).filter((m) => m.nome);
  const logos = (pf.logosClientes || []).filter((l) => l.img);
  if (!String(pf.quemSomos || '').trim() && !numeros.length && !selos.length && !equipe.length) return [];
  const blocks = [
    { html: `<div>${eyebrow('Quem somos')}<h2 class="h2 t">${titulo(pf.quemSomosTitulo || 'Quem somos')}</h2></div>`, keep: true },
  ];
  if (pf.manifesto) blocks.push({ html: `<blockquote class="manifesto">“${esc(pf.manifesto)}”</blockquote>` });
  if (pf.quemSomos) blocks.push({ html: `<div class="lead">${md(pf.quemSomos)}</div>` });
  if (numeros.length) blocks.push({ html: `<div class="nums" style="--n:${numeros.length}">${numeros.map((n) => `<div class="num"><strong>${esc(n.valor)}</strong><span>${esc(n.label)}</span></div>`).join('')}</div>` });
  if (selos.length) blocks.push({ html: `<div class="selos" style="--n:${selos.length}">${selos.map((s) => `<div class="selo"><div class="selo-ico">${ICON.award}</div><strong>${esc(s.titulo)}</strong><span>${esc(s.texto || '')}</span><em>✦ Certificação verificada</em></div>`).join('')}</div>` });
  if (equipe.length) {
    blocks.push({ html: `<h3 class="sec-t">Quem vai cuidar de você</h3>`, keep: true });
    blocks.push({ html: `<div class="team" style="--n:${Math.min(equipe.length, 4)}">${equipe.slice(0, 8).map((m) => `<div class="member">${m.foto ? `<img src="${m.foto}" alt="">` : `<div class="ph">${esc(m.nome[0])}</div>`}<b>${esc(m.nome)}</b><span>${esc(m.cargo || '')}</span></div>`).join('')}</div>` });
  }
  if (logos.length) {
    blocks.push({ html: `<h3 class="sec-t">Marcas que confiam na gente</h3>`, keep: true });
    blocks.push({ html: `<div class="logos">${logos.slice(0, 12).map((l) => `<div class="lg"><img src="${l.img}" alt="${esc(l.nome || '')}"></div>`).join('')}</div>` });
  }
  const site = settings.empresa.site;
  if (site) blocks.push({ html: siteCard(site, 'Veja vídeos, cases e depoimentos de clientes no nosso site') });
  return paginate(blocks, () => page('', 'about')).map((b) => page(b, 'about'));
}

// ---------- Método e comparativo com o mercado ----------
function metodo(p, settings, page) {
  const pf = settings.portfolio;
  if (p.paginas?.metodo === false) return [];
  const pilares = (pf.pilares || []).filter((x) => x.titulo);
  const dif = pf.diferenciais || {};
  const linhas = (dif.linhas || []).filter((l) => l.item);
  if (!pilares.length && !linhas.length) return [];
  const blocks = [];
  if (pilares.length) {
    blocks.push({ html: `<div>${eyebrow('Metodologia')}<h2 class="h2 t">${titulo(pf.metodoTitulo || 'Nosso método')}</h2>${pf.metodoTexto ? `<p class="lead">${inline(pf.metodoTexto)}</p>` : ''}</div>`, keep: true });
    blocks.push({ html: `<div class="pilares">${pilares.map((x, i) => `<div class="pilar"><b>${String(i + 1).padStart(2, '0')}</b><div><strong>${esc(x.titulo)}</strong><span>${esc(x.texto || '')}</span></div></div>`).join('')}</div>` });
  }
  if (linhas.length) {
    const cols = (dif.colunas || []).slice(0, 2);
    const nome = settings.empresa.nomeFantasia || 'Nós';
    const mark = (v) => (v ? `<span class="ok">${ICON.check}</span>` : '<span class="x">✕</span>');
    blocks.push({ html: `<h3 class="h3 t ${pilares.length ? 'mt' : ''}">${titulo(dif.titulo || 'Por que nós?')}</h3>`, keep: true });
    blocks.push({ html: `<table class="dif"><thead><tr><th></th>${cols.map((c) => `<th>${esc(c)}</th>`).join('')}<th class="nos">${esc(nome)}</th></tr></thead>
      <tbody>${linhas.map((l) => `<tr><td>${esc(l.item)}</td>${cols.map((_, i) => `<td>${mark(i ? l.b : l.a)}</td>`).join('')}<td class="nos"><span class="ok">${ICON.check}</span>${l.nos ? `<small>${esc(l.nos)}</small>` : ''}</td></tr>`).join('')}</tbody></table>` });
  }
  return paginate(blocks, () => page('', 'metodo')).map((b) => page(b, 'metodo'));
}

// ---------- Diagnóstico e projeção ----------
function estrategia(p, opcoes, regras, settings, page) {
  const d = p.diagnostico || {};
  const pr = p.projecao || {};
  const linhas = (t) => String(t || '').split('\n').map((x) => x.replace(/^\s*[-•]\s*/, '').trim()).filter(Boolean);
  let html = '';
  if (d.ativo && (linhas(d.desafios).length || linhas(d.objetivos).length)) {
    html += `${eyebrow('Diagnóstico')}<h2 class="h2 t">Entendendo o seu <em>momento</em></h2>
    ${d.resumo ? `<p class="lead">${inline(d.resumo)}</p>` : ''}
    <div class="diag">
      <div class="diag-card"><div class="diag-ico">${ICON.target}</div><h4>Desafios atuais</h4><ul>${linhas(d.desafios).map((x) => `<li>${inline(x)}</li>`).join('')}</ul></div>
      <div class="diag-card go"><div class="diag-ico">${ICON.trending}</div><h4>Onde vamos chegar juntos</h4><ul>${linhas(d.objetivos).map((x) => `<li>${inline(x)}</li>`).join('')}</ul></div>
    </div>`;
  }
  if (pr.ativo) {
    const op = opcoes.find((o) => o.id === pr.opcaoId) || opcoes.find((o) => o.recomendado) || opcoes[0];
    const c = op ? calcOpcao(op, regras) : { final: 0 };
    const r = calcProjecao(pr, c.final);
    const maxBar = Math.max(r.investimento, r.receita, 1);
    html += `<div class="${html ? 'mt' : ''}">${html ? '' : eyebrow('Projeção')}<h2 class="h2 t">Projeção de <em>resultados</em></h2></div>
    <p class="lead">Simulação com investimento em anúncios de <strong>${brlShort(r.verba)}/mês</strong>${op ? ` no plano <strong>${esc(op.nome)}</strong>` : ''}.</p>
    <div class="proj-flow">
      <div class="pf"><span>Verba em anúncios</span><strong>${brlShort(r.verba)}</strong><small>por mês</small></div>
      <div class="pf-arrow">${ICON.arrow}</div>
      <div class="pf"><span>Contatos / leads</span><strong>≈ ${r.leads.toLocaleString('pt-BR')}</strong><small>CPL estimado ${brl(r.cpl)}</small></div>
      <div class="pf-arrow">${ICON.arrow}</div>
      <div class="pf"><span>Novos clientes</span><strong>≈ ${r.clientes.toLocaleString('pt-BR')}</strong><small>conversão de ${pct(r.conv)}</small></div>
      <div class="pf-arrow">${ICON.arrow}</div>
      <div class="pf hi"><span>Faturamento estimado</span><strong>${brlShort(r.receita)}</strong><small>ticket médio ${brlShort(r.ticket)}</small></div>
    </div>
    <div class="roi">
      <div class="roi-big"><strong>${r.roi.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}x</strong><span>retorno sobre o investimento total do mês</span></div>
      <div class="roi-bars">
        <div class="bar-row"><span>Investimento (verba + plano)</span><div class="bar"><i style="width:${(r.investimento / maxBar) * 100}%"></i></div><b>${brlShort(r.investimento)}</b></div>
        <div class="bar-row"><span>Faturamento estimado</span><div class="bar go"><i style="width:${(r.receita / maxBar) * 100}%"></i></div><b>${brlShort(r.receita)}</b></div>
      </div>
    </div>
    <p class="disclaimer">${esc(settings.proposta.disclaimerProjecao)}</p>`;
  }
  return html ? page(html, 'estrategia') : '';
}

// ---------- Resultados: cases e depoimentos ----------
function resultados(p, settings, page) {
  if (p.paginas?.resultados === false) return [];
  const cases = casesDaProposta(p);
  const deps = (settings.portfolio.depoimentos || []).filter((d) => d.texto && d.ativo !== false).slice(0, 4);
  if (!cases.length && !deps.length) return [];
  const blocks = [{ html: `<div>${eyebrow('Prova social')}<h2 class="h2 t">Resultados que <em>falam por nós</em></h2></div>`, keep: true }];
  cases.forEach((c) => {
    const mets = (c.metricas || []).filter((m) => m.valor).slice(0, 3);
    blocks.push({ html: `<div class="case ${c.imagem ? 'has-img' : ''}">
      ${c.imagem ? `<div class="case-img"><img src="${c.imagem}" alt=""></div>` : ''}
      <div class="case-body">
        <div class="case-top">${c.logo ? `<img class="case-logo" src="${c.logo}" alt="">` : ''}<div>${c.segmento ? `<span>${esc(c.segmento)}</span>` : ''}<b>${esc(c.cliente)}</b></div></div>
        ${c.desafio ? `<p><em>Desafio</em>${inline(c.desafio)}</p>` : ''}
        ${c.solucao ? `<p><em>O que fizemos</em>${inline(c.solucao)}</p>` : ''}
        ${mets.length ? `<div class="case-mets">${mets.map((m) => `<div><strong>${esc(m.valor)}</strong><span>${esc(m.label)}</span></div>`).join('')}</div>` : ''}
      </div></div>` });
  });
  if (deps.length) {
    blocks.push({ html: `<h3 class="sec-t">O que dizem nossos clientes</h3>`, keep: true });
    for (let i = 0; i < deps.length; i += 2) {
      blocks.push({ html: `<div class="deps">${deps.slice(i, i + 2).map((d) => `<div class="dep"><div class="stars">★★★★★</div><p>“${esc(d.texto)}”</p><div class="dep-who">${d.foto ? `<img src="${d.foto}" alt="">` : ''}<div><b>${esc(d.nome)}</b><span>${esc(d.empresa || '')}</span></div></div></div>`).join('')}</div>` });
    }
  }
  return paginate(blocks, () => page('', 'results')).map((b) => page(b, 'results'));
}

function avisosHtml(p, settings) {
  const off = p.avisosOff || [];
  const list = settings.avisos.filter((a) => a.ativo && !off.includes(a.id));
  if (!list.length) return '';
  return `<ol class="avisos">${list.map((a, i) => `<li><b>[${i + 1}]</b> ${esc(textoAviso(a.texto, settings.regras))}</li>`).join('')}</ol>`;
}

// Prova social ao lado do preço: um depoimento (alternando entre as opções) e os números
function provaPlano(settings, idx) {
  const pf = settings.portfolio;
  const deps = (pf.depoimentos || []).filter((d) => d.texto && d.ativo !== false);
  const d = deps.length ? deps[idx % deps.length] : null;
  const nums = (pf.numeros || []).filter((n) => n.valor).slice(0, 3);
  if (!d && !nums.length) return '';
  return `<div class="proof ${d ? '' : 'only-nums'}">
    ${d ? `<div class="proof-dep"><div class="stars">★★★★★</div><p>“${esc(d.texto)}”</p><b>${esc(d.nome)}${d.empresa ? ` · <span>${esc(d.empresa)}</span>` : ''}</b></div>` : ''}
    ${nums.length ? `<div class="proof-nums">${nums.map((n) => `<div><strong>${esc(n.valor)}</strong><span>${esc(n.label)}</span></div>`).join('')}</div>` : ''}
  </div>`;
}

// ---------- Uma página por opção de plano ----------
function opcaoPage(p, op, idx, total, settings, page) {
  const regras = settings.regras;
  const c = calcOpcao(op, regras);
  const validade = addDays(p.data, p.validadeDias);
  const itens = entregaveis(op);
  const bonus = (op.bonus || []).filter((b) => String(b.nome || '').trim());

  let preco;
  if (c.temMensal) {
    preco = `
      ${c.inicialMeses ? `
      <div class="price-tag">${c.inicialMeses} primeiros meses</div>
      <div class="price-old">de ${brlShort(c.tabela)}</div>
      <div class="price-new">${brlShort(c.inicialFinal)}<span>por mês</span></div>
      <div class="price-next"><span>A partir do ${c.inicialMeses + 1}º mês</span><b>${brlShort(c.final)}/mês</b></div>
      ${c.pontualidade ? `<div class="price-note">Valores já com ${brlShort(c.pontualidade)} de desconto por pagamento em dia. Sem o desconto: <b>${brl(c.inicialCheia)}</b> e depois <b>${brl(c.cheia)}</b>.</div>` : ''}` : `
      ${c.tabela > c.final + 0.001 ? `<div class="price-old">de ${brlShort(c.tabela)}</div>` : ''}
      <div class="price-new">${brlShort(c.final)}<span>por mês</span></div>
      ${c.pontualidade ? `<div class="price-note">Já com ${brlShort(c.pontualidade)} de desconto por pagamento em dia. Sem o desconto: <b>${brl(c.cheia)}</b></div>` : ''}`}
      ${c.temUnico ? `<div class="price-extra"><span>+ entrega única</span><strong>${brlShort(c.unicoTotal)}</strong><small>${pct(regras.entradaMaterialPct)} de entrada e o restante na entrega</small></div>` : ''}`;
  } else {
    const tabelaUnico = op.precoModo === 'fixo' && num(op.valorTabela) > c.unicoTotal ? num(op.valorTabela) : 0;
    preco = `
      ${tabelaUnico ? `<div class="price-old">de ${brlShort(tabelaUnico)}</div>` : ''}
      <div class="price-new">${brlShort(c.unicoTotal)}<span>investimento único</span></div>
      <div class="price-note">${pct(regras.entradaMaterialPct)} de entrada (${brlShort(c.unicoEntrada)}) e ${brlShort(c.unicoSaldo)} na entrega dos materiais</div>`;
  }

  const kpis = [];
  if (c.temMensal && c.kickoff) kpis.push(['Taxa de kickoff', brlShort(c.kickoff), `${pct(c.kickoffPct)} · pago no início`]);
  if (c.inicialMeses && c.final > c.inicialFinal) kpis.push(['Condição de entrada', `${brlShort(round2((c.final - c.inicialFinal) * c.inicialMeses))}`, `a menos nos ${c.inicialMeses} primeiros meses`]);
  if (c.economiaMes > 0) kpis.push(['Você economiza', `${brlShort(c.economiaMes)}<small>/mês</small>`, `${brlShort(c.economiaAno)} em ${c.meses} meses`]);
  if (c.bonusTotal > 0) kpis.push(['Bônus inclusos', brlShort(c.bonusTotal), 'de valor agregado, sem custo']);
  if (c.temMensal && c.temUnico) kpis.push(['Investimento inicial', brlShort(c.investimentoInicial), 'kickoff + entrada do material']);
  if (c.temMensal && num(regras.mesesSemFidelidade) > 0) kpis.push(['Sem fidelidade', `${regras.mesesSemFidelidade} meses`, 'iniciais, sem multa de saída']);

  return page(`
    ${eyebrow(`Investimento${total > 1 ? ` · opção ${idx + 1} de ${total}` : ''}`)}
    <div class="plan-head">
      <div><h2 class="h2">${esc(op.nome || 'Plano')}</h2>${op.descricao ? `<p class="lead">${esc(op.descricao)}</p>` : ''}</div>
      ${op.recomendado ? `<span class="badge">${ICON.star} Recomendado</span>` : ''}
    </div>
    <div class="plan ${op.recomendado ? 'rec' : ''}">
      <div class="plan-main">
        <div class="col-t">O que está incluso</div>
        <ul class="checks">${itens.map((i) => `<li>${ICON.check}<span>${i}</span></li>`).join('')}</ul>
        ${bonus.length ? `<div class="bonus"><div class="bonus-head">${ICON.gift} Bônus para fechamento</div>
          <ul>${bonus.map((b) => `<li><span>${inline(b.nome)}</span>${num(b.valor) ? `<em>${brlShort(b.valor)}</em>` : ''}</li>`).join('')}</ul></div>` : ''}
      </div>
      <div class="plan-price"><div class="col-t">Investimento</div>${preco}</div>
    </div>
    ${kpis.length ? `<div class="kpis" style="--n:${kpis.length}">${kpis.map(([l, v, s]) => `<div class="kpi"><span>${l}</span><strong>${v}</strong><small>${s}</small></div>`).join('')}</div>` : ''}
    ${provaPlano(settings, idx)}
    <div class="validity">${ICON.clock}<span>Proposta válida por ${p.validadeDias} dias, até <b>${fmtDate(validade)}</b>. ${esc(settings.proposta.rodapeValidade)}.</span></div>
    ${c.temMensal ? `<div style="margin-top:8px;padding:8px 12px;background:#F8FBFB;border:1px solid #D6E3E3;border-radius:8px;font-size:11px;line-height:1.4">
      <div style="font-weight:700;color:var(--text);margin-bottom:2px;display:flex;align-items:center;gap:5px">
        <span>🔒 Escopo Estritamente Delimitado & Tabela de Extras</span>
      </div>
      <div style="color:var(--muted)">
        Somente os itens e quantidades discriminados acima integram o escopo mensal. Demandas adicionais seguem a tabela comercial Fizgo:
        <span style="color:var(--text);font-weight:600">Arte extra: R$ 60</span> ·
        <span style="color:var(--text);font-weight:600">Vídeo extra editado: R$ 300</span> ·
        <span style="color:var(--text);font-weight:600">Perna extra de tráfego: R$ 1.390/mês</span> ·
        <span style="color:var(--text);font-weight:600">Sessão presencial extra (até 2h): R$ 300</span>.
        <span style="display:block;margin-top:2px">Exclusões: SAC/resposta a mensagens diretas (DMs) e verba de anúncios paga diretamente às plataformas.</span>
      </div>
    </div>` : ''}
    <div class="spacer"></div>
    ${avisosHtml(p, settings)}`, 'opcao');
}

function comparativo(p, opcoes, settings, page) {
  const regras = settings.regras;
  const calcs = opcoes.map((o) => calcOpcao(o, regras));
  const keys = [];
  const label = {};
  opcoes.forEach((o) => (o.itens || []).forEach((i) => {
    const k = i.ref || i.nome;
    if (!keys.includes(k)) { keys.push(k); label[k] = i.semQtd || !String(i.bullet || '').includes('{qtd}') ? bulletDoItem(i) : i.nome; }
  }));
  const cell = (o, k) => {
    const it = (o.itens || []).find((i) => (i.ref || i.nome) === k);
    if (!it) return '<span class="no">—</span>';
    const un = /hora/i.test(it.unidade || '') ? ' h/mês' : '';
    return !it.semQtd && String(it.bullet || '').includes('{qtd}') ? `<b>${it.qtd}${un}</b>` : `<span class="ok">${ICON.check}</span>`;
  };
  const rec = opcoes.findIndex((o) => o.recomendado);
  const mensal = calcs.some((c) => c.temMensal);
  const td = (i, inner) => `<td class="${i === rec ? 'rec' : ''}">${inner}</td>`;
  return page(`
    ${eyebrow('Comparativo')}
    <h2 class="h2 t">Compare as <em>opções</em></h2>
    <table class="cmp">
      <thead><tr><th></th>${opcoes.map((o, i) => `<th class="${i === rec ? 'rec' : ''}">${i === rec ? `<span class="badge sm">${ICON.star} Recomendado</span>` : ''}${esc(o.nome)}</th>`).join('')}</tr></thead>
      <tbody>
        ${keys.map((k) => `<tr><td>${inline(label[k])}</td>${opcoes.map((o, i) => td(i, cell(o, k))).join('')}</tr>`).join('')}
        ${opcoes.some((o) => (o.bonus || []).some((b) => b.nome)) ? `<tr><td>Bônus para fechamento</td>${opcoes.map((o, i) => td(i, (o.bonus || []).filter((b) => b.nome).map((b) => esc(b.nome)).join('<br>') || '<span class="no">—</span>')).join('')}</tr>` : ''}
      </tbody>
      <tfoot>
        ${mensal ? `<tr class="tot"><td>Mensalidade</td>${calcs.map((c, i) => td(i, c.temMensal ? `${c.tabela > c.final ? `<s>${brlShort(c.tabela)}</s>` : ''}<strong>${brlShort(c.final)}</strong>${c.inicialMeses ? `<br><small>${brlShort(c.inicialFinal)} nos ${c.inicialMeses} primeiros meses</small>` : ''}` : '—')).join('')}</tr>
        <tr><td>Taxa de kickoff</td>${calcs.map((c, i) => td(i, c.kickoff ? brlShort(c.kickoff) : '—')).join('')}</tr>` : ''}
        <tr class="${mensal ? '' : 'tot'}"><td>${mensal ? 'Entrega única' : 'Investimento'}</td>${calcs.map((c, i) => td(i, c.unicoTotal ? brlShort(c.unicoTotal) : '—')).join('')}</tr>
      </tfoot>
    </table>
    ${mensal ? `<p class="disclaimer">Valores mensais já com o desconto de pontualidade de ${brlShort(regras.descontoPontualidade)}.</p>` : ''}`, 'cmp-page');
}

function escopos(p, page) {
  const out = [];
  for (const s of p.secoes || []) {
    if (!String(s.texto || '').trim() && !s.titulo) continue;
    const blocks = [{ html: `<div>${eyebrow('Escopo')}<h2 class="h2">${inline(s.titulo || '')}</h2></div>`, keep: true }];
    mdBlocks(s.texto).forEach((b) => blocks.push({ html: `<div class="esc-block">${b}</div>`, keep: /^<h4/.test(b) }));
    paginate(blocks, () => page('', 'escopo')).forEach((body) => out.push(page(`<div class="escopo-text">${body}</div>`, 'escopo')));
  }
  return out;
}

// ---------- Encerramento: chamada para ação ----------
function encerramento(p, cliente, settings) {
  const e = settings.empresa;
  // Sem kickoff (projeto de entrega única), o passo do kickoff vira o pagamento da entrada
  const semKickoff = !p.opcoes.some((o) => calcOpcao(o, settings.regras).kickoff);
  const passos = (settings.proposta.proximosPassos || []).map((s) => (semKickoff && /kickoff/i.test(s.titulo)
    ? { titulo: 'Entrada', texto: `Pagamento de ${pct(settings.regras.entradaMaterialPct)} no início do projeto via Pix.` } : s));
  const nome = cliente.nomeFantasia || cliente.nome || 'a sua empresa';
  const cta = (settings.proposta.ctaTitulo || 'Vamos *acelerar* {cliente}?').replace('{cliente}', nome);
  const site = siteUrl(e.site);
  const wa = e.whatsapp ? waLink(e.whatsapp, `Olá! Vi a proposta ${p.numero} e quero conversar sobre o próximo passo.`) : '';
  const video = String(p.videoUrl || '').trim();
  const contatos = [e.whatsapp && [ICON.whatsapp, e.whatsapp], e.email && [ICON.mail, e.email], e.instagram && [ICON.instagram, e.instagram]].filter(Boolean);
  const qrs = [
    video && { url: video, tag: `${ICON.play} Vídeo`, t: 'Gravei um vídeo explicando a sua proposta', s: 'Aponte a câmera do celular' },
    site && { url: site, tag: `${ICON.globe} Site`, t: 'Conheça os nossos cases, serviços e método', s: siteCurto(e.site) },
  ].filter(Boolean);
  return `<section class="page ${T.cls} cover closing" style="${T.style}">
    <div class="cv-glow low"></div><div class="cv-grid"></div>
    <div class="cv-top">${logo(30)}<span class="cv-num">Nº ${esc(p.numero)}</span></div>
    <div class="cl-inner">
      ${eyebrow('Próximos passos')}
      <h1 class="cta-h t">${titulo(cta)}</h1>
      <div class="next">${passos.map((s, i) => `<div class="next-step"><b>${String(i + 1).padStart(2, '0')}</b><strong>${esc(s.titulo)}</strong><span>${esc(s.texto)}</span></div>`).join('')}</div>
      ${p.observacoes ? `<div class="cl-obs"><strong>Observações</strong>${md(p.observacoes)}</div>` : ''}
      ${wa ? `<a class="cta-btn" href="${esc(wa)}">${ICON.whatsapp} Quero começar: falar no WhatsApp ➔</a>` : ''}
      ${qrs.length ? `<div class="qrs" style="--n:${qrs.length}">${qrs.map((q) => `<a class="qr-card" href="${esc(q.url)}"><div class="qr">${qrSVG(q.url)}</div><div><span class="pill sm">${q.tag}</span><strong>${esc(q.t)}</strong><small>${esc(q.s)}</small></div></a>`).join('')}</div>` : ''}
    </div>
    <div class="cl-foot">
      ${contatos.length ? `<div class="contacts">${contatos.map(([i, t]) => `<span>${i}${esc(t)}</span>`).join('')}</div>` : ''}
      <div class="cl-slogan">${esc(e.slogan || '')}</div>
    </div>
  </section>`;
}

export async function renderProposta(p, state) {
  await ensureFonts();
  const settings = state.settings;
  T = tema(settings);
  const page = pageFn(p, settings);
  const cliente = clienteDaProposta(p, state);
  const opcoes = (p.opcoes || []).filter((o) => (o.itens || []).length || o.nome);
  const pages = [capa(p, cliente, settings), intro(p, settings, page)];
  pages.push(...quemSomos(p, settings, page));
  pages.push(...metodo(p, settings, page));
  const est = estrategia(p, opcoes, settings.regras, settings, page);
  if (est) pages.push(est);
  pages.push(...resultados(p, settings, page));
  opcoes.forEach((op, i) => pages.push(opcaoPage(p, op, i, opcoes.length, settings, page)));
  if (opcoes.length > 1 && p.mostrarComparativo !== false) pages.push(comparativo(p, opcoes, settings, page));
  pages.push(...escopos(p, page));
  pages.push(encerramento(p, cliente, settings));
  return pages.map((h, i) => h.replace('{{PG}}', String(i + 1).padStart(2, '0')));
}

// O mesmo tema (cores e fontes do site) para outros documentos comerciais
export const temaProposta = tema;
