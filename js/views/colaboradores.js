// Gestão de Colaboradores e Prestadores (PJ), Dossiê de Documentos e Respaldo Jurídico
import { store } from '../store.js';
import { ICON } from '../icons.js';
import { esc, uid, fmtDoc, fmtPhone, fmtCep, onlyDigits, toast, brlShort, fmtDate, dataExtenso, fileToDataURL, download, waLink, today } from '../util.js';
import { modal, bind, field, inp, money, confirmDialog, statusChip } from '../ui.js';
import { gerarContratoColaborador } from '../flow.js';
import { exportPDF, printPages } from '../pdf.js';
import { brandLogo } from '../logo.js';

export const novoColaborador = () => ({
  id: '',
  nome: '',
  razaoSocial: '',
  tipo: 'PJ', // PJ, PF, CLT (MEI antigo é tratado como PJ)
  funcaoId: '',
  cpfCnpj: '',
  cpfResponsavel: '',
  email: '',
  telefone: '',
  cargo: '',
  especialidade: '',
  remuneracao: 3500,
  periodicidade: 'Mensal',
  chavePix: '',
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: 'Três Lagoas',
  uf: 'MS',
  status: 'Ativo', // Ativo, Pendente Documentos, Inativo
  observacoes: '',
  documentos: [], // [{ id, tipoDoc, nomeOriginal, tipoMime, tamanho, dataUpload, dados }]
});

// Verifica a conformidade de documentos do colaborador
export function docCompliance(c) {
  const docs = c.documentos || [];
  const hasResidencia = docs.some((d) => d.tipoDoc === 'residencia');
  const hasIdentidade = docs.some((d) => d.tipoDoc === 'identidade');
  const isPj = c.tipo === 'MEI' || c.tipo === 'PJ';
  const hasCnpj = docs.some((d) => d.tipoDoc === 'cnpj');
  const totalNecessario = isPj ? 3 : 2;
  let count = (hasResidencia ? 1 : 0) + (hasIdentidade ? 1 : 0) + (isPj && hasCnpj ? 1 : 0);

  let badge = `<span class="doc-badge-pill err">🔴 0/${totalNecessario} Pendente</span>`;
  if (count === totalNecessario) {
    badge = `<span class="doc-badge-pill ok">🟢 Completo (${count}/${totalNecessario})</span>`;
  } else if (count > 0) {
    badge = `<span class="doc-badge-pill warn">🟡 Parcial (${count}/${totalNecessario})</span>`;
  }
  return { hasResidencia, hasIdentidade, hasCnpj, isPj, totalNecessario, count, badge };
}

// --------------------------------------------------------------------------
// Formulário de Cadastro e Edição de Colaborador
// --------------------------------------------------------------------------
function colaboradorForm() {
  return `<div class="fgrid">
    <div class="field c12">
      <div class="seg" id="colab-tipo-seg">
        <button type="button" data-tipo="PJ">PJ (empresa prestadora)</button>
        <button type="button" data-tipo="PF">Pessoa Física / Freelancer</button>
        <button type="button" data-tipo="CLT">CLT</button>
      </div>
    </div>
    <div class="field c6">
      <label data-l="doc">CNPJ do Prestador</label>
      <div class="in-group">
        <input class="in" data-bind="cpfCnpj" placeholder="00.000.000/0000-00">
        <button type="button" class="btn btn-dark" data-act="cnpj" title="Buscar dados na Receita Federal via BrasilAPI">${ICON.search} Buscar</button>
      </div>
      <span class="hint" data-h="doc">Preenche Razão Social, Nome Fantasia e Endereço automaticamente.</span>
    </div>
    ${field('Nome completo do prestador', inp('nome', 'placeholder="Ex.: Rodrigo Santana de Souza"'), 'c6')}
    <div class="c12 fgrid pj-only" style="gap:12px">
      ${field('Razão social da empresa', inp('razaoSocial', 'placeholder="Ex.: RODRIGO SANTANA TECNOLOGIA LTDA"'), 'c7')}
      ${field('CPF do responsável / titular', inp('cpfResponsavel', 'placeholder="000.000.000-00"'), 'c5')}
    </div>
    ${field('Função (Bíblia Operacional)', `<select class="in" data-bind="funcaoId"><option value="">— escolher —</option>${(store.state.catalogo.funcoes || []).map((f) => `<option value="${f.id}">${esc(f.nome)}</option>`).join('')}</select>`, 'c6', 'Preenche no contrato as atribuições, os prazos de entrega e as multas desta função.')}
    ${field('Cargo (como aparece no cadastro)', inp('cargo', 'placeholder="Ex.: Gestor de Tráfego Pago, Designer, Copywriter"'), 'c6')}
    ${field('Especialidade & Ferramentas', inp('especialidade', 'placeholder="Ex.: Meta Ads, Google Ads, Claude AI, Figma"'), 'c6')}
    <div class="field c4">
      <label>Remuneração acordada</label>
      <div class="money"><input class="in" type="number" step="0.01" min="0" data-bind="remuneracao" placeholder="0.00"></div>
    </div>
    ${field('Periodicidade', `<select class="in" data-bind="periodicidade"><option value="Mensal">Mensal (Honorários Recorrentes)</option><option value="Por Projeto">Por Projeto (Demanda Pontual)</option><option value="Por Hora">Por Hora Técnica</option></select>`, 'c4')}
    ${field('Chave PIX para pagamento', inp('chavePix', 'placeholder="CNPJ, E-mail, Celular ou Chave Aleatória"'), 'c4')}
    ${field('E-mail profissional', inp('email', 'type="email" placeholder="colaborador@dominio.com"'), 'c6')}
    ${field('WhatsApp / Telefone', inp('telefone', 'placeholder="(67) 99999-9999"'), 'c6')}
    <div class="field c4">
      <label>CEP</label>
      <div class="in-group">
        <input class="in" data-bind="cep" placeholder="00000-000">
        <button type="button" class="btn btn-icon" data-act="cep" title="Buscar endereço pelo CEP">${ICON.search}</button>
      </div>
    </div>
    ${field('Logradouro', inp('logradouro'), 'c8')}
    ${field('Número', inp('numero'), 'c3')}
    ${field('Complemento', inp('complemento', 'placeholder="Sala, Apto, Bloco"'), 'c4')}
    ${field('Bairro', inp('bairro'), 'c5')}
    ${field('Cidade', inp('cidade'), 'c8')}
    ${field('UF', inp('uf', 'maxlength="2"'), 'c4')}
    ${field('Status cadastral', `<select class="in" data-bind="status"><option value="Ativo">Ativo</option><option value="Pendente Documentos">Pendente Documentos</option><option value="Inativo">Inativo</option></select>`, 'c6')}
    ${field('Observações operacionais & infraestrutura', inp('observacoes', 'placeholder="Ex.: Estação 02 coworking, comodato Claude/ChatGPT, etc."'), 'c6')}
  </div>`;
}

