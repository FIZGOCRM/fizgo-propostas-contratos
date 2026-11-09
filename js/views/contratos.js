// Lista de contratos com separação estrita: Clientes vs Prestadores/MEI,
// KPIs dedicados, filtros avançados e assistentes especializados de emissão rápida.
import { store } from '../store.js';
import { ICON } from '../icons.js';
import { esc, fmtDate, brlShort, addMonths, diffDays, today, waLink, toast } from '../util.js';
import { statusChip, confirmDialog, modal } from '../ui.js';
import { calcOpcao } from '../calc.js';
import { criarContratoDireto, gerarContrato, gerarContratoColaborador, mensagemContrato } from '../flow.js';

const FILTROS_STATUS = ['Todos', 'Rascunho', 'Enviado', 'Assinado', 'Encerrado'];

export const isContratoPrestador = (ct) => Boolean(
  ct.colaboradorId ||
  ct.modeloId === 'colaborador_mei' ||
  ct.modeloId === 'sublocacao_ia' ||
  ct.partes === 'prestador'
);

export function render(main) {
  let abaAtiva = 'clientes'; // 'clientes' | 'prestadores'
  let filtroStatus = 'Todos';
  let filtroPeriodo = 'todas';
  let filtroModelo = 'todos';
  let ordenacao = 'recente';
  let q = '';

  main.innerHTML = `
    <div class="top">
      <div>
        <h1>Contratos Jurídicos</h1>
        <p>Documentos com validade jurídica, gestão de vigência, controle de multas e assinatura digital.</p>
      </div>
      <div class="actions">
        <button class="btn btn-go" id="btn-wiz-ct">
          ${ICON.plus} Novo Contrato
        </button>
        <a class="btn" href="#/propostas">${ICON.file} Ir para Propostas</a>
      </div>
    </div>

    <!-- Seletor de Aba Estrita: Clientes vs Prestadores -->
    <div style="display:flex;gap:10px;margin-bottom:18px;border-bottom:2px solid var(--line);padding-bottom:12px;flex-wrap:wrap">
      <button class="btn-tab-switch active" id="tab-clientes" style="display:flex;align-items:center;gap:8px;padding:9px 18px;border-radius:10px;font-size:14px;font-weight:700;border:1px solid var(--teal);background:var(--teal);color:#fff;cursor:pointer">
        <span>🏢 Contratos com Clientes</span>
        <span class="badge" id="badge-count-cli" style="background:rgba(255,255,255,.25);color:#fff;padding:2px 8px;border-radius:99px;font-size:12px">0</span>
      </button>
      <button class="btn-tab-switch" id="tab-prestadores" style="display:flex;align-items:center;gap:8px;padding:9px 18px;border-radius:10px;font-size:14px;font-weight:700;border:1px solid var(--line);background:#fff;color:var(--ink);cursor:pointer">
        <span>🤝 Contratos de Prestadores & MEI</span>
        <span class="badge" id="badge-count-prest" style="background:var(--bg-sub);color:var(--muted);padding:2px 8px;border-radius:99px;font-size:12px">0</span>
      </button>
    </div>

    <!-- KPIs do Topo (Dedicados por aba) -->
    <div class="kpi-row" id="kpi-row-ct"></div>

    <!-- Barra de Filtros Avançados -->
    <div class="filters-wrapper">
      <div class="filters-top-row">
        <div class="search" style="max-width:340px">
          ${ICON.search}
          <input class="in" id="q-ct" placeholder="Buscar por contratante, número ou cidade...">
        </div>

        <select class="filter-select" id="filtro-periodo-ct" title="Filtrar por data/período de início">
          <option value="todas">📅 Todas as datas</option>
          <option value="mes">📅 Início este mês</option>
          <option value="mes_passado">📅 Início mês passado</option>
          <option value="30d">📅 Últimos 30 dias</option>
          <option value="90d">📅 Últimos 90 dias</option>
          <option value="ano">📅 Este ano (${today().slice(0, 4)})</option>
        </select>

        <select class="filter-select" id="filtro-modelo-ct" title="Filtrar por modelo/tipo de contrato">
          <!-- Preenchido dinamicamente conforme a aba ativa -->
        </select>

        <select class="filter-select" id="ordenacao-ct" title="Ordenar lista">
          <option value="recente">⚡ Mais recentes primeiro</option>
          <option value="antiga">⏳ Mais antigos primeiro</option>
          <option value="maior_valor">📈 Maior valor primeiro</option>
          <option value="menor_valor">📉 Menor valor primeiro</option>
        </select>

        <div id="clear-wrap-ct" style="display:none">
          <button class="filter-clear-btn" id="btn-clear-ct">${ICON.x} Limpar filtros</button>
        </div>

        <span class="filter-count-badge" id="count-badge-ct"></span>
      </div>

      <!-- Segmento de Status -->
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
        <span class="lbl" style="font-size:12px;color:var(--muted)">Status:</span>
        <div class="seg" id="seg-ct">
          ${FILTROS_STATUS.map((f) => `<button data-f="${f}">${f}</button>`).join('')}
        </div>
      </div>
    </div>

    <!-- Tabela de Contratos -->
    <div class="card" style="padding:6px 10px">
      <table class="table">
        <thead id="th-ct"></thead>
        <tbody id="tb-ct"></tbody>
      </table>
    </div>`;

  const syncModelosOptions = () => {
    const sel = main.querySelector('#filtro-modelo-ct');
    if (!sel) return;
    if (abaAtiva === 'clientes') {
      sel.innerHTML = `
        <option value="todos">📑 Todos os modelos de clientes</option>
        <option value="recorrente">📑 Marketing Recorrente (Lake / Lake Plus)</option>
        <option value="contrato_trafego">🎯 Gestão de Tráfego Pago & Performance</option>
        <option value="contrato_growth_v4">🚀 Assessoria Growth (Nacional)</option>
        <option value="contrato_audiovisual">🎬 Produção Audiovisual & Captação</option>
        <option value="contrato_design_full">🎨 Design Gráfico Sem Limite</option>
        <option value="projeto">🌐 Projeto Pontual (LP / Identidade)</option>
        <option value="aditivo">📝 Termo Aditivo</option>
      `;
    } else {
      sel.innerHTML = `
        <option value="todos">🤝 Todos os contratos de prestadores</option>
        <option value="colaborador_mei">🤝 Prestador de Serviços (MEI com SLAs)</option>
        <option value="sublocacao_ia">💻 Cessão Coworking & Comodato de IA</option>
      `;
    }
    sel.value = filtroModelo;
    if (sel.value !== filtroModelo) filtroModelo = 'todos';
  };

  const matchPeriodo = (isoDate, periodo) => {
    if (!isoDate || periodo === 'todas') return true;
    const hj = today();
    const dStr = String(isoDate).slice(0, 10);
    if (periodo === 'mes') return dStr.slice(0, 7) === hj.slice(0, 7);
    if (periodo === 'mes_passado') {
      const ym = hj.slice(0, 7).split('-');
      const y = Number(ym[0]), m = Number(ym[1]);
      const prevM = m === 1 ? 12 : m - 1;
      const prevY = m === 1 ? y - 1 : y;
      const prevStr = `${prevY}-${String(prevM).padStart(2, '0')}`;
      return dStr.slice(0, 7) === prevStr;
    }
    const diff = diffDays(dStr, hj);
    if (periodo === '30d') return diff >= 0 && diff <= 30;
    if (periodo === '90d') return diff >= 0 && diff <= 90;
    if (periodo === 'ano') return dStr.slice(0, 4) === hj.slice(0, 4);
    return true;
  };

  const draw = () => {
    const st = store.state;
    const allCts = st.contratos || [];

    const ctsClientes = allCts.filter((c) => !isContratoPrestador(c));
    const ctsPrestadores = allCts.filter((c) => isContratoPrestador(c));

    main.querySelector('#badge-count-cli').textContent = ctsClientes.length;
    main.querySelector('#badge-count-prest').textContent = ctsPrestadores.length;

    // Atualiza botão do topo
    main.querySelector('#btn-wiz-ct').innerHTML = abaAtiva === 'clientes'
      ? `${ICON.plus} Novo Contrato de Cliente`
      : `${ICON.plus} Novo Contrato de Prestador`;

    // Alternar classes dos botões de aba
    const btnCli = main.querySelector('#tab-clientes');
    const btnPrest = main.querySelector('#tab-prestadores');
    if (abaAtiva === 'clientes') {
      btnCli.style.background = 'var(--teal)';
      btnCli.style.borderColor = 'var(--teal)';
      btnCli.style.color = '#fff';
      btnCli.querySelector('.badge').style.background = 'rgba(255,255,255,.25)';
      btnCli.querySelector('.badge').style.color = '#fff';

      btnPrest.style.background = '#fff';
      btnPrest.style.borderColor = 'var(--line)';
      btnPrest.style.color = 'var(--ink)';
      btnPrest.querySelector('.badge').style.background = 'var(--line)';
      btnPrest.querySelector('.badge').style.color = 'var(--muted)';
    } else {
      btnPrest.style.background = 'var(--teal)';
      btnPrest.style.borderColor = 'var(--teal)';
      btnPrest.style.color = '#fff';
      btnPrest.querySelector('.badge').style.background = 'rgba(255,255,255,.25)';
      btnPrest.querySelector('.badge').style.color = '#fff';

      btnCli.style.background = '#fff';
      btnCli.style.borderColor = 'var(--line)';
      btnCli.style.color = 'var(--ink)';
      btnCli.querySelector('.badge').style.background = 'var(--line)';
      btnCli.querySelector('.badge').style.color = 'var(--muted)';
    }

    const currentList = abaAtiva === 'clientes' ? ctsClientes : ctsPrestadores;

    // Renderizar KPIs específicos
    if (abaAtiva === 'clientes') {
      const assinados = currentList.filter((c) => c.status === 'Assinado');
      const mrr = assinados.reduce((a, c) => a + (c.mensalidadeVigente || calcOpcao(c.opcao, c.params).final), 0);
      const emAssinatura = currentList.filter((c) => c.status === 'Enviado');
      const kickPend = assinados.filter((c) => !c.kickoffPago).reduce((a, c) => a + calcOpcao(c.opcao, c.params).kickoff, 0);

      main.querySelector('#kpi-row-ct').innerHTML = `
        <div class="kpi-card kpi-dark">
          <span class="kpi-label">${ICON.wallet} Receita Recorrente (MRR)</span>
          <div class="kpi-val">${brlShort(mrr)}</div>
          <span class="kpi-sub">${assinados.length} contrato${assinados.length === 1 ? '' : 's'} ativo${assinados.length === 1 ? '' : 's'}</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">${ICON.sign} Contratos de Clientes Ativos</span>
          <div class="kpi-val">${assinados.length}</div>
          <span class="kpi-sub">de ${currentList.length} emitidos</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">${ICON.send} Em Assinatura</span>
          <div class="kpi-val">${emAssinatura.length}</div>
          <span class="kpi-sub">aguardando clientes</span>
        </div>
        <div class="kpi-card ${kickPend ? 'kpi-warn' : ''}">
          <span class="kpi-label">${ICON.target} Kickoffs a Receber</span>
          <div class="kpi-val" style="${kickPend ? 'color:var(--amber)' : ''}">${brlShort(kickPend)}</div>
          <span class="kpi-sub">${kickPend ? 'taxas de implementação pendentes' : 'kickoffs em dia'}</span>
        </div>
      `;
    } else {
      // Prestadores & MEI
      const assinados = currentList.filter((c) => c.status === 'Assinado');
      const custoMensal = assinados.reduce((a, c) => a + (c.mensalidadeVigente || calcOpcao(c.opcao, c.params).final), 0);
      const emAssinatura = currentList.filter((c) => c.status === 'Enviado');
      const cowIAs = currentList.filter((c) => c.modeloId === 'sublocacao_ia' && c.status === 'Assinado');

      main.querySelector('#kpi-row-ct').innerHTML = `
        <div class="kpi-card" style="border-top:3px solid #E65100">
          <span class="kpi-label">${ICON.wallet} Custo Mensal PJ (Folha MEI)</span>
          <div class="kpi-val" style="color:#D84315">${brlShort(custoMensal)}</div>
          <span class="kpi-sub">${assinados.length} prestador${assinados.length === 1 ? '' : 'es'} ativo${assinados.length === 1 ? '' : 's'}</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">${ICON.sign} Prestadores com Contrato Ativo</span>
          <div class="kpi-val">${assinados.length}</div>
          <span class="kpi-sub">com blindagem CLT e SLAs</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">${ICON.send} Em Assinatura</span>
          <div class="kpi-val">${emAssinatura.length}</div>
          <span class="kpi-sub">aguardando prestadores</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">💻 Comodato IA & Coworking</span>
          <div class="kpi-val">${cowIAs.length}</div>
          <span class="kpi-sub">termos de infraestrutura e ferramentas</span>
        </div>
      `;
    }

    main.querySelectorAll('#seg-ct button').forEach((b) => b.classList.toggle('on', b.dataset.f === filtroStatus));

    // Renderizar Cabeçalho da Tabela
    main.querySelector('#th-ct').innerHTML = abaAtiva === 'clientes' ? `
      <tr>
        <th>Contrato</th>
        <th>Cliente Contratante</th>
        <th>Modelo / Plano</th>
        <th class="r">Mensalidade / Receita</th>
        <th>Vigência</th>
        <th>Status</th>
        <th class="r">Ações</th>
      </tr>
    ` : `
      <tr>
        <th>Contrato</th>
        <th>Prestador / Colaborador</th>
        <th>Tipo de Contrato PJ</th>
        <th class="r">Remuneração / Custo</th>
        <th>Início / Vigência</th>
        <th>Status</th>
        <th class="r">Ações</th>
      </tr>
    `;

    // Filtrar lista atual
    let list = currentList.filter((ct) => {
      if (filtroStatus !== 'Todos' && ct.status !== filtroStatus) return false;
      if (!matchPeriodo(ct.dataInicio || ct.criadoEm, filtroPeriodo)) return false;
      if (filtroModelo !== 'todos' && ct.modeloId !== filtroModelo) return false;

      if (q) {
        const k = ct.contratante || {};
        const txt = `${ct.numero} ${k.nome || ''} ${k.nomeFantasia || ''} ${k.cidade || ''} ${k.documento || ''} ${ct.propostaNumero || ''} ${ct.opcao?.nome || ''}`.toLowerCase();
        if (!txt.includes(q)) return false;
      }
      return true;
    });

    // Ordenar
    list.sort((a, b) => {
      if (ordenacao === 'recente') return (b.dataInicio || b.criadoEm || '').localeCompare(a.dataInicio || a.criadoEm || '') || b.numero.localeCompare(a.numero);
      if (ordenacao === 'antiga') return (a.dataInicio || a.criadoEm || '').localeCompare(b.dataInicio || b.criadoEm || '') || a.numero.localeCompare(b.numero);
      if (ordenacao === 'maior_valor') {
        const ca = calcOpcao(a.opcao, a.params).final || calcOpcao(a.opcao, a.params).unicoTotal;
        const cb = calcOpcao(b.opcao, b.params).final || calcOpcao(b.opcao, b.params).unicoTotal;
        return cb - ca;
      }
      if (ordenacao === 'menor_valor') {
        const ca = calcOpcao(a.opcao, a.params).final || calcOpcao(a.opcao, a.params).unicoTotal;
        const cb = calcOpcao(b.opcao, b.params).final || calcOpcao(b.opcao, b.params).unicoTotal;
        return ca - cb;
      }
      return 0;
    });

    const temFiltroAtivo = filtroStatus !== 'Todos' || filtroPeriodo !== 'todas' || filtroModelo !== 'todos' || !!q;
    main.querySelector('#clear-wrap-ct').style.display = temFiltroAtivo ? 'block' : 'none';
    main.querySelector('#count-badge-ct').textContent = `${list.length} contrato${list.length === 1 ? '' : 's'} encontrado${list.length === 1 ? '' : 's'}`;

    main.querySelector('#tb-ct').innerHTML = list.length ? list.map((ct) => {
      const c = calcOpcao(ct.opcao, ct.params);
      const k = ct.contratante || {};

      if (abaAtiva === 'clientes') {
        let modeloBadge = ct.opcao.nome;
        if (ct.modeloId === 'contrato_trafego') modeloBadge = `<span class="doc-badge-pill info">Tráfego Puro</span> ${modeloBadge}`;
        else if (ct.modeloId === 'contrato_growth_v4') modeloBadge = `<span class="doc-badge-pill ok">Growth</span> ${modeloBadge}`;
        else if (ct.modeloId === 'contrato_audiovisual') modeloBadge = `<span class="doc-badge-pill warn">Audiovisual</span> ${modeloBadge}`;
        else if (ct.modeloId === 'contrato_design_full') modeloBadge = `<span class="doc-badge-pill info">Design Full</span> ${modeloBadge}`;

        return `<tr>
          <td>
            <a class="cell-main mono" style="text-decoration:none" href="#/contrato/${ct.id}">${esc(ct.numero)}</a>
            <div class="cell-sub">${ct.propostaNumero ? `de proposta ${esc(ct.propostaNumero)}` : 'emissão direta'}</div>
          </td>
          <td>
            <div class="cell-main">${esc(k.nomeFantasia || k.nome || '—')}</div>
            <div class="cell-sub">${esc([k.cidade, k.uf].filter(Boolean).join('/') || '—')}</div>
          </td>
          <td class="small">${modeloBadge}</td>
          <td class="r mono">
            <b style="font-size:14px">${c.temMensal ? `${brlShort(ct.mensalidadeVigente || c.final)}<span class="small muted">/mês</span>` : brlShort(c.unicoTotal)}</b>
          </td>
          <td class="small">
            ${fmtDate(ct.dataInicio)}${c.temMensal && ct.params.prazoMeses ? ` → ${fmtDate(addMonths(ct.dataInicio, ct.params.prazoMeses))}` : ''}
          </td>
          <td>
            ${statusChip(ct.status)}
            ${ct.status === 'Assinado' && c.kickoff && !ct.kickoffPago ? ' <span class="chip s-expirada">kickoff pendente</span>' : ''}
          </td>
          <td class="acts">
            ${k.whatsapp ? `<button class="btn btn-sm" style="color:#0E9A52" data-wa="${ct.id}" title="Enviar mensagem com contrato no WhatsApp">${ICON.whatsapp} WhatsApp</button>` : ''}
            <a class="btn btn-sm btn-dark" href="#/contrato/${ct.id}">${ICON.pen} Abrir</a>
            <button class="btn btn-sm btn-danger" data-del="${ct.id}" title="Excluir contrato">${ICON.trash} Excluir</button>
          </td>
        </tr>`;
      } else {
        // Prestador
        const tipoLabel = ct.modeloId === 'sublocacao_ia'
          ? `<span class="doc-badge-pill warn">Coworking & IA</span> Cessão de Espaço`
          : `<span class="doc-badge-pill ok">MEI Autônomo</span> Prestador com SLAs`;

        return `<tr>
          <td>
            <a class="cell-main mono" style="text-decoration:none" href="#/contrato/${ct.id}">${esc(ct.numero)}</a>
            <div class="cell-sub">contrato interno PJ</div>
          </td>
          <td>
            <div class="cell-main">${esc(k.nome || k.nomeFantasia || '—')}</div>
            <div class="cell-sub">${esc(k.documento || 'MEI')} · ${esc(ct.opcao.descricao || 'Prestador')}</div>
          </td>
          <td class="small">${tipoLabel}</td>
          <td class="r mono">
            <b style="font-size:14px;color:#D84315">${c.temMensal ? `${brlShort(ct.mensalidadeVigente || c.final)}<span class="small muted">/mês</span>` : 'Sem custo fixo'}</b>
          </td>
          <td class="small">
            A partir de ${fmtDate(ct.dataInicio)}
          </td>
          <td>
            ${statusChip(ct.status)}
          </td>
          <td class="acts">
            ${k.whatsapp ? `<button class="btn btn-sm" style="color:#0E9A52" data-wa="${ct.id}" title="Enviar via WhatsApp">${ICON.whatsapp} WhatsApp</button>` : ''}
            <a class="btn btn-sm btn-dark" href="#/contrato/${ct.id}">${ICON.pen} Abrir</a>
            <button class="btn btn-sm btn-danger" data-del="${ct.id}" title="Excluir contrato">${ICON.trash} Excluir</button>
          </td>
        </tr>`;
      }
    }).join('') : `
      <tr>
        <td colspan="7">
          <div class="empty">
            <div class="big">${abaAtiva === 'clientes' ? '🏢' : '🤝'}</div>
            <h3>Nenhum contrato de ${abaAtiva === 'clientes' ? 'cliente' : 'prestador'} encontrado</h3>
            <p>${temFiltroAtivo ? 'Tente ajustar os filtros ou a busca.' : (abaAtiva === 'clientes' ? 'Aprove uma proposta ou clique em "+ Novo Contrato de Cliente" para emitir agora.' : 'Clique em "+ Novo Contrato de Prestador" para emitir contrato MEI ou Termo Coworking/IA.')}</p>
            ${temFiltroAtivo ? `<button class="btn btn-sm" style="margin-top:10px" id="btn-empty-clear-ct">Limpar todos os filtros</button>` : ''}
          </div>
        </td>
      </tr>
    `;

    main.querySelector('#btn-empty-clear-ct')?.addEventListener('click', limparFiltros);
  };

  const limparFiltros = () => {
    filtroStatus = 'Todos';
    filtroPeriodo = 'todas';
    filtroModelo = 'todos';
    ordenacao = 'recente';
    q = '';
    main.querySelector('#q-ct').value = '';
    main.querySelector('#filtro-periodo-ct').value = 'todas';
    main.querySelector('#filtro-modelo-ct').value = 'todos';
    main.querySelector('#ordenacao-ct').value = 'recente';
    draw();
  };

  // Alternância de Abas
  main.querySelector('#tab-clientes').addEventListener('click', () => {
    if (abaAtiva !== 'clientes') {
      abaAtiva = 'clientes';
      filtroModelo = 'todos';
      syncModelosOptions();
      draw();
    }
  });

  main.querySelector('#tab-prestadores').addEventListener('click', () => {
    if (abaAtiva !== 'prestadores') {
      abaAtiva = 'prestadores';
      filtroModelo = 'todos';
      syncModelosOptions();
      draw();
    }
  });

  // Eventos de filtro
  main.querySelector('#q-ct').addEventListener('input', (e) => { q = e.target.value.toLowerCase(); draw(); });
  main.querySelector('#filtro-periodo-ct').addEventListener('change', (e) => { filtroPeriodo = e.target.value; draw(); });
  main.querySelector('#filtro-modelo-ct').addEventListener('change', (e) => { filtroModelo = e.target.value; draw(); });
  main.querySelector('#ordenacao-ct').addEventListener('change', (e) => { ordenacao = e.target.value; draw(); });
  main.querySelector('#btn-clear-ct')?.addEventListener('click', limparFiltros);
  main.querySelector('#seg-ct').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (b) { filtroStatus = b.dataset.f; draw(); }
  });

  // Novo Contrato Wizard
  main.querySelector('#btn-wiz-ct').addEventListener('click', () => {
    if (abaAtiva === 'clientes') {
      abrirAssistenteContratoCliente(draw);
    } else {
      abrirAssistenteContratoPrestador(draw);
    }
  });

  // Cliques na tabela
  main.addEventListener('click', async (e) => {
    const t = e.target.closest('button');
    if (!t) return;
    if (t.dataset.del) {
      if (!(await confirmDialog('Excluir este contrato permanentemente?', { ok: 'Excluir', danger: true }))) return;
      const ct = store.find('contratos', t.dataset.del);
      const p = ct && store.find('propostas', ct.propostaId);
      if (p) { p.contratoId = ''; store.upsert('propostas', p); }
      store.remove('contratos', t.dataset.del);
      toast('Contrato excluído.');
      draw();
    }
    if (t.dataset.wa) {
      const ct = store.find('contratos', t.dataset.wa);
      if (ct) {
        const chave = ct.status === 'Assinado' ? 'kickoff' : 'enviar';
        const m = mensagemContrato(ct, chave);
        if (!m.tel) return toast('Contratante/prestador sem telefone WhatsApp cadastrado.', 'warn');
        window.open(waLink(m.tel, m.texto), '_blank');
      }
    }
  });

  syncModelosOptions();
  draw();
}

