// Exportação: PDF (html2canvas + jsPDF, página a página) e impressão nativa (texto vetorial).
import { toast, esc, waLink } from './util.js';
import { modal } from './ui.js';
import { ICON } from './icons.js';

function mountOffscreen(pages) {
  const host = document.createElement('div');
  host.className = 'fz-doc';
  host.style.cssText = 'position:fixed;left:-20000px;top:0;width:794px;';
  host.innerHTML = pages.join('');
  document.body.appendChild(host);
  return host;
}

// Monta o PDF (uma imagem por página) mostrando o progresso. Devolve o documento jsPDF.
async function montarPDF(pages, titulo) {
  if (!window.html2canvas || !window.jspdf) throw new Error('sem-biblioteca');
  const overlay = document.createElement('div');
  overlay.className = 'pdf-overlay';
  overlay.innerHTML = `<div class="pdf-box"><div class="spinner"></div><b>${titulo}</b><span id="pdf-prog">Preparando páginas</span></div>`;
  document.body.appendChild(overlay);
  const host = mountOffscreen(pages);
  try {
    await document.fonts.ready;
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true });
    const els = [...host.querySelectorAll('.page')];
    // Onde fica a linha de cada assinatura (em % da página), para o Autentique carimbar no lugar certo
    pdf.posicoes = {};
    for (let i = 0; i < els.length; i++) {
      document.getElementById('pdf-prog').textContent = `Página ${i + 1} de ${els.length}`;
      const canvas = await window.html2canvas(els[i], { scale: 2, useCORS: true, backgroundColor: null, logging: false, width: 794, height: 1123, windowWidth: 794 });
      const img = canvas.toDataURL('image/jpeg', 0.9);
      if (i) pdf.addPage();
      pdf.addImage(img, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
      // A página vira imagem: recria os links (ex.: vídeo) como áreas clicáveis
      const base = els[i].getBoundingClientRect();
      els[i].querySelectorAll('[data-sig] > i').forEach((linha) => {
        const r = linha.getBoundingClientRect();
        pdf.posicoes[linha.parentElement.dataset.sig] = { pagina: i + 1, x: ((r.left + r.width / 2 - base.left) / 794) * 100, y: ((r.top - base.top) / 1123) * 100 };
      });
      els[i].querySelectorAll('[data-rub]').forEach((t) => {
        const r = t.getBoundingClientRect();
        (pdf.posicoes[`rub-${t.dataset.rub}`] ||= []).push({ pagina: i + 1, x: ((r.left - base.left) / 794) * 100, y: ((r.bottom - base.top) / 1123) * 100 });
      });
      els[i].querySelectorAll('a[href^="http"]').forEach((a) => {
        const r = a.getBoundingClientRect();
        pdf.link(((r.left - base.left) * 210) / 794, ((r.top - base.top) * 297) / 1123, (r.width * 210) / 794, (r.height * 297) / 1123, { url: a.href });
      });
    }
    return pdf;
  } finally {
    host.remove();
    overlay.remove();
  }
}

export async function exportPDF(pages, filename) {
  let pdf;
  try {
    pdf = await montarPDF(pages, 'Gerando PDF…');
  } catch (e) {
    console.error(e);
    toast(e.message === 'sem-biblioteca' ? 'Biblioteca de PDF não carregou (verifique a internet). Abrindo impressão…' : 'Não foi possível gerar o PDF. Abrindo impressão…', 'err', 5000);
    printPages(pages);
    return;
  }
  // O PDF leva alguns segundos para ficar pronto. Se o download começar sozinho depois disso,
  // o Chrome ignora o nome do arquivo (salva com um código e sem ".pdf"). Por isso o download
  // sai de um clique do usuário, que mantém o nome certo.
  const nome = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  const url = URL.createObjectURL(pdf.output('blob'));
  const m = modal({
    title: 'PDF pronto',
    body: `<p style="margin:0;font-size:14.5px">${ICON.file} <b>${esc(nome)}</b></p>`,
    footer: `<a class="btn" href="${url}" target="_blank" rel="noopener">Abrir para ver</a><a class="btn btn-go" href="${url}" download="${esc(nome)}" data-baixar>${ICON.download} Baixar PDF</a>`,
    onClose: () => setTimeout(() => URL.revokeObjectURL(url), 60000),
  });
  m.el.querySelector('[data-baixar]').addEventListener('click', () => { setTimeout(m.close, 300); toast('PDF baixado! Veja na pasta Downloads.'); });
}