function wireColaboradorForm(root, c, onChange) {
  const refreshTipo = () => {
    root.querySelectorAll('#colab-tipo-seg button').forEach((b) => b.classList.toggle('on', b.dataset.tipo === c.tipo));
    const isPj = c.tipo === 'MEI' || c.tipo === 'PJ';
    root.querySelector('[data-l="doc"]').textContent = isPj ? 'CNPJ do Prestador' : 'CPF do Colaborador';
    root.querySelector('[data-act="cnpj"]').style.display = isPj ? '' : 'none';
    root.querySelector('[data-h="doc"]').style.display = isPj ? '' : 'none';
    root.querySelector('.pj-only').style.display = isPj ? '' : 'none';
  };

  bind(root, c, (path, val, el) => {
    if (path === 'cpfCnpj') { el.value = fmtDoc(val); c.cpfCnpj = el.value; }
    if (path === 'cpfResponsavel') { el.value = fmtDoc(val); c.cpfResponsavel = el.value; }
    if (path === 'telefone' && onlyDigits(val).length >= 10) { el.value = fmtPhone(val); c.telefone = el.value; }
    if (path === 'cep' && onlyDigits(val).length === 8) { el.value = fmtCep(val); c.cep = el.value; buscarCep(); }
    if (path === 'uf') { el.value = val.toUpperCase(); c.uf = el.value; }
    if (path === 'funcaoId' && val && !c.cargo) { const f = (store.state.catalogo.funcoes || []).find((x) => x.id === val); if (f) set('cargo', f.nome); }
    onChange && onChange();
  });

  const set = (k, v) => { if (v == null || v === '') return; c[k] = v; const el = root.querySelector(`[data-bind="${k}"]`); if (el) el.value = v; };

  async function buscarCep() {
    const cep = onlyDigits(c.cep);
    if (cep.length !== 8) return toast('CEP inválido.', 'err');
    try {
      const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`).then((x) => x.json());
      if (r.erro) return toast('CEP não encontrado.', 'warn');
      set('logradouro', r.logradouro); set('bairro', r.bairro); set('cidade', r.localidade); set('uf', r.uf);
      onChange && onChange();
      root.querySelector('[data-bind="numero"]')?.focus();
    } catch { toast('Não consegui consultar o CEP agora.', 'err'); }
  }

  root.querySelector('[data-act="cep"]').addEventListener('click', buscarCep);

  root.querySelector('[data-act="cnpj"]').addEventListener('click', async (e) => {
    const cnpj = onlyDigits(c.cpfCnpj);
    if (cnpj.length !== 14) return toast('Digite um CNPJ válido com 14 dígitos.', 'err');
    const btn = e.currentTarget; btn.disabled = true;
    try {
      const r = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`).then((x) => { if (!x.ok) throw new Error(x.status); return x.json(); });
      set('razaoSocial', r.razao_social);
      if (!c.nome && r.nome_fantasia) set('nome', r.nome_fantasia);
      set('logradouro', [r.descricao_tipo_de_logradouro, r.logradouro].filter(Boolean).join(' '));
      set('numero', r.numero);
      set('complemento', r.complemento);
      set('bairro', r.bairro);
      set('cidade', r.municipio);
      set('uf', r.uf);
      set('cep', fmtCep(r.cep));
      if (!c.email && r.email) set('email', String(r.email).toLowerCase());
      if (!c.telefone && r.ddd_telefone_1) set('telefone', fmtPhone(r.ddd_telefone_1));
      const socio = (r.qsa || [])[0]?.nome_socio;
      if (socio && !c.nome) set('nome', socio);
      if (socio && !c.cpfResponsavel) set('cpfResponsavel', '');
      toast('Dados do CNPJ preenchidos com sucesso!');
      onChange && onChange();
    } catch {
      toast('CNPJ não encontrado ou serviço da Receita indisponível.', 'err');
    }
    btn.disabled = false;
  });

  root.querySelectorAll('#colab-tipo-seg button').forEach((b) => b.addEventListener('click', () => {
    c.tipo = b.dataset.tipo;
    refreshTipo();
    onChange && onChange();
  }));

  refreshTipo();
}

export function abrirEditorColaborador(id, after) {
  const orig = id ? store.find('colaboradores', id) : null;
  const c = orig ? JSON.parse(JSON.stringify(orig)) : novoColaborador();
  const m = modal({
    title: orig ? `Editar Colaborador: ${esc(c.nome)}` : 'Novo prestador',
    size: 'lg',
    body: colaboradorForm(),
    footer: `<button class="btn" data-close>Cancelar</button><button class="btn btn-go" data-ok>${orig ? 'Salvar Alterações' : 'Cadastrar Colaborador'}</button>`,
  });

  wireColaboradorForm(m.el, c);

  m.el.querySelector('[data-ok]').addEventListener('click', () => {
    if (!c.nome) return toast('Informe o nome do colaborador ou prestador.', 'err');
    if (!c.id) {
      c.id = uid('colab');
      c.dataInicio = c.dataInicio || today();
      c.criadoEm = new Date().toISOString();
      c.documentos = c.documentos || [];
    }
    store.upsert('colaboradores', c);
    toast(`Colaborador ${c.nome} salvo com sucesso!`);
    m.close();
    after && after();
  });
}

