// Cadastro de clientes, com busca automática de CNPJ (BrasilAPI) e CEP (ViaCEP).
import { store } from '../store.js';
import { ICON } from '../icons.js';
import { esc, uid, fmtDoc, fmtPhone, fmtCep, onlyDigits, toast } from '../util.js';
import { modal, bind, field, inp, confirmDialog } from '../ui.js';
import { novaProposta, novaPropostaAssistente } from '../flow.js';

export const novoCliente = () => ({
  id: '', tipo: 'PJ', nome: '', nomeFantasia: '', contato: '', documento: '', email: '', whatsapp: '', instagram: '', segmento: '', segmentoId: '',
  cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '', representante: { nome: '', cpf: '' }, observacoes: '',
});

export function clienteForm() {
  return `<div class="fgrid">
    <div class="field c12"><div class="seg" id="tipo-seg"><button type="button" data-tipo="PJ">Pessoa jurídica (CNPJ)</button><button type="button" data-tipo="PF">Pessoa física (CPF)</button></div></div>
    <div class="field c6"><label data-l="doc">CNPJ</label><div class="in-group"><input class="in" data-bind="documento" placeholder="00.000.000/0000-00"><button type="button" class="btn btn-dark" data-act="cnpj" title="Buscar dados na Receita">${ICON.search} Buscar</button></div><span class="hint" data-h="doc">Preenche razão social e endereço automaticamente.</span></div>
    ${field('<span data-l="nome">Razão social</span>', inp('nome'), 'c6')}
    ${field('Nome fantasia / marca', inp('nomeFantasia'), 'c6')}
    ${field('Como chamar na proposta', inp('contato', 'placeholder="Ex.: Karol, Dr. e Dra. Viola"'), 'c6', 'Aparece no "Olá, ..." da proposta.')}
    ${field('WhatsApp', inp('whatsapp', 'placeholder="(67) 99999-9999"'), 'c4')}
    ${field('E-mail', inp('email', 'type="email"'), 'c4')}
    ${field('Instagram', inp('instagram', 'placeholder="@perfil"'), 'c4')}
    <div class="field c4"><label>CEP</label><div class="in-group"><input class="in" data-bind="cep" placeholder="00000-000"><button type="button" class="btn btn-icon" data-act="cep" title="Buscar CEP">${ICON.search}</button></div></div>
    ${field('Logradouro', inp('logradouro'), 'c8')}
    ${field('Número', inp('numero'), 'c3')}
    ${field('Complemento', inp('complemento'), 'c4')}
    ${field('Bairro', inp('bairro'), 'c5')}
    ${field('Cidade', inp('cidade'), 'c8')}
    ${field('UF', inp('uf', 'maxlength="2"'), 'c4')}
    <div class="c12 pj-only fgrid" style="gap:12px">
      ${field('Representante legal', inp('representante.nome'), 'c7')}
      ${field('CPF do representante', inp('representante.cpf'), 'c5')}
    </div>
    ${field('Segmento', `<select class="in" data-bind="segmentoId"><option value="">— outro / não definido —</option>${store.state.catalogo.segmentos.map((g) => `<option value="${g.id}">${esc(g.nome)}</option>`).join('')}</select>`, 'c12', 'Novas propostas já saem com diagnóstico e plano do segmento.')}
  </div>`;
}

