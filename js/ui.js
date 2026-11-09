// Componentes de interface reutilizáveis: modal, confirmação, binding de formulários, chips.
import { esc, getPath, setPath, num, slug } from './util.js';
import { ICON } from './icons.js';

export function modal({ title, body = '', footer = '', size = '', onMount, onClose } = {}) {
  const root = document.getElementById('modal-root');
  const bg = document.createElement('div');
  bg.className = 'modal-bg';
  bg.innerHTML = `<div class="modal ${size}">
    <div class="modal-h"><h3>${title}</h3><button class="btn btn-ghost btn-icon" data-close>${ICON.x}</button></div>
    <div class="modal-b">${body}</div>
    ${footer ? `<div class="modal-f">${footer}</div>` : ''}
  </div>`;
  const close = () => { bg.remove(); document.removeEventListener('keydown', onKey); onClose && onClose(); };
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  bg.addEventListener('mousedown', (e) => { if (e.target === bg) close(); });
  bg.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', close));
  document.addEventListener('keydown', onKey);
  root.appendChild(bg);
  const el = bg.querySelector('.modal');
  onMount && onMount(el, close);
  return { el, close };
}

export function confirmDialog(msg, { ok = 'Confirmar', danger = false } = {}) {
  return new Promise((resolve) => {
    let done = false;
    const m = modal({
      title: 'Confirmar',
      body: `<p style="margin:0;font-size:14.5px">${msg}</p>`,
      footer: `<button class="btn" data-close>Cancelar</button><button class="btn ${danger ? 'btn-danger' : 'btn-go'}" data-ok>${ok}</button>`,
      onClose: () => { if (!done) resolve(false); },
    });
    m.el.querySelector('[data-ok]').addEventListener('click', () => { done = true; resolve(true); m.close(); });
  });
}

// Liga inputs [data-bind="caminho.no.objeto"] ao objeto. data-type="num" converte números.
export function bind(root, obj, onChange) {
  root.querySelectorAll('[data-bind]').forEach((el) => {
    const path = el.dataset.bind;
    const v = getPath(obj, path);
    if (el.type === 'checkbox') el.checked = el.dataset.invert ? !v : !!v;
    else if (el.type === 'radio') el.checked = String(v) === el.value;
    else el.value = v ?? '';
    const evt = el.tagName === 'SELECT' || el.type === 'checkbox' || el.type === 'radio' ? 'change' : 'input';
    el.addEventListener(evt, () => {
      let val;
      if (el.type === 'checkbox') val = el.dataset.invert ? !el.checked : el.checked;
      else if (el.dataset.type === 'num') val = num(el.value);
      else val = el.value;
      if (el.type === 'radio' && !el.checked) return;
      setPath(obj, path, val);
      onChange && onChange(path, val, el);
    });
  });
}

export const statusChip = (s) => `<span class="chip s-${slug(s).toLowerCase()}">${esc(s)}</span>`;

export const sw = (bindPath, label, extra = '') => `<label class="switch"><input type="checkbox" data-bind="${bindPath}" ${extra}><i></i>${label}</label>`;

export const field = (label, input, cls = 'c12', hint = '') => `<div class="field ${cls}"><label>${label}</label>${input}${hint ? `<span class="hint">${hint}</span>` : ''}</div>`;
export const inp = (bindPath, attrs = '') => `<input class="in" data-bind="${bindPath}" ${attrs}>`;
export const money = (bindPath, attrs = '') => `<div class="money"><input class="in" type="number" step="0.01" min="0" data-type="num" data-bind="${bindPath}" ${attrs}></div>`;
export const numIn = (bindPath, suffix = '', attrs = '') => `<div class="${suffix ? 'suffix' : ''}" ${suffix ? `data-s="${suffix}"` : ''}><input class="in" type="number" step="any" data-type="num" data-bind="${bindPath}" ${attrs}></div>`;