// --------------------------------------------------------------------------
// Dossiê de Documentos e Upload em Lote ("Colocar tudo de uma vez")
// --------------------------------------------------------------------------
export function abrirDossie(colabId, after) {
  const c = store.find('colaboradores', colabId);
  if (!c) return toast('Colaborador não encontrado.', 'err');
  c.documentos = c.documentos || [];

  const m = modal({
    title: `📁 Dossiê Cadastral & Arquivos: ${esc(c.nome)}`,
    size: 'lg',
    body: `
      <div style="margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
        <div>
          <strong style="color:var(--teal);font-size:15px">${esc(c.cargo || 'Prestador Autônomo')}</strong>
          <div class="cell-sub">${esc(c.tipo)} · Doc: ${fmtDoc(c.cpfCnpj)} · ${esc(c.email || c.telefone || 'Sem contato')}</div>
        </div>
        <div id="dossie-compliance-badge"></div>
      </div>

      <!-- Zona de Upload em Lote "Colocar tudo de uma vez" -->
      <div class="colab-dropzone" id="dz-batch">
        <div class="dz-icon">${ICON.upload}</div>
        <strong>📁 Colocar tudo de uma vez (Upload em Lote)</strong>
        <span>Arraste múltiplos arquivos simultaneamente (PDF, PNG ou JPG) ou clique para selecionar. O sistema categoriza comprovante de residência, CNH/RG e Cartão CNPJ automaticamente.</span>
        <input type="file" id="dz-file-input" multiple accept=".pdf,.png,.jpg,.jpeg">
      </div>

      <div style="margin-top:22px">
        <div class="sec-h"><h3 style="font-size:14px;color:var(--teal)">Documentos Obrigatórios Cadastrais</h3></div>
        <div id="docs-slots-list"></div>
      </div>

      <div id="docs-outros-wrapper" style="margin-top:20px;display:none">
        <div class="sec-h"><h3 style="font-size:14px;color:var(--teal)">Outros Anexos & Arquivos</h3></div>
        <div id="docs-outros-list"></div>
      </div>
    `,
    footer: `
      <div style="display:flex;justify-content:space-between;width:100%;align-items:center;flex-wrap:wrap;gap:8px">
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <button class="btn btn-sm btn-dark" data-act="solicitar-docs" title="Exportar carta formal de solicitação com checklist em PDF">${ICON.file} Solicitar Documentos</button>
          <button class="btn btn-sm" data-act="emitir-mei" title="Gerar contrato de prestação de serviços PJ com atribuições, prazos e multas da função">⚖️ Contrato PJ</button>
          <button class="btn btn-sm" data-act="emitir-sublocacao" title="Gerar Cessão de Espaço (Coworking) e Comodato de Ferramentas de IA">🏢 Sublocação &amp; IA</button>
        </div>
        <button class="btn btn-ghost" data-close>Fechar</button>
      </div>
    `,
  });

  const renderSlots = () => {
    const comp = docCompliance(c);
    m.el.querySelector('#dossie-compliance-badge').innerHTML = comp.badge;

    const docRes = c.documentos.find((d) => d.tipoDoc === 'residencia');
    const docIdt = c.documentos.find((d) => d.tipoDoc === 'identidade');
    const docCnp = c.documentos.find((d) => d.tipoDoc === 'cnpj');
    const outros = c.documentos.filter((d) => !['residencia', 'identidade', 'cnpj'].includes(d.tipoDoc));

    const renderCard = (tipo, titulo, descricao, doc) => {
      if (doc) {
        return `
          <div class="colab-doc-card">
            <div class="colab-doc-info">
              <div class="colab-doc-icon ok">${ICON.check}</div>
              <div class="colab-doc-details">
                <div class="colab-doc-name">${titulo} <span style="color:var(--green-d);font-weight:700">· Arquivado</span></div>
                <div class="colab-doc-meta"><strong>${esc(doc.nomeOriginal)}</strong> (${(doc.tamanho / 1024).toFixed(1)} KB) · Enviado em ${fmtDate(doc.dataUpload)}</div>
              </div>
            </div>
            <div class="colab-doc-actions">
              <button class="btn btn-sm" data-view="${doc.id}" title="Visualizar">${ICON.eye} Ver</button>
              <button class="btn btn-sm btn-icon" data-dl="${doc.id}" title="Baixar">${ICON.download}</button>
              <button class="btn btn-sm btn-icon btn-danger" data-del-doc="${doc.id}" title="Remover anexo">${ICON.trash}</button>
            </div>
          </div>`;
      }
      return `
        <div class="colab-doc-card missing">
          <div class="colab-doc-info">
            <div class="colab-doc-icon warn">${ICON.alert}</div>
            <div class="colab-doc-details">
              <div class="colab-doc-name">${titulo} <span style="color:var(--amber);font-weight:700">· Pendente</span></div>
              <div class="colab-doc-meta">${descricao}</div>
            </div>
          </div>
          <div class="colab-doc-actions">
            <label class="btn btn-sm btn-dark" style="cursor:pointer">
              ${ICON.upload} Anexar
              <input type="file" style="display:none" data-single-upload="${tipo}" accept=".pdf,.png,.jpg,.jpeg">
            </label>
          </div>
        </div>`;
    };

    let html = renderCard('residencia', 'Comprovante de Residência Atualizado', 'Conta de consumo recente (luz, água, internet, < 90 dias)', docRes);
    html += renderCard('identidade', 'Documento de Identificação (RG / CNH)', 'Documento oficial legível com foto e CPF frente e verso', docIdt);
    if (comp.isPj) {
      html += renderCard('cnpj', 'Cartão CNPJ Ativo na Receita Federal', 'Comprovante de Inscrição e Situação Cadastral emitido na Receita Federal', docCnp);
    }
    m.el.querySelector('#docs-slots-list').innerHTML = html;

    const wrapperOutros = m.el.querySelector('#docs-outros-wrapper');
    if (outros.length > 0) {
      wrapperOutros.style.display = 'block';
      m.el.querySelector('#docs-outros-list').innerHTML = outros.map((d) => `
        <div class="colab-doc-card">
          <div class="colab-doc-info">
            <div class="colab-doc-icon ok">📎</div>
            <div class="colab-doc-details">
              <div class="colab-doc-name">${esc(d.nomeOriginal)}</div>
              <div class="colab-doc-meta">${(d.tamanho / 1024).toFixed(1)} KB · Enviado em ${fmtDate(d.dataUpload)}</div>
            </div>
          </div>
          <div class="colab-doc-actions">
            <button class="btn btn-sm" data-view="${d.id}" title="Visualizar">${ICON.eye} Ver</button>
            <button class="btn btn-sm btn-icon" data-dl="${d.id}" title="Baixar">${ICON.download}</button>
            <button class="btn btn-sm btn-icon btn-danger" data-del-doc="${d.id}" title="Remover anexo">${ICON.trash}</button>
          </div>
        </div>`).join('');
    } else {
      wrapperOutros.style.display = 'none';
    }
  };

  renderSlots();

  // Processamento de arquivos
  async function processFiles(fileList) {
    if (!fileList || !fileList.length) return;
    toast(`Processando e arquivando ${fileList.length} arquivo(s)...`);

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const dataUrl = await fileToDataURL(file);
      const nl = file.name.toLowerCase();
      let tipoDoc = 'outro';

      if (nl.includes('residencia') || nl.includes('endereco') || nl.includes('luz') || nl.includes('agua') || nl.includes('energia') || nl.includes('fatura') || nl.includes('internet') || nl.includes('gas') || nl.includes('comprovante')) {
        tipoDoc = 'residencia';
      } else if (nl.includes('rg') || nl.includes('cnh') || nl.includes('identidade') || nl.includes('doc') || nl.includes('cpf') || nl.includes('habilitacao')) {
        tipoDoc = 'identidade';
      } else if (nl.includes('cnpj') || nl.includes('receita') || nl.includes('cartao') || nl.includes('mei') || nl.includes('ccmei')) {
        tipoDoc = 'cnpj';
      }

      // Se for slot fixo, remove anterior do mesmo tipo
      if (['residencia', 'identidade', 'cnpj'].includes(tipoDoc)) {
        c.documentos = c.documentos.filter((d) => d.tipoDoc !== tipoDoc);
      }

      c.documentos.push({
        id: uid('doc'),
        tipoDoc,
        nomeOriginal: file.name,
        tipoMime: file.type || 'application/octet-stream',
        tamanho: file.size,
        dataUpload: today(),
        dados: dataUrl,
      });
    }

    // Atualiza status se todos os obrigatórios foram enviados
    const comp = docCompliance(c);
    if (comp.count === comp.totalNecessario && c.status === 'Pendente Documentos') {
      c.status = 'Ativo';
    }

    store.upsert('colaboradores', c);
    toast('Todos os documentos foram arquivados com sucesso!');
    renderSlots();
    after && after();
  }

  // Drag & drop listeners
  const dz = m.el.querySelector('#dz-batch');
  const fileInput = m.el.querySelector('#dz-file-input');

  ['dragenter', 'dragover'].forEach((eName) => {
    dz.addEventListener(eName, (e) => { e.preventDefault(); e.stopPropagation(); dz.classList.add('dragover'); });
  });
  ['dragleave', 'drop'].forEach((eName) => {
    dz.addEventListener(eName, (e) => { e.preventDefault(); e.stopPropagation(); dz.classList.remove('dragover'); });
  });
  dz.addEventListener('drop', (e) => {
    const files = e.dataTransfer?.files;
    if (files && files.length) processFiles(files);
  });
  fileInput.addEventListener('change', (e) => {
    processFiles(e.target.files);
    fileInput.value = '';
  });

  // Upload individual por slot
  m.el.addEventListener('change', async (e) => {
    const inpSingle = e.target.closest('[data-single-upload]');
    if (!inpSingle || !inpSingle.files.length) return;
    const tipo = inpSingle.dataset.singleUpload;
    const file = inpSingle.files[0];
    const dataUrl = await fileToDataURL(file);

    c.documentos = c.documentos.filter((d) => d.tipoDoc !== tipo);
    c.documentos.push({
      id: uid('doc'),
      tipoDoc: tipo,
      nomeOriginal: file.name,
      tipoMime: file.type || 'application/octet-stream',
      tamanho: file.size,
      dataUpload: today(),
      dados: dataUrl,
    });

    const comp = docCompliance(c);
    if (comp.count === comp.totalNecessario && c.status === 'Pendente Documentos') {
      c.status = 'Ativo';
    }

    store.upsert('colaboradores', c);
    toast(`Documento (${file.name}) arquivado com sucesso!`);
    renderSlots();
    after && after();
  });

  // Ações de cada documento (Ver, Baixar, Deletar)
  m.el.addEventListener('click', async (e) => {
    const btnDel = e.target.closest('[data-del-doc]');
    if (btnDel) {
      if (await confirmDialog('Remover este arquivo anexado do dossiê?', { ok: 'Remover', danger: true })) {
        c.documentos = c.documentos.filter((d) => d.id !== btnDel.dataset.delDoc);
        store.upsert('colaboradores', c);
        toast('Arquivo removido.');
        renderSlots();
        after && after();
      }
      return;
    }

    const btnDl = e.target.closest('[data-dl]');
    if (btnDl) {
      const d = c.documentos.find((x) => x.id === btnDl.dataset.dl);
      if (d) download(d.dados, d.nomeOriginal);
      return;
    }

    const btnView = e.target.closest('[data-view]');
    if (btnView) {
      const d = c.documentos.find((x) => x.id === btnView.dataset.view);
      if (d) abrirVisualizadorArquivo(d);
      return;
    }

    // Ações de rodapé
    if (e.target.closest('[data-act="solicitar-docs"]')) {
      m.close();
      abrirSolicitacaoDocumentos(colabId);
      return;
    }
    if (e.target.closest('[data-act="emitir-mei"]')) {
      m.close();
      const ct = gerarContratoColaborador(colabId, 'colaborador_mei');
      toast('Contrato de prestação de serviços PJ gerado!');
      location.hash = `#/contrato/${ct.id}`;
      return;
    }
    if (e.target.closest('[data-act="emitir-sublocacao"]')) {
      m.close();
      const ct = gerarContratoColaborador(colabId, 'sublocacao_ia');
      toast('Instrumento de Cessão e Comodato IA gerado!');
      location.hash = `#/contrato/${ct.id}`;
      return;
    }
  });
}