// WhatsApp: o link do WhatsApp só leva texto. O PDF vai pelo "Compartilhar" do sistema (quando o
// navegador permite) ou é baixado para você arrastar na conversa que abrimos com a mensagem pronta.
export async function enviarPDFWhatsApp(pages, filename, { tel, texto, onEnviado } = {}) {
  let pdf;
  try { pdf = await montarPDF(pages, 'Preparando o PDF para o WhatsApp…'); } catch (e) {
    console.error(e);
    toast('Não foi possível gerar o PDF. Abrindo só a mensagem…', 'err', 5000);
    window.open(waLink(tel, texto), '_blank');
    return;
  }
  const nome = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  const blob = pdf.output('blob');
  const arquivo = new File([blob], nome, { type: 'application/pdf' });
  const podeCompartilhar = !!navigator.canShare?.({ files: [arquivo] });
  const url = URL.createObjectURL(blob);
  const m = modal({
    title: 'Enviar pelo WhatsApp',
    body: `<p style="margin:0 0 12px;font-size:14.5px">${ICON.file} <b>${esc(nome)}</b></p>
      ${podeCompartilhar ? `<button class="btn btn-go" style="width:100%;margin-bottom:12px" data-share>${ICON.whatsapp} Compartilhar PDF + mensagem</button>
        <p class="small muted" style="margin:0 0 14px">Escolha o WhatsApp na lista e depois a conversa do cliente.</p>
        <div class="small muted" style="margin:0 0 10px;font-weight:700">Ou, pelo WhatsApp Web:</div>` : ''}
      <div style="display:flex;flex-direction:column;gap:8px">
        <a class="btn ${podeCompartilhar ? '' : 'btn-dark'}" href="${url}" download="${esc(nome)}" data-baixar>${ICON.download} 1. Baixar o PDF</a>
        <button class="btn ${podeCompartilhar ? '' : 'btn-go'}" data-wa>${ICON.whatsapp} 2. Abrir a conversa com a mensagem</button>
      </div>
      <p class="small muted" style="margin:12px 0 0">Na conversa, arraste o PDF da pasta Downloads (ou clique no clipe 📎) e envie junto com a mensagem.</p>`,
    footer: '<button class="btn" data-close>Fechar</button>',
    onClose: () => setTimeout(() => URL.revokeObjectURL(url), 60000),
  });
  const feito = () => { onEnviado?.(); };
  m.el.querySelector('[data-baixar]').addEventListener('click', () => toast('PDF baixado na pasta Downloads.'));
  m.el.querySelector('[data-wa]').onclick = () => {
    if (!tel) toast('Cliente sem WhatsApp cadastrado: escolha a conversa na lista.', 'warn', 5000);
    window.open(waLink(tel, texto), '_blank');
    feito();
  };
  m.el.querySelector('[data-share]')?.addEventListener('click', async () => {
    try {
      await navigator.share({ files: [arquivo], text: texto });
      feito(); m.close();
    } catch (e) {
      if (e.name !== 'AbortError') toast('O compartilhamento não abriu. Use os passos 1 e 2.', 'warn', 5000);
    }
  });
}

// PDF como arquivo (Blob), para enviar ao Autentique
export async function pdfBlob(pages, titulo = 'Preparando o contrato…') {
  const pdf = await montarPDF(pages, titulo);
  return pdf.output('blob');
}

// O mesmo, com a posição das linhas de assinatura
export async function pdfComAssinaturas(pages, titulo) {
  const pdf = await montarPDF(pages, titulo);
  return { blob: pdf.output('blob'), posicoes: pdf.posicoes };
}

export function printPages(pages) {
  let root = document.getElementById('print-root');
  if (!root) { root = document.createElement('div'); root.id = 'print-root'; root.className = 'fz-doc'; document.body.appendChild(root); }
  root.innerHTML = pages.join('');
  document.fonts.ready.then(() => setTimeout(() => window.print(), 150));
}
