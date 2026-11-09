// Logo oficial Fizgo Digital em SVG (vetores de js/logo-paths.js). Se houver logo enviado
// nas Configurações, ele é usado no lugar.
import { store } from './store.js';
import { LOGO } from './logo-paths.js';

export const BRAND = { teal: '#233C42', teal2: '#2C4B52', teal3: '#1A2E33', green: '#00F07A', greenDark: '#00B85C' };

// layout: 'horizontal' (símbolo + FizgoDigital), 'vertical' (símbolo sobre o nome),
// 'lado' (símbolo + Fizgo/Digital empilhados), 'fizgo' (palavra Fizgo) ou 'simbolo'
export function logoSVG({ cor = '#FFFFFF', verde = BRAND.green, altura = 56, layout = 'horizontal', cls = '' } = {}) {
  const L = LOGO[layout] || LOGO.horizontal;
  const w = Math.round((altura * L.w) / L.h);
  const paths = L.p.map((p) => `<path d="${p.d}" fill="${p.t === 'accent' ? verde : cor}"${p.r === 'evenodd' ? ' fill-rule="evenodd"' : ''}/>`).join('');
  return `<svg class="fz-logo ${cls}" width="${w}" height="${altura}" viewBox="0 0 ${L.w} ${L.h}" xmlns="http://www.w3.org/2000/svg" aria-label="Fizgo Digital" role="img">${paths}</svg>`;
}

// Ícone compacto (o símbolo "fg" sorridente num quadrado) — avatar e favicon
export function markSVG({ fundo = BRAND.teal, cor = '#FFFFFF', verde = BRAND.green, size = 36 } = {}) {
  const L = LOGO.simbolo;
  const s = 40 / L.h;
  return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="64" rx="16" fill="${fundo}"/>
  <g transform="translate(${(64 - L.w * s) / 2} 12) scale(${s})">${L.p.map((p) => `<path d="${p.d}" fill="${p.t === 'accent' ? verde : cor}"/>`).join('')}</g>
</svg>`;
}

// Logo para fundo escuro (versão branca) ou claro (versão teal)
export function brandLogo(variant = 'claro', altura = 56, layout = 'horizontal') {
  const e = store.state?.settings?.empresa || {};
  const custom = variant === 'claro' ? e.logoParaFundoEscuro : e.logoParaFundoClaro;
  if (custom) return `<img class="fz-logo" src="${custom}" style="height:${altura}px;width:auto" alt="${e.nomeFantasia || 'Logo'}">`;
  return variant === 'claro' ? logoSVG({ altura, layout }) : logoSVG({ cor: BRAND.teal, altura, layout });
}