export function wireClienteForm(root, c, onChange) {
  const refresh = () => {
    root.querySelectorAll('#tipo-seg button').forEach((b) => b.classList.toggle('on', b.dataset.tipo === c.tipo));
    const pj = c.tipo !== 'PF';
    root.querySelector('[data-l="doc"]').textContent = pj ? 'CNPJ' : 'CPF';
    root.querySelector('[data-l="nome"]').textContent = pj ? 'Razão social' : 'Nome completo';
    root.querySelector('[data-act="cnpj"]').style.display = pj ? '' : 'none';
    root.querySelector('[data-h="doc"]').style.display = pj ? '' : 'none';
    root.querySelector('.pj-only').style.display = pj ? '' : 'none';
  };
  bind(root, c, (path, val, el) => {
    if (path === 'documento') { el.value = fmtDoc(val); c.documento = el.value; }
    if (path === 'whatsapp' && onlyDigits(val).length >= 10) { el.value = fmtPhone(val); c.whatsapp = el.value; }
    if (path === 'cep' && onlyDigits(val).length === 8) { el.value = fmtCep(val); c.cep = el.value; buscarCep(); }
    if (path === 'uf') { el.value = val.toUpperCase(); c.uf = el.value; }
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
    const cnpj = onlyDigits(c.documento);
    if (cnpj.length !== 14) return toast('Digite um CNPJ com 14 dígitos.', 'err');
    const btn = e.currentTarget; btn.disabled = true;
    try {
      const r = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`).then((x) => { if (!x.ok) throw new Error(x.status); return x.json(); });
      set('nome', r.razao_social); set('nomeFantasia', r.nome_fantasia);
      set('logradouro', [r.descricao_tipo_de_logradouro, r.logradouro].filter(Boolean).join(' ')); set('numero', r.numero); set('complemento', r.complemento);
      set('bairro', r.bairro); set('cidade', r.municipio); set('uf', r.uf); set('cep', fmtCep(r.cep));
      if (!c.email && r.email) set('email', String(r.email).toLowerCase());
      const socio = (r.qsa || [])[0]?.nome_socio;
      if (socio && !c.representante?.nome) { c.representante = { ...(c.representante || {}), nome: socio }; root.querySelector('[data-bind="representante.nome"]').value = socio; }
      toast('Dados do CNPJ preenchidos!');
      onChange && onChange();
    } catch { toast('CNPJ não encontrado ou serviço indisponível.', 'err'); }
    btn.disabled = false;
  });
  root.querySelectorAll('#tipo-seg button').forEach((b) => b.addEventListener('click', () => { c.tipo = b.dataset.tipo; refresh(); onChange && onChange(); }));
  refresh();
}

export function abrirCliente(id, after) {
  const orig = id ? store.find('clientes', id) : null;
  const c = orig ? JSON.parse(JSON.stringify(orig)) : novoCliente();
  const m = modal({
    title: orig ? 'Editar cliente' : 'Novo cliente', size: 'lg', body: clienteForm(),
    footer: `<button class="btn" data-close>Cancelar</button><button class="btn btn-go" data-ok>Salvar cliente</button>`,
  });
  wireClienteForm(m.el, c);
  m.el.querySelector('[data-ok]').addEventListener('click', () => {
    if (!c.nome && !c.nomeFantasia) return toast('Informe o nome do cliente.', 'err');
    if (!c.id) { c.id = uid('cli'); c.criadoEm = new Date().toISOString(); }
    store.upsert('clientes', c);
    toast('Cliente salvo!');
    m.close();
    after && after(c);
  });
}

export function render(main) {
  let q = '';
  const draw = () => {
    const st = store.state;
    const list = st.clientes.filter((c) => !q || `${c.nome} ${c.nomeFantasia} ${c.documento} ${c.cidade}`.toLowerCase().includes(q));
    main.querySelector('#tb').innerHTML = list.length ? list.map((c) => {
      const props = st.propostas.filter((p) => p.clienteId === c.id).length;
      const ct = st.contratos.find((x) => x.clienteId === c.id && x.status === 'Assinado');
      return `<tr>
        <td><div class="cell-main">${esc(c.nomeFantasia || c.nome)}</div><div class="cell-sub">${esc(c.nomeFantasia ? c.nome : '')}</div></td>
        <td class="small">${esc(fmtDoc(c.documento) || '—')}</td>
        <td class="small">${esc([c.cidade, c.uf].filter(Boolean).join('/') || '—')}</td>
        <td class="small">${esc(c.whatsapp || c.email || '—')}</td>
        <td>${ct ? '<span class="chip s-ativo">Cliente ativo</span>' : `<span class="chip">${props} proposta${props === 1 ? '' : 's'}</span>`}</td>
        <td class="acts"><button class="btn btn-sm btn-go" data-prop="${c.id}">${ICON.plus} Proposta</button><button class="btn btn-sm btn-icon" data-edit="${c.id}">${ICON.pen}</button><button class="btn btn-sm btn-icon btn-danger" data-del="${c.id}">${ICON.trash}</button></td>
      </tr>`;
    }).join('') : `<tr><td colspan="6"><div class="empty"><div class="big">👋</div><h3>Nenhum cliente ainda</h3><p>Cadastre pelo CNPJ e o sistema preenche o resto.</p></div></td></tr>`;
  };
  main.innerHTML = `
    <div class="top"><div><h1>Clientes</h1><p>Os dados daqui alimentam propostas e contratos automaticamente.</p></div>
      <div class="actions"><button class="btn btn-go" data-act="novo">${ICON.plus} Novo cliente</button></div></div>
    <div class="toolbar"><div class="search">${ICON.search}<input class="in" placeholder="Buscar por nome, CNPJ ou cidade" id="q"></div></div>
    <div class="card" style="padding:6px 10px"><table class="table"><thead><tr><th>Cliente</th><th>Documento</th><th>Cidade</th><th>Contato</th><th>Situação</th><th></th></tr></thead><tbody id="tb"></tbody></table></div>`;
  draw();
  main.querySelector('#q').addEventListener('input', (e) => { q = e.target.value.toLowerCase(); draw(); });
  main.querySelector('[data-act="novo"]').addEventListener('click', () => abrirCliente(null, draw));
  main.addEventListener('click', async (e) => {
    const t = e.target.closest('button');
    if (!t) return;
    if (t.dataset.edit) abrirCliente(t.dataset.edit, draw);
    if (t.dataset.prop) { const p = novaPropostaAssistente({ clienteId: t.dataset.prop }); location.hash = `#/proposta/${p.id}`; }
    if (t.dataset.del && await confirmDialog('Excluir este cliente? As propostas e contratos continuam salvos.', { ok: 'Excluir', danger: true })) { store.remove('clientes', t.dataset.del); draw(); }
  });
}
