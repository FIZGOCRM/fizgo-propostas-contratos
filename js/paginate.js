// Distribui blocos HTML em páginas A4 medindo o conteúdo real no navegador.
// Cada bloco: { html, keep } — keep=true mantém o bloco junto do próximo (ex.: títulos).

let fontsReady = null;
export function ensureFonts() {
  fontsReady ||= Promise.all([
    '400 16px Nunito', '600 16px Nunito', '700 16px Nunito', '800 16px Nunito', '400 italic 16px Nunito',
    '400 16px Poppins', '500 16px Poppins', '600 16px Poppins', '700 16px Poppins', '400 16px Allison',
    '400 16px "Plus Jakarta Sans"', '500 16px "Plus Jakarta Sans"', '600 16px "Plus Jakarta Sans"', '700 16px "Plus Jakarta Sans"', '800 16px "Plus Jakarta Sans"',
    'italic 400 16px "Instrument Serif"', '400 16px "Instrument Serif"',
  ].map((f) => document.fonts.load(f).catch(() => null))).then(() => document.fonts.ready);
  return fontsReady;
}

export function paginate(blocks, shell) {
  const host = document.createElement('div');
  host.className = 'fz-doc';
  host.style.cssText = 'position:absolute;left:-20000px;top:0;visibility:hidden;';
  document.body.appendChild(host);

  const pages = [];
  let cur, body;
  const newPage = () => {
    host.innerHTML = shell();
    body = host.querySelector('.page-body');
    cur = [];
    pages.push(cur);
  };
  const overflow = () => body.scrollHeight > body.clientHeight + 1;
  const toEl = (html) => { const t = document.createElement('div'); t.innerHTML = html; return t.firstElementChild || t; };

  newPage();
  for (const b of blocks) {
    const el = toEl(b.html);
    body.appendChild(el);
    if (overflow() && cur.length) {
      el.remove();
      // Leva junto títulos que ficariam sozinhos no pé da página
      let carry = 0;
      while (carry < cur.length && cur[cur.length - 1 - carry].keep) carry++;
      if (carry === cur.length) carry = 0;
      const moved = carry ? cur.splice(cur.length - carry, carry) : [];
      newPage();
      for (const m of moved) { body.appendChild(toEl(m.html)); cur.push(m); }
      body.appendChild(el);
    }
    cur.push(b);
  }
  host.remove();
  return pages.filter((p) => p.length).map((p) => p.map((b) => b.html).join(''));
}
