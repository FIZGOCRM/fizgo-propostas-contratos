// Utilitários gerais: formatação BR, datas, valores por extenso, markdown leve e toasts.

export const $ = (s, el = document) => el.querySelector(s);
export const $$ = (s, el = document) => [...el.querySelectorAll(s)];

export const uid = (p = 'id') => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
export const clone = (o) => JSON.parse(JSON.stringify(o));

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const num = (v) => {
  if (typeof v === 'number') return isFinite(v) ? v : 0;
  if (v == null || v === '') return 0;
  let s = String(v).trim().replace(/[^\d,.-]/g, '');
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  const n = parseFloat(s);
  return isFinite(n) ? n : 0;
};

export const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

// R$ 1.690,00
export const brl = (v) => (Number(v) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
// R$ 1.690 (sem centavos quando inteiro) — usado nas propostas, como nos PDFs originais
export const brlShort = (v) => {
  const n = Number(v) || 0;
  return Number.isInteger(round2(n))
    ? 'R$ ' + n.toLocaleString('pt-BR', { maximumFractionDigits: 0 })
    : brl(n);
};
export const pct = (v) => `${(Number(v) || 0).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%`;

// ---------- Datas ----------
export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const parseISO = (iso) => {
  if (!iso) return null;
  const [y, m, d] = String(iso).split('T')[0].split('-').map(Number);
  return new Date(y, m - 1, d);
};
const toISO = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const addDays = (iso, n) => { const d = parseISO(iso) || new Date(); d.setDate(d.getDate() + Number(n || 0)); return toISO(d); };
export const addMonths = (iso, n) => { const d = parseISO(iso) || new Date(); d.setMonth(d.getMonth() + Number(n || 0)); return toISO(d); };
export const diffDays = (fromISO, toISOStr) => Math.round((parseISO(toISOStr) - parseISO(fromISO)) / 86400000);
export const fmtDate = (iso) => { const d = parseISO(iso); return d ? d.toLocaleDateString('pt-BR') : '—'; };
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
export const dataExtenso = (iso) => { const d = parseISO(iso) || new Date(); return `${String(d.getDate()).padStart(2, '0')} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`; };

// ---------- Números por extenso ----------
const UN = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
const DZ = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
const CT = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

function ate999(n) {
  if (n === 0) return '';
  if (n === 100) return 'cem';
  const c = Math.floor(n / 100), r = n % 100;
  const parts = [];
  if (c) parts.push(CT[c]);
  if (r) parts.push(r < 20 ? UN[r] : DZ[Math.floor(r / 10)] + (r % 10 ? ' e ' + UN[r % 10] : ''));
  return parts.join(' e ');
}

export function inteiroExtenso(n) {
  n = Math.floor(Math.abs(Number(n) || 0));
  if (n === 0) return 'zero';
  const grupos = [];
  let x = n;
  while (x > 0) { grupos.push(x % 1000); x = Math.floor(x / 1000); }
  const nomes = [['', ''], ['mil', 'mil'], ['milhão', 'milhões'], ['bilhão', 'bilhões']];
  const partes = [];
  for (let i = grupos.length - 1; i >= 0; i--) {
    const g = grupos[i];
    if (!g) continue;
    let txt = i === 1 && g === 1 ? 'mil' : ate999(g) + (i ? ' ' + nomes[i][g > 1 ? 1 : 0] : '');
    partes.push({ txt, g, i });
  }
  // Conector "e": usado antes do último grupo quando ele é < 100 ou centena redonda
  return partes.map((p, idx) => {
    if (idx === 0) return p.txt;
    const usaE = p.i === 0 && (p.g < 100 || p.g % 100 === 0);
    return (usaE ? ' e ' : ' ') + p.txt;
  }).join('').replace(/\s+/g, ' ').trim();
}

export function reaisExtenso(valor) {
  const v = round2(valor);
  const inteiro = Math.floor(v);
  const cent = Math.round((v - inteiro) * 100);
  let txt = '';
  if (inteiro > 0) {
    txt = inteiroExtenso(inteiro);
    if (inteiro % 1000000 === 0) txt += ' de';
    txt += inteiro === 1 ? ' real' : ' reais';
  }
  if (cent > 0) txt += (txt ? ' e ' : '') + inteiroExtenso(cent) + (cent === 1 ? ' centavo' : ' centavos');
  return txt || 'zero reais';
}

// "12 (doze)"
export const numTxt = (n) => `${String(n).padStart(2, '0')} (${inteiroExtenso(n)})`;
// "R$ 1.550,00 (mil quinhentos e cinquenta reais)"
export const valorTxt = (v) => `${brl(v)} (${reaisExtenso(v)})`;

// ---------- Documentos ----------
export const onlyDigits = (s) => String(s || '').replace(/\D/g, '');
export function fmtDoc(v) {
  const c = onlyDigits(v);
  if (!c) return '';
  if (c.length <= 11) return c.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  return c.slice(0, 14).replace(/(\d{2})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1/$2').replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}
export const fmtCep = (v) => onlyDigits(v).slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2');
export function fmtPhone(v) {
  const c = onlyDigits(v);
  if (c.length === 11) return c.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  if (c.length === 10) return c.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  return v || '';
}

// ---------- Markdown leve ----------
// **negrito**, *itálico*, "- " listas, "## " subtítulo, parágrafos separados por linha em branco.
export function inline(s) {
  return esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');
}

// Converte texto em blocos HTML (um por parágrafo/lista), útil para paginação.
export function mdBlocks(text) {
  const lines = String(text || '').split('\n');
  const blocks = [];
  let list = null;
  const flush = () => { if (list) { blocks.push(`<ul>${list.map((l) => `<li>${inline(l)}</li>`).join('')}</ul>`); list = null; } };
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^\s*[-•●]\s+/.test(line)) { (list ||= []).push(line.replace(/^\s*[-•●]\s+/, '')); continue; }
    flush();
    if (!line.trim()) continue;
    if (/^##\s+/.test(line)) blocks.push(`<h4>${inline(line.replace(/^##\s+/, ''))}</h4>`);
    else if (/^\[\[.+\]\]$/.test(line.trim())) blocks.push(line.trim());
    else blocks.push(`<p>${inline(line)}</p>`);
  }
  flush();
  return blocks;
}
export const md = (text) => mdBlocks(text).join('');

// ---------- Diversos ----------
export function debounce(fn, ms = 250) {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

export function getPath(obj, path) {
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}
export function setPath(obj, path, val) {
  const keys = path.split('.');
  let o = obj;
  keys.slice(0, -1).forEach((k) => { if (o[k] == null || typeof o[k] !== 'object') o[k] = {}; o = o[k]; });
  o[keys[keys.length - 1]] = val;
}

export function toast(msg, type = 'ok', ms = 3200) {
  let box = document.getElementById('toasts');
  if (!box) { box = document.createElement('div'); box.id = 'toasts'; document.body.appendChild(box); }
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `<span class="toast-dot"></span><span>${msg}</span>`;
  box.appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 300); }, ms);
}

export function fileToDataURL(file) {
  return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file); });
}

// Reduz uma imagem enviada (fotos, logos) para não pesar no armazenamento do navegador.
// png = mantém transparência (logos); senão JPEG.
export function imagemReduzida(file, max = 900, png = false) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src);
      res(c.toDataURL(png ? 'image/png' : 'image/jpeg', 0.86));
    };
    img.onerror = rej;
    img.src = URL.createObjectURL(file);
  });
}

// Troca {chave} pelos valores (mensagens de WhatsApp)
export const preencher = (tpl, vars) => String(tpl || '').replace(/\{(\w+)\}/g, (m, k) => (vars[k] ?? m));

export function waLink(telefone, texto) {
  const tel = onlyDigits(telefone);
  return `https://wa.me/${tel ? (tel.length <= 11 ? '55' + tel : tel) : ''}?text=${encodeURIComponent(texto)}`;
}

export function download(filename, content, type = 'application/json') {
  const blob = content instanceof Blob ? content : new Blob([content], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 200);
}

export const slug = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w]+/g, '_').replace(/^_|_$/g, '');