// --------------------------------------------------------------------------
// Visualizador de Documentos (PDF e Imagens)
// --------------------------------------------------------------------------
export function abrirVisualizadorArquivo(doc) {
  let content = '';
  if (doc.tipoMime?.startsWith('image/') || (doc.dados && doc.dados.startsWith('data:image/'))) {
    content = `<div style="text-align:center;max-height:75vh;overflow:auto"><img src="${doc.dados}" alt="${esc(doc.nomeOriginal)}" style="max-width:100%;border-radius:10px;box-shadow:var(--shadow)"></div>`;
  } else if (doc.tipoMime === 'application/pdf' || (doc.dados && doc.dados.startsWith('data:application/pdf'))) {
    content = `<iframe src="${doc.dados}" style="width:100%;height:75vh;border:none;border-radius:10px"></iframe>`;
  } else {
    content = `
      <div class="empty">
        <div class="big">📁</div>
        <h3>${esc(doc.nomeOriginal)}</h3>
        <p>Formato não suporta pré-visualização direta no navegador.</p>
        <button class="btn btn-go" id="btn-dl-fallback">${ICON.download} Baixar Arquivo</button>
      </div>`;
  }

  const vm = modal({
    title: `👁️ ${esc(doc.nomeOriginal)}`,
    size: 'lg',
    body: content,
    footer: `<button class="btn btn-dark" id="btn-dl-vm">${ICON.download} Baixar</button><button class="btn btn-ghost" data-close>Fechar</button>`,
  });

  vm.el.querySelector('#btn-dl-vm')?.addEventListener('click', () => download(doc.dados, doc.nomeOriginal));
  vm.el.querySelector('#btn-dl-fallback')?.addEventListener('click', () => download(doc.dados, doc.nomeOriginal));
}