// -------------------------------------------------------------
// Assistente Rápido: Emissão de Contrato de CLIENTE
// -------------------------------------------------------------
function abrirAssistenteContratoCliente(onDone) {
  const st = store.state;
  const propostasProntas = st.propostas.filter((p) => p.status === 'Aprovada' && !p.contratoId);

  const modalBody = `
    <div class="wiz-container">
      <p class="muted" style="margin-top:0">Selecione como deseja emitir o contrato do cliente:</p>

      <div class="wiz-pkg-grid" style="grid-template-columns:repeat(2, 1fr)">
        <!-- 1. Proposta Aprovada -->
        <div class="wiz-pkg-card ${propostasProntas.length ? 'selected' : ''}" data-origem="proposta">
          <span class="pkg-badge">${propostasProntas.length ? `${propostasProntas.length} pronta(s)` : 'Nenhuma pendente'}</span>
          <div class="pkg-ico">📄</div>
          <div class="pkg-title">A partir de Proposta Aprovada</div>
          <div class="pkg-desc">Puxa automaticamente dados da empresa, escopo comercial aprovado, ancoragem, mensalidade e prazos.</div>
          <div class="pkg-price">100% Automático</div>
        </div>

        <!-- 2. Só Tráfego Pago Direto -->
        <div class="wiz-pkg-card ${!propostasProntas.length ? 'selected' : ''}" data-origem="so_trafego">
          <span class="pkg-badge">Performance</span>
          <div class="pkg-ico">🎯</div>
          <div class="pkg-title">Só Tráfego Pago (1 Perna)</div>
          <div class="pkg-desc">Gestão de tráfego Meta Ads (Instagram/Facebook) por R$ 1.390/mês (sem necessidade de vídeo).</div>
          <div class="pkg-price">R$ 1.390/mês</div>
        </div>

        <!-- 3. Assessoria Growth -->
        <div class="wiz-pkg-card" data-origem="growth_v4">
          <span class="pkg-badge">Nacional / Remoto</span>
          <div class="pkg-ico">🚀</div>
          <div class="pkg-title">Assessoria Growth</div>
          <div class="pkg-desc">Tráfego multicanal (Meta + Google Ads), funis de vendas e estratégia comercial remota para qualquer cidade.</div>
          <div class="pkg-price">R$ 2.490 a R$ 2.590/mês</div>
        </div>

        <!-- 4. Marketing Completo Local -->
        <div class="wiz-pkg-card" data-origem="lake">
          <span class="pkg-badge">Três Lagoas</span>
          <div class="pkg-ico">👑</div>
          <div class="pkg-title">Marketing Completo Local (Lake)</div>
          <div class="pkg-desc">Captação presencial de vídeo e fotos em Três Lagoas, edição de Reels, artes, tráfego pago e gestão.</div>
          <div class="pkg-price">R$ 2.090 a R$ 2.990/mês</div>
        </div>

        <!-- 5. Audiovisual & Captação Presencial -->
        <div class="wiz-pkg-card" data-origem="audiovisual">
          <span class="pkg-badge">Audiovisual Local</span>
          <div class="pkg-ico">🎬</div>
          <div class="pkg-title">Captação & Audiovisual</div>
          <div class="pkg-desc">1 sessão de gravação presencial com equipe e estúdio + edição de vídeos Reels com roteiro.</div>
          <div class="pkg-price">R$ 1.190/mês</div>
        </div>

        <!-- 6. Design Full Sem Limite -->
        <div class="wiz-pkg-card" data-origem="full_design">
          <span class="pkg-badge">Design Ilimitado</span>
          <div class="pkg-ico">🎨</div>
          <div class="pkg-title">Design Full Sem Limite</div>
          <div class="pkg-desc">Criação contínua de peças visuais, banners, criativos e artes para o fluxo diário sem limites.</div>
          <div class="pkg-price">R$ 2.990/mês</div>
        </div>
      </div>

      <!-- Seção Dinâmica de Seleção -->
      <div id="wiz-origem-detalhe" style="margin-top:10px;background:#F8FBFB;border:1px solid var(--line);border-radius:12px;padding:16px"></div>
    </div>
  `;

  const m = modal({
    title: 'Novo Contrato de Cliente',
    size: 'lg',
    body: modalBody,
    footer: `
      <button class="btn" data-close>Cancelar</button>
      <button class="btn btn-go" id="wiz-ct-finish" style="padding:10px 20px;font-size:15px">
        ${ICON.sign} Emitir Contrato de Cliente
      </button>
    `,
  });

  const root = m.el;
  let tipoOrigem = propostasProntas.length ? 'proposta' : 'so_trafego';

  const renderDetalhes = () => {
    const det = root.querySelector('#wiz-origem-detalhe');
    if (tipoOrigem === 'proposta') {
      det.innerHTML = `
        <label class="lbl" style="display:block;margin-bottom:6px">Selecione a proposta aprovada:</label>
        ${propostasProntas.length ? `
          <select class="in" id="wiz-sel-prop">
            ${propostasProntas.map((p) => {
              const cli = st.clientes.find((c) => c.id === p.clienteId);
              return `<option value="${p.id}">${esc(p.numero)} — ${esc(cli?.nomeFantasia || cli?.nome || p.saudacao)} (${esc(p.titulo || '')})</option>`;
            }).join('')}
          </select>
        ` : `
          <p class="small muted" style="margin:0">Não há propostas aprovadas aguardando contrato. Você pode aprovar uma na lista de propostas ou emitir um contrato direto clicando nas opções ao lado.</p>
        `}
      `;
    } else {
      det.innerHTML = `
        <div class="fgrid">
          <div class="field c7">
            <label>Selecione o Cliente</label>
            <select class="in" id="wiz-sel-cli">
              ${st.clientes.map((c) => `<option value="${c.id}">${esc(c.nomeFantasia || c.nome)} (${c.cidade || ''}/${c.uf || ''})</option>`).join('')}
            </select>
          </div>
          <div class="field c5">
            <label>Prazo de Vigência</label>
            <select class="in" id="wiz-sel-prazo">
              <option value="12">12 meses (padrão)</option>
              <option value="6">6 meses</option>
              <option value="24">24 meses</option>
            </select>
          </div>
        </div>
      `;
    }
  };

  root.querySelectorAll('.wiz-pkg-card').forEach((card) => {
    card.addEventListener('click', () => {
      root.querySelectorAll('.wiz-pkg-card').forEach((c) => c.classList.remove('selected'));
      card.classList.add('selected');
      tipoOrigem = card.dataset.origem;
      renderDetalhes();
    });
  });

  renderDetalhes();

  root.querySelector('#wiz-ct-finish').addEventListener('click', () => {
    let ct = null;
    if (tipoOrigem === 'proposta') {
      const sel = root.querySelector('#wiz-sel-prop');
      if (!sel || !sel.value) return toast('Selecione uma proposta aprovada.', 'warn');
      const p = store.find('propostas', sel.value);
      const opId = p.opcaoAprovadaId || p.opcoes[0]?.id;
      ct = gerarContrato(p.id, opId);
    } else {
      const clienteId = root.querySelector('#wiz-sel-cli')?.value;
      const prazoMeses = Number(root.querySelector('#wiz-sel-prazo')?.value || 12);
      if (!clienteId) return toast('Selecione ou cadastre um cliente.', 'warn');

      let planoId = 'pl_lake';
      let modeloId = 'recorrente';
      if (tipoOrigem === 'so_trafego') {
        planoId = 'pl_so_trafego';
        modeloId = 'contrato_trafego';
      } else if (tipoOrigem === 'growth_v4') {
        planoId = 'pl_growth_v4';
        modeloId = 'contrato_growth_v4';
      } else if (tipoOrigem === 'lake') {
        planoId = 'pl_lake';
        modeloId = 'recorrente';
      } else if (tipoOrigem === 'audiovisual') {
        planoId = 'pl_audiovisual_local';
        modeloId = 'contrato_audiovisual';
      } else if (tipoOrigem === 'full_design') {
        planoId = 'pl_full_design';
        modeloId = 'contrato_design_full';
      }

      ct = criarContratoDireto({ clienteId, modeloId, planoId, prazoMeses });
    }

    if (ct) {
      m.close();
      toast('Contrato de cliente emitido com sucesso! ✨');
      onDone && onDone();
      location.hash = `#/contrato/${ct.id}`;
    }
  });
}