// --------------------------------------------------------------------------
// Solicitação Formal de Documentos em A4 (PDF, Impressão e WhatsApp)
// --------------------------------------------------------------------------
export function renderSolicitacaoA4(c, empresa) {
  const comp = docCompliance(c);
  const dataHoje = dataExtenso(today());

  return `
    <div class="page" style="padding:0;background:#fff;display:flex;flex-direction:column;justify-content:space-between">
      <!-- Topo timbrado -->
      <div>
        <div style="background:var(--teal);padding:30px 60px 24px;color:#fff;display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font:800 24px 'Poppins';letter-spacing:-.01em;display:flex;align-items:center;gap:10px">
              ${brandLogo('escuro', 34)}
            </div>
            <div style="font-size:11px;color:rgba(255,255,255,.75);margin-top:4px">
              Departamento de Gestão de Prestadores &amp; Compliance Jurídico
            </div>
            <div style="font-size:10px;color:rgba(255,255,255,.6)">
              ${esc(empresa.razaoSocial)} · CNPJ: ${fmtDoc(empresa.cnpj)}
            </div>
          </div>
          <div style="text-align:right">
            <span class="tag" style="background:rgba(0,240,122,.15);border-color:var(--green);color:var(--green)">OFÍCIO DE CONFORMIDADE</span>
            <div style="font:600 11px 'Poppins';margin-top:6px;color:rgba(255,255,255,.85)">SOL-DOCS/${today().slice(0, 4)}</div>
            <div style="font-size:10px;color:rgba(255,255,255,.6)">Data: ${fmtDate(today())}</div>
          </div>
        </div>

        <div style="padding:40px 60px 20px">
          <!-- Destinatário -->
          <div style="background:var(--bg);border-radius:12px;padding:16px 20px;margin-bottom:24px;border-left:4px solid var(--teal)">
            <div style="font-size:11px;color:var(--muted);text-transform:uppercase;font-weight:700;letter-spacing:.06em">Destinatário:</div>
            <strong style="font-size:16px;color:var(--teal);display:block;margin:2px 0">${esc(c.nome)}</strong>
            <div style="font-size:12px;color:#4A5E62">
              <strong>Função/Cargo:</strong> ${esc(c.cargo || 'Prestador Autônomo')} &nbsp;|&nbsp;
              <strong>Tipo:</strong> ${esc(c.tipo)} &nbsp;|&nbsp;
              <strong>Doc:</strong> ${fmtDoc(c.cpfCnpj)}
            </div>
            <div style="font-size:11px;color:var(--muted);margin-top:2px">
              ${c.email ? `E-mail: ${esc(c.email)}` : ''} ${c.telefone ? ` · WhatsApp: ${esc(c.telefone)}` : ''}
            </div>
          </div>

          <h2 style="font:700 18px 'Poppins';color:var(--teal);margin-bottom:8px">
            SOLICITAÇÃO FORMAL DE DOCUMENTAÇÃO CADASTRAL
          </h2>
          <p style="font-size:13px;line-height:1.6;color:#2D4044;margin:0 0 16px;text-align:justify">
            Prezado(a) <strong>${esc(c.nome)}</strong>,<br>
            Para fins de regularidade cadastral e formalização do contrato mercantil de prestação de serviços autônomos junto à <strong>${esc(empresa.razaoSocial)}</strong>, solicitamos o envio tempestivo dos seguintes documentos comprobatórios obrigatórios para validação de seu dossiê:
          </p>

          <!-- Checklist de Documentos Requeridos -->
          <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:22px">
            <div style="border:1.5px solid var(--line);border-radius:12px;padding:12px 16px;background:${comp.hasResidencia ? '#F4FBF7' : '#FFFDF7'};display:flex;align-items:flex-start;gap:12px">
              <span style="width:24px;height:24px;border-radius:50%;background:${comp.hasResidencia ? 'var(--green)' : 'var(--teal)'};color:${comp.hasResidencia ? 'var(--teal3)' : '#fff'};display:grid;place-items:center;font-weight:800;font-size:11px;flex:none">
                ${comp.hasResidencia ? '✓' : '1'}
              </span>
              <div style="flex:1">
                <div style="display:flex;justify-content:space-between;align-items:center">
                  <strong style="color:var(--teal);font-size:13px">1. Comprovante de Residência Atualizado</strong>
                  ${comp.hasResidencia ? '<span class="doc-badge-pill ok">✓ Já Arquivado</span>' : '<span class="doc-badge-pill warn">⚠️ Pendente</span>'}
                </div>
                <div style="font-size:11.5px;color:var(--muted);margin-top:2px">
                  Cópia legível de conta de consumo (energia elétrica, água, gás, internet ou telefone fixo) com data de emissão inferior a 90 (noventa) dias.
                </div>
              </div>
            </div>

            <div style="border:1.5px solid var(--line);border-radius:12px;padding:12px 16px;background:${comp.hasIdentidade ? '#F4FBF7' : '#FFFDF7'};display:flex;align-items:flex-start;gap:12px">
              <span style="width:24px;height:24px;border-radius:50%;background:${comp.hasIdentidade ? 'var(--green)' : 'var(--teal)'};color:${comp.hasIdentidade ? 'var(--teal3)' : '#fff'};display:grid;place-items:center;font-weight:800;font-size:11px;flex:none">
                ${comp.hasIdentidade ? '✓' : '2'}
              </span>
              <div style="flex:1">
                <div style="display:flex;justify-content:space-between;align-items:center">
                  <strong style="color:var(--teal);font-size:13px">2. Documento Oficial de Identificação (RG ou CNH)</strong>
                  ${comp.hasIdentidade ? '<span class="doc-badge-pill ok">✓ Já Arquivado</span>' : '<span class="doc-badge-pill warn">⚠️ Pendente</span>'}
                </div>
                <div style="font-size:11.5px;color:var(--muted);margin-top:2px">
                  Cópia nítida frente e verso de documento oficial de identificação com foto e número de CPF legível (RG recente ou CNH válida).
                </div>
              </div>
            </div>

            ${comp.isPj ? `
            <div style="border:1.5px solid var(--line);border-radius:12px;padding:12px 16px;background:${comp.hasCnpj ? '#F4FBF7' : '#FFFDF7'};display:flex;align-items:flex-start;gap:12px">
              <span style="width:24px;height:24px;border-radius:50%;background:${comp.hasCnpj ? 'var(--green)' : 'var(--teal)'};color:${comp.hasCnpj ? 'var(--teal3)' : '#fff'};display:grid;place-items:center;font-weight:800;font-size:11px;flex:none">
                ${comp.hasCnpj ? '✓' : '3'}
              </span>
              <div style="flex:1">
                <div style="display:flex;justify-content:space-between;align-items:center">
                  <strong style="color:var(--teal);font-size:13px">3. Cartão CNPJ Ativo na Receita Federal</strong>
                  ${comp.hasCnpj ? '<span class="doc-badge-pill ok">✓ Já Arquivado</span>' : '<span class="doc-badge-pill warn">⚠️ Pendente</span>'}
                </div>
                <div style="font-size:11.5px;color:var(--muted);margin-top:2px">
                  Comprovante de Inscrição e Situação Cadastral emitido diretamente no site da Receita Federal com status regular/ativo.
                </div>
              </div>
            </div>
            ` : ''}

            <div style="border:1.5px solid var(--line);border-radius:12px;padding:12px 16px;background:#F9FBFB;display:flex;align-items:flex-start;gap:12px">
              <span style="width:24px;height:24px;border-radius:50%;background:var(--teal);color:#fff;display:grid;place-items:center;font-weight:800;font-size:11px;flex:none">
                ${comp.isPj ? '4' : '3'}
              </span>
              <div style="flex:1">
                <div style="display:flex;justify-content:space-between;align-items:center">
                  <strong style="color:var(--teal);font-size:13px">${comp.isPj ? '4' : '3'}. Dados Bancários &amp; Chave PIX</strong>
                  <span class="doc-badge-pill ok">Informativo</span>
                </div>
                <div style="font-size:11.5px;color:var(--muted);margin-top:2px">
                  Confirmação de chave PIX vinculada ao titular/CNPJ para quitação e liquidação dos honorários mensais devidos.
                </div>
              </div>
            </div>
          </div>

          <!-- Instruções e prazo -->
          <div style="background:var(--teal3);color:#fff;border-radius:14px;padding:16px 20px;font-size:12px;line-height:1.55">
            <strong style="color:var(--green);font-size:13px;display:block;margin-bottom:4px">Instruções Importantes para Envio:</strong>
            • Os arquivos podem ser enviados em formato <strong>PDF, PNG ou JPG</strong> com excelente nitidez e sem cortes.<br>
            • Envie todos os arquivos de uma só vez respondendo ao e-mail: <strong>${esc(empresa.email)}</strong> ou pelo WhatsApp oficial: <strong>${esc(empresa.whatsapp || '(67) 98189-6548')}</strong>.<br>
            • <strong>Prazo improrrogável:</strong> envio em até <strong>5 (cinco) dias úteis</strong> a contar do recebimento desta notificação.
          </div>
        </div>
      </div>

      <!-- Rodapé timbrado e data/assinatura -->
      <div style="padding:0 60px 36px">
        <div style="text-align:center;font-size:12px;color:var(--muted);margin-bottom:34px">
          ${esc(empresa.cidade)} - ${esc(empresa.uf)}, ${dataHoje}.
        </div>

        <div style="display:flex;justify-content:center">
          <div style="text-align:center;width:280px;border-top:1.5px solid var(--teal);padding-top:8px">
            <strong style="font-size:13px;color:var(--teal);display:block">${esc(empresa.razaoSocial)}</strong>
            <span style="font-size:11px;color:var(--muted)">Recursos Humanos &amp; Compliance Jurídico</span>
          </div>
        </div>

        <div style="margin-top:26px;border-top:1px solid var(--line);padding-top:10px;display:flex;justify-content:space-between;font-size:9.5px;color:var(--muted)">
          <span>${esc(empresa.nomeFantasia)} · Sistema de Gestão de Contratos e Colaboradores</span>
          <span>Documento Oficial de Notificação Cadastral</span>
        </div>
      </div>
    </div>`;
}

export function abrirSolicitacaoDocumentos(colabId) {
  const c = store.find('colaboradores', colabId);
  if (!c) return toast('Colaborador não encontrado.', 'err');
  const e = store.state.settings.empresa;
  const comp = docCompliance(c);

  const pageHtml = renderSolicitacaoA4(c, e);

  const m = modal({
    title: `📋 Solicitação Formal de Documentos: ${esc(c.nome)}`,
    size: 'lg',
    body: `
      <div class="pv-bar" style="margin:-20px -22px 16px -22px;border-top:none;padding:10px 22px">
        <span class="small muted">Visualização de impressão em formato oficial A4 (210 x 297 mm)</span>
        <div class="actions">
          <button class="btn btn-sm btn-wa" id="btn-solic-wa">${ICON.whatsapp} Copiar p/ WhatsApp</button>
          <button class="btn btn-sm" id="btn-solic-print">${ICON.printer} Imprimir</button>
          <button class="btn btn-sm btn-go" id="btn-solic-pdf">${ICON.download} Baixar PDF</button>
        </div>
      </div>
      <div style="background:#DCE4E5;padding:20px;border-radius:12px;overflow:auto;max-height:70vh;display:flex;justify-content:center">
        <div class="fz-doc" style="zoom:0.75;box-shadow:0 10px 30px rgba(0,0,0,.15);border-radius:2px">
          ${pageHtml}
        </div>
      </div>
    `,
    footer: `<button class="btn btn-ghost" data-close>Fechar</button>`,
  });

  m.el.querySelector('#btn-solic-pdf').addEventListener('click', () => {
    exportPDF([pageHtml], `Solicitacao_Documentos_${c.nome.replace(/\s+/g, '_')}`);
  });

  m.el.querySelector('#btn-solic-print').addEventListener('click', () => {
    printPages([pageHtml]);
  });

  m.el.querySelector('#btn-solic-wa').addEventListener('click', () => {
    const pendencias = [];
    if (!comp.hasResidencia) pendencias.push('1️⃣ Comprovante de Residência Atualizado (luz, água, internet, < 90 dias)');
    if (!comp.hasIdentidade) pendencias.push('2️⃣ Documento Oficial com Foto (RG ou CNH legível frente e verso)');
    if (comp.isPj && !comp.hasCnpj) pendencias.push('3️⃣ Cartão CNPJ Ativo na Receita Federal');
    pendencias.push(`${comp.isPj ? '4️⃣' : '3️⃣'} Chave PIX e dados bancários para quitação de honorários`);

    const msg = `Olá, ${c.nome}! 👋\n\nPara a formalização jurídica do seu contrato na *${e.nomeFantasia}*, precisamos dos seguintes documentos para o seu dossiê cadastral:\n\n${pendencias.join('\n\n')}\n\nVocê pode nos enviar os arquivos aqui no WhatsApp ou responder ao e-mail (${e.email}) *todos de uma só vez* em PDF ou imagem legível.\n\nFicamos à disposição! 🚀`;

    navigator.clipboard.writeText(msg).then(() => {
      toast('Mensagem formatada copiada com sucesso! Cole no WhatsApp do colaborador.');
    });
  });
}