// -------------------------------------------------------------
// Assistente Rápido: Emissão de Contrato de PRESTADOR & MEI
// -------------------------------------------------------------
function abrirAssistenteContratoPrestador(onDone) {
  const st = store.state;
  const colabs = st.colaboradores || [];

  const modalBody = `
    <div class="wiz-container">
      <p class="muted" style="margin-top:0">Emita contratos jurídicos seguros para a sua equipe, com proteção contra vínculo de emprego (CLT) e comodato de ferramentas:</p>

      <div class="wiz-pkg-grid" style="grid-template-columns:repeat(2, 1fr)">
        <!-- 1. Prestador PJ / MEI com SLAs -->
        <div class="wiz-pkg-card selected" data-tipo="colaborador_mei">
          <span class="pkg-badge">Blindagem CLT</span>
          <div class="pkg-ico">🤝</div>
          <div class="pkg-title">Prestador de Serviços (MEI com SLAs)</div>
          <div class="pkg-desc">Autonomia técnica e de horários, tabela de entregas e SLAs da Bíblia Operacional, cláusulas de não aliciamento e multas por atraso.</div>
          <div class="pkg-price">Contrato PJ B2B</div>
        </div>

        <!-- 2. Cessão Coworking & Comodato de IA -->
        <div class="wiz-pkg-card" data-tipo="sublocacao_ia">
          <span class="pkg-badge">Infraestrutura</span>
          <div class="pkg-ico">💻</div>
          <div class="pkg-title">Cessão Coworking & Comodato IA</div>
          <div class="pkg-desc">Termo de disponibilização de espaço físico, computadores, Claude AI, ChatGPT Plus e licenças de software sem criar vínculo empregatício.</div>
          <div class="pkg-price">Comodato Tecnológico</div>
        </div>
      </div>

      <div style="margin-top:14px;background:#F8FBFB;border:1px solid var(--line);border-radius:12px;padding:16px">
        <label class="lbl" style="display:block;margin-bottom:6px">Selecione o Colaborador / Prestador cadastrado:</label>
        ${colabs.length ? `
          <select class="in" id="wiz-sel-colab" style="font-size:15px;font-weight:700">
            ${colabs.map((c) => `
              <option value="${c.id}">
                ${esc(c.nome)} — ${esc(c.cargo || c.funcaoId || 'Prestador')} (${c.tipo}) · ${c.remuneracao ? `${brlShort(c.remuneracao)}/mês` : 'Sem remuneração fixa'}
              </option>
            `).join('')}
          </select>
        ` : `
          <p class="small" style="color:var(--amber);margin:0">
            Nenhum colaborador cadastrado ainda. <a href="#/colaboradores" style="color:var(--prim);font-weight:700">Cadastre o colaborador aqui primeiro</a> para emitir o contrato com todos os documentos.
          </p>
        `}
      </div>
    </div>
  `;

  const m = modal({
    title: 'Novo Contrato de Prestador / Equipe PJ',
    size: 'lg',
    body: modalBody,
    footer: `
      <button class="btn" data-close>Cancelar</button>
      <button class="btn btn-go" id="wiz-prest-finish" style="padding:10px 20px;font-size:15px" ${colabs.length ? '' : 'disabled'}>
        ${ICON.sign} Emitir Contrato do Prestador
      </button>
    `,
  });

  const root = m.el;
  let tipoPrestador = 'colaborador_mei';

  root.querySelectorAll('.wiz-pkg-card').forEach((card) => {
    card.addEventListener('click', () => {
      root.querySelectorAll('.wiz-pkg-card').forEach((c) => c.classList.remove('selected'));
      card.classList.add('selected');
      tipoPrestador = card.dataset.tipo;
    });
  });

  root.querySelector('#wiz-prest-finish').addEventListener('click', () => {
    const colabId = root.querySelector('#wiz-sel-colab')?.value;
    if (!colabId) return toast('Selecione um colaborador.', 'warn');

    const ct = gerarContratoColaborador(colabId, tipoPrestador);
    if (ct) {
      m.close();
      toast('Contrato de prestador emitido com sucesso! 🤝');
      onDone && onDone();
      location.hash = `#/contrato/${ct.id}`;
    }
  });
}