// --------------------------------------------------------------------------
// View Principal: Lista de Colaboradores e Métricas
// --------------------------------------------------------------------------
// Funções da Bíblia Operacional (atribuições e SLAs) e multas padrão do contrato PJ
function abrirFuncoes() {
  const st = store.state;
  const fs = st.catalogo.funcoes;
  const R = st.settings.regrasPJ;
  const n = (k, l, suf, dica) => `<div class="field c3"><label>${l}</label><div class="in-group"><input class="in" type="number" step="1" min="0" data-r="${k}" value="${R[k]}"><span class="suf">${suf}</span></div>${dica ? `<span class="hint">${dica}</span>` : ''}</div>`;
  const m = modal({
    title: 'Funções & multas do contrato PJ', size: 'lg',
    body: `<div class="note info" style="margin-bottom:14px">Valem para os contratos gerados daqui em diante. Depois de gerado, o texto de cada contrato pode ser ajustado na aba Cláusulas.</div>
      <div class="sec"><div class="sec-h"><h3>Multas e prazos</h3></div><div class="fgrid">
        ${n('multaAtrasoPct', 'Multa por atraso', '% / dia útil', 'por entrega atrasada')}
        ${n('multaNaoEntregaPct', 'Multa por não entrega', '%', 'por entrega')}
        ${n('multaErroGravePct', 'Multa por erro grave', '%', 'por ocorrência')}
        ${n('tetoMultasPct', 'Limite de multas no mês', '%', 'da remuneração')}
        ${n('diasNaoEntrega', 'Vira "não entrega" após', 'dias úteis')}
        ${n('prazoAjusteHoras', 'Prazo para corrigir', 'h úteis')}
        ${n('prazoDefesaHoras', 'Prazo para justificar', 'horas')}
        ${n('avisoPrevioDias', 'Aviso prévio', 'dias')}
        ${n('diaNF', 'Nota fiscal até o dia', '')}
        ${n('diaPagamento', 'Pagamento até o dia', '')}
        ${n('diaPagamentoAtraso', 'Se a NF atrasar, paga dia', '')}
        ${n('multaAliciamentoMeses', 'Multa por aliciar cliente', 'remunerações')}
        ${n('multaSigiloMeses', 'Multa por quebra de sigilo', 'remunerações')}
        ${n('anosSigilo', 'Sigilo após o término', 'anos')}
      </div></div>
      <div class="sec"><div class="sec-h"><div><h3>Funções</h3><p>Uma linha por atribuição. Nas entregas, use "Entrega | prazo".</p></div></div>
      ${fs.map((f, i) => `<details class="clause" data-f="${i}"><summary class="clause-h"><span class="num">${i + 1}</span><span class="t">${esc(f.nome)}</span></summary>
        <div class="clause-b"><div class="fgrid">
          ${field('Nome da função', `<input class="in" data-k="nome" value="${esc(f.nome)}">`, 'c12')}
          ${field('Atribuições', `<textarea class="in" rows="7" data-k="atribuicoes">${esc(f.atribuicoes.join('\n'))}</textarea>`, 'c12')}
          ${field('Entregas e prazos (SLA)', `<textarea class="in" rows="6" data-k="entregas">${esc(f.entregas.map((e) => e.join(' | ')).join('\n'))}</textarea>`, 'c12')}
        </div></div></details>`).join('')}</div>`,
    footer: '<button class="btn btn-go" data-close>Pronto</button>',
  });
  m.el.addEventListener('input', (e) => {
    const t = e.target;
    if (t.dataset.r) { R[t.dataset.r] = Number(t.value) || 0; store.save(); return; }
    const d = t.closest('[data-f]'); if (!d || !t.dataset.k) return;
    const f = fs[d.dataset.f];
    const linhas = t.value.split('\n').map((x) => x.replace(/^\s*[-•]\s*/, '').trim()).filter(Boolean);
    if (t.dataset.k === 'nome') { f.nome = t.value; d.querySelector('.t').textContent = t.value; }
    else if (t.dataset.k === 'atribuicoes') f.atribuicoes = linhas;
    else f.entregas = linhas.map((l) => { const [a, ...b] = l.split('|'); return [a.trim(), b.join('|').trim() || 'conforme registrado na ferramenta de gestão']; });
    store.save();
  });
}

export function render(main) {
  let filtroStatus = 'Todos';
  let searchQuery = '';
  let filtroTipo = 'Todos';

  main.innerHTML = `
    <div class="top">
      <div>
        <h1>Colaboradores &amp; Prestadores</h1>
        <p>Gestão de equipe autônoma, blindagem trabalhista (Art. 3º CLT), arquivo de documentos e comodato de IA.</p>
      </div>
      <div class="actions">
        <button class="btn" id="btn-funcoes">${ICON.pen} Funções & multas</button>
        <button class="btn btn-go" id="btn-novo-colab">${ICON.plus} Novo colaborador / prestador</button>
      </div>
    </div>

    <!-- Métricas do Dossiê -->
    <div class="grid g4" style="margin-bottom:20px" id="colab-metrics"></div>

    <!-- Barra de busca e filtros -->
    <div class="toolbar">
      <div class="search">
        ${ICON.search}
        <input class="in" id="search-colab" placeholder="Buscar por nome, cargo ou CNPJ/CPF...">
      </div>
      <div class="seg" id="seg-status">
        <button data-s="Todos" class="on">Todos</button>
        <button data-s="Ativo">Ativos</button>
        <button data-s="Pendente Documentos">Pendentes Docs</button>
        <button data-s="Inativo">Inativos</button>
      </div>
      <div class="seg" id="seg-tipo">
        <button data-t="Todos" class="on">Todos tipos</button>
        <button data-t="PJ">PJ</button>
        <button data-t="PF">PF</button>
      </div>
    </div>

    <div class="card" style="padding:6px 10px">
      <table class="table">
        <thead>
          <tr>
            <th>Colaborador / Razão Social</th>
            <th>Função &amp; Especialidade</th>
            <th>Tipo</th>
            <th class="r">Honorários</th>
            <th>Dossiê Documental</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody id="tb-colab"></tbody>
      </table>
    </div>
  `;

  const draw = () => {
    const list = store.state.colaboradores || [];

    // Atualiza métricas
    const total = list.length;
    const ativos = list.filter((c) => c.status === 'Ativo').length;
    const completos = list.filter((c) => docCompliance(c).count === docCompliance(c).totalNecessario).length;
    const pendentes = list.filter((c) => docCompliance(c).count < docCompliance(c).totalNecessario).length;

    main.querySelector('#colab-metrics').innerHTML = `
      <div class="metric">
        <span>Total de Prestadores</span>
        <strong>${total}</strong>
        <small>Colaboradores cadastrados</small>
        <div class="m-ico">${ICON.users}</div>
      </div>
      <div class="metric">
        <span>Ativos no Mês</span>
        <strong style="color:var(--green-d)">${ativos}</strong>
        <small>PJ e parceiros</small>
        <div class="m-ico" style="background:var(--green-soft);color:var(--green-d)">${ICON.check}</div>
      </div>
      <div class="metric">
        <span>Dossiês Completos</span>
        <strong style="color:var(--blue)">${completos}</strong>
        <small>Comprovante, CNH e CNPJ arquivados</small>
        <div class="m-ico" style="background:var(--blue-soft);color:var(--blue)">${ICON.file}</div>
      </div>
      <div class="metric dark">
        <span>Documentos Pendentes</span>
        <strong style="color:var(--yellow)">${pendentes}</strong>
        <small>Aguardando regularização</small>
        <div class="m-ico" style="background:rgba(255,242,122,.2);color:var(--yellow)">${ICON.alert}</div>
      </div>
    `;

    // Filtra lista
    const filtered = list.filter((c) => {
      const matchSearch = !searchQuery ||
        (c.nome && c.nome.toLowerCase().includes(searchQuery)) ||
        (c.razaoSocial && c.razaoSocial.toLowerCase().includes(searchQuery)) ||
        (c.cargo && c.cargo.toLowerCase().includes(searchQuery)) ||
        (c.cpfCnpj && c.cpfCnpj.toLowerCase().includes(searchQuery));
      const matchStatus = filtroStatus === 'Todos' || c.status === filtroStatus;
      const matchTipo = filtroTipo === 'Todos' || c.tipo === filtroTipo;
      return matchSearch && matchStatus && matchTipo;
    });

    const tb = main.querySelector('#tb-colab');
    if (!filtered.length) {
      tb.innerHTML = `<tr><td colspan="7"><div class="empty"><div class="big">👥</div><h3>Nenhum colaborador ou prestador encontrado</h3><p>Cadastre seus prestadores PJ para arquivar documentos e emitir contratos com blindagem jurídica.</p></div></td></tr>`;
      return;
    }

    tb.innerHTML = filtered.map((c) => {
      const comp = docCompliance(c);
      return `
        <tr>
          <td>
            <div class="cell-main">${esc(c.nome)}</div>
            <div class="cell-sub">${esc(c.razaoSocial || c.tipo)} · Doc: ${fmtDoc(c.cpfCnpj)}</div>
          </td>
          <td>
            <div style="font-weight:700;color:var(--teal)">${esc(c.cargo || '—')}</div>
            <div class="cell-sub">${esc(c.especialidade || '')}</div>
          </td>
          <td>
            <span class="chip s-rascunho" style="font-weight:700">${esc(c.tipo)}</span>
          </td>
          <td class="r mono">
            ${c.remuneracao ? `${brlShort(c.remuneracao)}<span class="small muted">/${c.periodicidade === 'Mensal' ? 'mês' : 'demanda'}</span>` : '—'}
            <div class="cell-sub">${c.chavePix ? `PIX: ${esc(c.chavePix)}` : ''}</div>
          </td>
          <td>
            ${comp.badge}
          </td>
          <td>
            ${statusChip(c.status)}
          </td>
          <td class="acts">
            <button class="btn btn-sm btn-dark" data-act="dossie" data-id="${c.id}" title="Gerenciar Documentos e Arquivos">📁 Dossiê</button>
            <button class="btn btn-sm" data-act="solicitar" data-id="${c.id}" title="Exportar Carta de Solicitação de Documentos em PDF">📋 Solicitar Docs</button>
            <button class="btn btn-sm" data-act="contrato-mei" data-id="${c.id}" title="Gerar contrato de prestação de serviços PJ com atribuições, prazos e multas da função">⚖️ Contrato PJ</button>
            <button class="btn btn-sm" data-act="sublocacao" data-id="${c.id}" title="Gerar Termo de Cessão de Espaço (Coworking) &amp; Comodato de IA">🏢 Sublocação &amp; IA</button>
            <button class="btn btn-sm btn-icon" data-act="editar" data-id="${c.id}" title="Editar dados">${ICON.pen}</button>
            <button class="btn btn-sm btn-icon btn-danger" data-act="excluir" data-id="${c.id}" title="Excluir">${ICON.trash}</button>
          </td>
        </tr>
      `;
    }).join('');
  };

  draw();

  // Listeners da toolbar
  main.querySelector('#btn-novo-colab').addEventListener('click', () => {
    abrirEditorColaborador(null, draw);
  });
  main.querySelector('#btn-funcoes').addEventListener('click', abrirFuncoes);

  main.querySelector('#search-colab').addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    draw();
  });

  main.querySelector('#seg-status').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    filtroStatus = b.dataset.s;
    main.querySelectorAll('#seg-status button').forEach((x) => x.classList.toggle('on', x === b));
    draw();
  });

  main.querySelector('#seg-tipo').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    filtroTipo = b.dataset.t;
    main.querySelectorAll('#seg-tipo button').forEach((x) => x.classList.toggle('on', x === b));
    draw();
  });

  // Ações da tabela
  main.querySelector('#tb-colab').addEventListener('click', async (e) => {
    const b = e.target.closest('button[data-act]');
    if (!b) return;
    const act = b.dataset.act;
    const id = b.dataset.id;

    if (act === 'dossie') {
      abrirDossie(id, draw);
    } else if (act === 'solicitar') {
      abrirSolicitacaoDocumentos(id);
    } else if (act === 'contrato-mei') {
      const ct = gerarContratoColaborador(id, 'colaborador_mei');
      toast('Contrato de prestação de serviços PJ gerado!');
      location.hash = `#/contrato/${ct.id}`;
    } else if (act === 'sublocacao') {
      const ct = gerarContratoColaborador(id, 'sublocacao_ia');
      toast('Instrumento de Cessão e Comodato IA gerado!');
      location.hash = `#/contrato/${ct.id}`;
    } else if (act === 'editar') {
      abrirEditorColaborador(id, draw);
    } else if (act === 'excluir') {
      const c = store.find('colaboradores', id);
      if (await confirmDialog(`Excluir o colaborador "${c?.nome}" e seu dossiê associado?`, { ok: 'Excluir', danger: true })) {
        store.remove('colaboradores', id);
        toast('Colaborador removido.');
        draw();
      }
    }
  });
}
