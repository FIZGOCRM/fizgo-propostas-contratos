// Lista de propostas com filtros avançados, métricas e assistente de criação rápida.
import { store } from '../store.js';
import { ICON } from '../icons.js';
import { esc, fmtDate, addDays, diffDays, today, brlShort, waLink, toast, onlyDigits, fmtCep, slug } from '../util.js';
import { renderProposta } from '../render-proposta.js';
import { enviarPDFWhatsApp } from '../pdf.js';
import { statusChip, confirmDialog, modal } from '../ui.js';
import { novaProposta, novaPropostaAssistente, duplicarProposta, statusProposta, valorPrincipal, mensagemProposta } from '../flow.js';
import { abrirAprovacao } from './aprovar.js';
import { novoCliente } from './clientes.js';

const FILTROS_STATUS = ['Todas', 'Rascunho', 'Enviada', 'Aprovada', 'Contrato gerado', 'Expirada', 'Recusada'];

export function render(main) {
  let filtroStatus = 'Todas';
  let filtroPeriodo = 'todas';
  let filtroFaixa = 'todos';
  let ordenacao = 'recente';
  let q = '';

  main.innerHTML = `
    <div class="top">
      <div>
        <h1>Propostas Comerciais</h1>
        <p>Apresente soluções de alto padrão, acompanhe o status e converta em contratos em 1 clique.</p>
      </div>
      <div class="actions">
        <button class="btn btn-sm btn-ghost btn-danger" id="btn-clean-drafts" style="display:none" title="Excluir todos os rascunhos de teste não enviados">${ICON.trash} Limpar Rascunhos</button>
        <button class="btn btn-go" id="btn-wiz">${ICON.sparkle || '⚡'} Proposta Rápida (1 Minuto)</button>
        <button class="btn" id="btn-nova">${ICON.plus} Nova em branco</button>
      </div>
    </div>

    <!-- KPIs do Topo -->
    <div class="kpi-row" id="kpi-row"></div>

    <!-- Barra de Filtros Avançados -->
    <div class="filters-wrapper">
      <div class="filters-top-row">
        <div class="search" style="max-width:340px">
          ${ICON.search}
          <input class="in" id="q" placeholder="Buscar por cliente, número ou plano...">
        </div>

        <select class="filter-select" id="filtro-periodo" title="Filtrar por data/período">
          <option value="todas">📅 Todas as datas</option>
          <option value="mes">📅 Este mês</option>
          <option value="mes_passado">📅 Mês passado</option>
          <option value="30d">📅 Últimos 30 dias</option>
          <option value="90d">📅 Últimos 90 dias</option>
          <option value="ano">📅 Este ano (${today().slice(0, 4)})</option>
        </select>

        <select class="filter-select" id="filtro-faixa" title="Filtrar por faixa de valor">
          <option value="todos">💰 Qualquer valor</option>
          <option value="ate2500">💰 Até R$ 2.500/mês</option>
          <option value="2500_5000">💰 R$ 2.500 a R$ 5.000/mês</option>
          <option value="acima5000">💰 Acima de R$ 5.000/mês</option>
          <option value="pontual">💰 Projetos pontuais</option>
        </select>

        <select class="filter-select" id="ordenacao" title="Ordenar lista">
          <option value="recente">⚡ Mais recentes primeiro</option>
          <option value="antiga">⏳ Mais antigas primeiro</option>
          <option value="maior_valor">📈 Maior valor primeiro</option>
          <option value="menor_valor">📉 Menor valor primeiro</option>
          <option value="vencimento">⏰ Vencimento mais próximo</option>
        </select>

        <div id="clear-wrap" style="display:none">
          <button class="filter-clear-btn" id="btn-clear">${ICON.x} Limpar filtros</button>
        </div>

        <span class="filter-count-badge" id="count-badge"></span>
      </div>

      <!-- Segmento de Status -->
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
        <span class="lbl" style="font-size:12px;color:var(--muted)">Status:</span>
        <div class="seg" id="seg">
          ${FILTROS_STATUS.map((f) => `<button data-f="${f}">${f}</button>`).join('')}
        </div>
      </div>
    </div>

    <!-- Tabela de Propostas -->
    <div class="card" style="padding:6px 10px">
      <table class="table">
        <thead>
          <tr>
            <th>Proposta</th>
            <th>Cliente</th>
            <th>Plano / Escopo</th>
            <th class="r">Valor Comercial</th>
            <th>Validade</th>
            <th>Status</th>
            <th class="r">Ações</th>
          </tr>
        </thead>
        <tbody id="tb"></tbody>
      </table>
    </div>`;

  // Função para checar período
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
    const diff = diffDays(dStr, hj); // dias atrás
    if (periodo === '30d') return diff >= 0 && diff <= 30;
    if (periodo === '90d') return diff >= 0 && diff <= 90;
    if (periodo === 'ano') return dStr.slice(0, 4) === hj.slice(0, 4);
    return true;
  };

  const draw = () => {
    const st = store.state;
    const hj = today();
    const props = st.propostas || [];

    // Calcular KPIs
    const abertas = props.filter((p) => ['Rascunho', 'Enviada'].includes(statusProposta(p)));
    const valorNegociacao = abertas.reduce((a, p) => a + (valorPrincipal(p).mensal || valorPrincipal(p).unico), 0);
    const decididas = props.filter((p) => ['Aprovada', 'Recusada'].includes(p.status) || statusProposta(p) === 'Expirada');
    const aprovadas = props.filter((p) => p.status === 'Aprovada');
    const taxaConv = decididas.length ? Math.round((aprovadas.length / decididas.length) * 100) : 0;
    const vencendo = props.filter((p) => {
      const s = statusProposta(p);
      if (s === 'Expirada') return true;
      if (s === 'Enviada') {
        const d = diffDays(hj, addDays(p.data, p.validadeDias));
        return d <= 3;
      }
      return false;
    });

    // Renderizar KPIs
    main.querySelector('#kpi-row').innerHTML = `
      <div class="kpi-card kpi-dark">
        <span class="kpi-label">${ICON.file} Total de Propostas</span>
        <div class="kpi-val">${props.length}</div>
        <span class="kpi-sub">${abertas.length} em andamento</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">${ICON.trending} Em Negociação</span>
        <div class="kpi-val">${brlShort(valorNegociacao)}</div>
        <span class="kpi-sub">${abertas.length} propostas ativas</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">${ICON.target} Aprovadas / Sucesso</span>
        <div class="kpi-val">${aprovadas.length} <small style="font-size:14px;color:var(--muted)">(${taxaConv}%)</small></div>
        <span class="kpi-sub">de ${decididas.length} decididas</span>
      </div>
      <div class="kpi-card ${vencendo.length ? 'kpi-warn' : ''}">
        <span class="kpi-label">${ICON.clock} Atenção / Vencendo</span>
        <div class="kpi-val" style="${vencendo.length ? 'color:var(--amber)' : ''}">${vencendo.length}</div>
        <span class="kpi-sub">${vencendo.length ? 'expiradas ou a vencer em 3 dias' : 'todas no prazo'}</span>
      </div>
    `;

    // Atualizar status segmentado
    main.querySelectorAll('#seg button').forEach((b) => b.classList.toggle('on', b.dataset.f === filtroStatus));

    // Filtrar lista
    let list = props.filter((p) => {
      const s = statusProposta(p);
      const cli = st.clientes.find((c) => c.id === p.clienteId);
      const temCt = p.contratoId && st.contratos.find((c) => c.id === p.contratoId);

      // Filtro Status
      if (filtroStatus === 'Contrato gerado') {
        if (!temCt) return false;
      } else if (filtroStatus !== 'Todas' && s !== filtroStatus) {
        return false;
      }

      // Filtro Período
      if (!matchPeriodo(p.data, filtroPeriodo)) return false;

      // Filtro Faixa de Valor
      const v = valorPrincipal(p);
      const vm = v.mensal || 0;
      if (filtroFaixa === 'ate2500' && (vm > 2500 || vm === 0)) return false;
      if (filtroFaixa === '2500_5000' && (vm <= 2500 || vm > 5000)) return false;
      if (filtroFaixa === 'acima5000' && vm <= 5000) return false;
      if (filtroFaixa === 'pontual' && (vm > 0 || v.unico === 0)) return false;

      // Filtro Texto (busca)
      if (q) {
        const txt = `${p.numero} ${cli?.nome || ''} ${cli?.nomeFantasia || ''} ${p.saudacao || ''} ${v.nome || ''} ${p.titulo || ''}`.toLowerCase();
        if (!txt.includes(q)) return false;
      }

      return true;
    });

    // Ordenar lista
    list.sort((a, b) => {
      if (ordenacao === 'recente') return (b.data || '').localeCompare(a.data || '') || b.numero.localeCompare(a.numero);
      if (ordenacao === 'antiga') return (a.data || '').localeCompare(b.data || '') || a.numero.localeCompare(b.numero);
      if (ordenacao === 'maior_valor') {
        const va = valorPrincipal(a).mensal || valorPrincipal(a).unico;
        const vb = valorPrincipal(b).mensal || valorPrincipal(b).unico;
        return vb - va;
      }
      if (ordenacao === 'menor_valor') {
        const va = valorPrincipal(a).mensal || valorPrincipal(a).unico;
        const vb = valorPrincipal(b).mensal || valorPrincipal(b).unico;
        return va - vb;
      }
      if (ordenacao === 'vencimento') {
        const va = diffDays(hj, addDays(a.data, a.validadeDias));
        const vb = diffDays(hj, addDays(b.data, b.validadeDias));
        return va - vb;
      }
      return 0;
    });

    // Mostrar ou ocultar botão limpar
    const temFiltroAtivo = filtroStatus !== 'Todas' || filtroPeriodo !== 'todas' || filtroFaixa !== 'todos' || !!q;
    main.querySelector('#clear-wrap').style.display = temFiltroAtivo ? 'block' : 'none';
    main.querySelector('#count-badge').textContent = `${list.length} proposta${list.length === 1 ? '' : 's'} encontrada${list.length === 1 ? '' : 's'}`;

    // Mostrar ou ocultar botão de limpar rascunhos
    const cleanBtn = main.querySelector('#btn-clean-drafts');
    if (cleanBtn) {
      const rascunhos = props.filter((p) => p.status === 'Rascunho');
      cleanBtn.style.display = rascunhos.length ? 'inline-flex' : 'none';
      cleanBtn.innerHTML = `${ICON.trash} Limpar Rascunhos (${rascunhos.length})`;
    }

    // Renderizar tabela
    main.querySelector('#tb').innerHTML = list.length ? list.map((p) => {
      const cli = st.clientes.find((c) => c.id === p.clienteId);
      const s = statusProposta(p);
      const v = valorPrincipal(p);
      const venc = addDays(p.data, p.validadeDias);
      const d = diffDays(hj, venc);
      const temCt = p.contratoId && st.contratos.find((c) => c.id === p.contratoId);

      let validadeBadge = fmtDate(venc);
      if (s === 'Enviada' || s === 'Rascunho') {
        if (d < 0) validadeBadge = `<span class="doc-badge-pill err">expirada (${Math.abs(d)}d)</span>`;
        else if (d === 0) validadeBadge = `<span class="doc-badge-pill warn">vence hoje!</span>`;
        else if (d <= 2) validadeBadge = `<span class="doc-badge-pill warn">${d} dia${d > 1 ? 's' : ''}</span>`;
        else validadeBadge = `<span class="muted">${d} dias</span>`;
      }

      return `<tr>
        <td>
          <a class="cell-main mono" href="#/proposta/${p.id}" style="text-decoration:none">${esc(p.numero)}</a>
          <div class="cell-sub">${fmtDate(p.data)}</div>
        </td>
        <td>
          <div class="cell-main">${esc(cli?.nomeFantasia || cli?.nome || p.saudacao || 'Sem cliente')}</div>
          <div class="cell-sub">${cli?.cidade ? `${cli.cidade}/${cli.uf || ''} · ` : ''}${p.opcoes.length} opç${p.opcoes.length === 1 ? 'ão' : 'ões'}</div>
        </td>
        <td>
          <div class="small" style="font-weight:600;color:var(--teal)">${esc(v.nome || p.titulo || '—')}</div>
          <div class="cell-sub">${esc(p.titulo || '')}</div>
        </td>
        <td class="r">
          <b class="mono" style="font-size:14px">${v.mensal ? `${brlShort(v.mensal)}<span class="small muted">/mês</span>` : brlShort(v.unico)}</b>
        </td>
        <td class="small">${validadeBadge}</td>
        <td>${temCt ? '<span class="chip s-contrato">Contrato gerado</span>' : statusChip(s)}</td>
        <td class="acts">
          ${cli?.whatsapp ? `<button class="btn btn-sm" style="color:#0E9A52" data-wa="${p.id}" title="Enviar proposta pronta pelo WhatsApp">${ICON.whatsapp} WhatsApp</button>` : ''}
          <a class="btn btn-sm btn-dark" href="#/proposta/${p.id}">${ICON.pen} Abrir</a>
          ${s !== 'Recusada' ? `<button class="btn btn-sm ${temCt ? '' : 'btn-go'}" data-ap="${p.id}">${ICON.sign} ${temCt ? 'Contrato' : 'Aprovar'}</button>` : ''}
          <button class="btn btn-sm btn-icon" title="Duplicar proposta" data-dup="${p.id}">${ICON.copy}</button>
          <button class="btn btn-sm btn-danger" title="Excluir proposta ou rascunho" data-del="${p.id}">${ICON.trash} Excluir</button>
        </td>
      </tr>`;
    }).join('') : `
      <tr>
        <td colspan="7">
          <div class="empty">
            <div class="big">📄</div>
            <h3>Nenhuma proposta encontrada</h3>
            <p>${temFiltroAtivo ? 'Tente ajustar ou limpar os filtros para ver mais resultados.' : 'Crie a primeira proposta com nosso assistente em 1 minuto.'}</p>
            ${temFiltroAtivo ? `<button class="btn btn-sm" style="margin-top:10px" id="btn-empty-clear">Limpar todos os filtros</button>` : ''}
          </div>
        </td>
      </tr>
    `;

    main.querySelector('#btn-empty-clear')?.addEventListener('click', limparFiltros);
  };

  const limparFiltros = () => {
    filtroStatus = 'Todas';
    filtroPeriodo = 'todas';
    filtroFaixa = 'todos';
    ordenacao = 'recente';
    q = '';
    main.querySelector('#q').value = '';
    main.querySelector('#filtro-periodo').value = 'todas';
    main.querySelector('#filtro-faixa').value = 'todos';
    main.querySelector('#ordenacao').value = 'recente';
    draw();
  };

  // Event Listeners de Filtro
  main.querySelector('#q').addEventListener('input', (e) => { q = e.target.value.toLowerCase(); draw(); });
  main.querySelector('#filtro-periodo').addEventListener('change', (e) => { filtroPeriodo = e.target.value; draw(); });
  main.querySelector('#filtro-faixa').addEventListener('change', (e) => { filtroFaixa = e.target.value; draw(); });
  main.querySelector('#ordenacao').addEventListener('change', (e) => { ordenacao = e.target.value; draw(); });
  main.querySelector('#btn-clear')?.addEventListener('click', limparFiltros);
  main.querySelector('#seg').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (b) { filtroStatus = b.dataset.f; draw(); }
  });

  // Ações de criação
  main.querySelector('#btn-nova').addEventListener('click', () => {
    const p = novaProposta();
    location.hash = `#/proposta/${p.id}`;
  });

  main.querySelector('#btn-wiz').addEventListener('click', () => abrirAssistenteProposta(draw));

  main.querySelector('#btn-clean-drafts')?.addEventListener('click', async () => {
    const rascunhos = (store.state.propostas || []).filter((p) => p.status === 'Rascunho');
    if (!rascunhos.length) return toast('Nenhum rascunho encontrado.', 'warn');
    if (!(await confirmDialog(`Deseja excluir definitivamente todos os <b>${rascunhos.length} rascunhos</b> pendentes? Propostas enviadas ou com contrato serão mantidas intactas.`, { ok: `Excluir ${rascunhos.length} rascunhos`, danger: true }))) return;
    for (const r of rascunhos) {
      store.remove('propostas', r.id);
    }
    toast(`${rascunhos.length} rascunho(s) excluído(s) com sucesso.`);
    draw();
  });

  // Cliques na tabela
  main.addEventListener('click', async (e) => {
    const t = e.target.closest('button');
    if (!t) return;
    if (t.dataset.ap) abrirAprovacao(t.dataset.ap);
    if (t.dataset.dup) {
      const p = duplicarProposta(t.dataset.dup);
      toast('Proposta duplicada com sucesso!');
      location.hash = `#/proposta/${p.id}`;
    }
    if (t.dataset.del) {
      const p = store.find('propostas', t.dataset.del);
      const isR = p && p.status === 'Rascunho';
      const msg = isR 
        ? `Excluir definitivamente o rascunho <b>${p?.numero || ''}</b>? Esta ação não pode ser desfeita.` 
        : `Excluir a proposta <b>${p?.numero || ''}</b>? O contrato gerado a partir dela (se houver) continuará salvo.`;
      if (await confirmDialog(msg, { ok: isR ? 'Excluir Rascunho' : 'Excluir Proposta', danger: true })) {
        store.remove('propostas', t.dataset.del);
        toast(isR ? 'Rascunho excluído.' : 'Proposta excluída.');
        draw();
      }
    }
    if (t.dataset.wa) {
      const p = store.find('propostas', t.dataset.wa);
      if (p) {
        const m = mensagemProposta(p, 'envio');
        if (!m.tel) return toast('Cliente sem WhatsApp cadastrado.', 'warn');
        const cli = store.state.clientes.find((c) => c.id === p.clienteId);
        const nome = `[${slug(cli?.nomeFantasia || cli?.nome || p.saudacao || 'CLIENTE').toUpperCase()}] PROPOSTA ${p.numero}`;
        renderProposta(p, store.state).then((pages) => enviarPDFWhatsApp(pages, nome, { ...m, onEnviado: () => {
          if (p.status === 'Rascunho') { p.status = 'Enviada'; p.enviadaEm = new Date().toISOString(); store.upsert('propostas', p); draw(); }
        } }));
      }
    }
  });

  draw();
}

// -------------------------------------------------------------
// Assistente Rápido: Proposta em 1 Minuto (Intuitivo, sem atrito)
// -------------------------------------------------------------
function abrirAssistenteProposta(onDone) {
  const st = store.state;
  let clienteId = st.clientes[0]?.id || '';
  let pacoteId = 'lake';

  const PACOTES = [
    {
      id: 'lakeplus',
      ico: '⚡',
      badge: 'De R$ 4.120 por R$ 2.990',
      title: 'Marketing Alta Frequência (Lake Plus)',
      desc: '4 vídeos Reels (R$ 300 cada), 8 artes (R$ 60 cada), tráfego Meta Ads (R$ 1.390), captação presencial e benefícios Fizgo.',
      price: 'R$ 2.990/mês (economia de R$ 1.130)',
    },
    {
      id: 'lake',
      ico: '👑',
      badge: 'Três Lagoas Local',
      title: 'Marketing Completo Local (Lake)',
      desc: 'Captação presencial com equipe, 2 vídeos Reels, 6 artes, tráfego pago, copy e gestão de postagens.',
      price: 'R$ 2.090/mês (tabela R$ 2.590)',
    },
    {
      id: 'so_trafego',
      ico: '🎯',
      badge: 'Só Tráfego',
      title: 'Só Tráfego Pago (1 Perna - Meta Ads)',
      desc: 'Gestão cirúrgica de tráfego pago no Instagram e Facebook para geração diária de leads no WhatsApp.',
      price: 'R$ 1.390/mês (por perna)',
    },
    {
      id: 'growth_v4',
      ico: '🚀',
      badge: 'Nacional / Remoto',
      title: 'Assessoria de Vendas & Growth',
      desc: 'Tráfego multicanal (Meta + Google Ads), funis de vendas e esteira de criativos. Sem captação presencial.',
      price: 'R$ 2.490 a R$ 2.590/mês',
    },
    {
      id: 'audiovisual',
      ico: '🎬',
      badge: 'Audiovisual Três Lagoas',
      title: 'Captação & Audiovisual Local',
      desc: '1 captação presencial mensal com equipamentos + 2 vídeos Reels gravados e editados com roteiro.',
      price: 'R$ 1.190/mês',
    },
    {
      id: 'full_design',
      ico: '🎨',
      badge: 'Design Ilimitado',
      title: 'Design Full Sem Limite de Artes',
      desc: 'Criação visual contínua sem limite de peças durante todo o mês para o fluxo diário.',
      price: 'R$ 2.990/mês',
    },
    {
      id: 'comet',
      ico: '🖼️',
      badge: 'Só Artes',
      title: 'Presença Visual (Só Artes)',
      desc: '8 artes profissionais estratégicas por mês + copywriting + gestão e agendamento de postagens.',
      price: 'R$ 930/mês',
    },
    {
      id: 'avancado',
      ico: '🏆',
      badge: 'Full-Service + CRM',
      title: 'Full-Service + CRM Kommo (Plus)',
      desc: 'Captação própria + Tráfego multicanal + CRM Kommo WhatsApp + Treinamento comercial de vendas.',
      price: 'R$ 6.900/mês',
    },
    {
      id: 'landing',
      ico: '🌐',
      badge: 'Pontual',
      title: 'Landing Page & Funil',
      desc: 'Página de alta conversão responsiva + copywriting persuasivo + integração com WhatsApp.',
      price: 'R$ 2.500 pontual',
    },
  ];

  const modalBody = `
    <div class="wiz-container">
      <div>
        <div class="wiz-step-title">
          <span class="wiz-step-num">1</span>
          <span>Para qual cliente é esta proposta?</span>
        </div>
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
          <select class="in" id="wiz-cli-select" style="flex:1;min-width:240px;font-size:15px;font-weight:700">
            ${st.clientes.length ? st.clientes.map((c) => `
              <option value="${c.id}" ${c.id === clienteId ? 'selected' : ''}>
                ${esc(c.nomeFantasia || c.nome)} ${c.cidade ? `(${c.cidade}/${c.uf || ''})` : ''}
              </option>
            `).join('') : '<option value="">Nenhum cliente cadastrado ainda</option>'}
          </select>
          <button class="btn btn-dark" type="button" id="wiz-btn-cnpj" title="Cadastrar cliente rápido apenas com o CNPJ">
            ${ICON.plus} Cadastrar via CNPJ em 1 clique
          </button>
        </div>
        <div id="wiz-cnpj-box" style="display:none;margin-top:12px;background:#F8FBFB;border:1.5px dashed var(--line2);padding:14px;border-radius:12px">
          <div style="display:flex;gap:8px">
            <input class="in" id="wiz-cnpj-in" placeholder="Digite o CNPJ (apenas números)" maxlength="18">
            <button class="btn btn-go" type="button" id="wiz-cnpj-buscar">${ICON.search} Buscar Receita</button>
          </div>
          <span class="hint" style="margin-top:6px;display:block">Puxa automaticamente Razão Social, Nome Fantasia, Endereço e Representante via BrasilAPI.</span>
        </div>
      </div>

      <div>
        <div class="wiz-step-title">
          <span class="wiz-step-num">2</span>
          <span>Qual é o objetivo ou pacote desejado?</span>
        </div>
        <div class="wiz-pkg-grid" id="wiz-pkg-grid">
          ${PACOTES.map((p) => `
            <div class="wiz-pkg-card ${p.id === pacoteId ? 'selected' : ''}" data-pkg="${p.id}">
              ${p.badge ? `<span class="pkg-badge">${p.badge}</span>` : ''}
              <div class="pkg-ico">${p.ico}</div>
              <div class="pkg-title">${p.title}</div>
              <div class="pkg-desc">${p.desc}</div>
              <div class="pkg-price">${p.price}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  const m = modal({
    title: 'Assistente Rápido: Proposta em 1 Minuto',
    size: 'lg',
    body: modalBody,
    footer: `
      <button class="btn" data-close>Cancelar</button>
      <button class="btn btn-go" id="wiz-btn-finish" style="padding:10px 20px;font-size:15px">
        ${ICON.sparkle || '🚀'} Criar Proposta Pronta
      </button>
    `,
  });

  const root = m.el;

  // Seleção de cliente
  const cliSelect = root.querySelector('#wiz-cli-select');
  cliSelect.addEventListener('change', (e) => { clienteId = e.target.value; });

  // Seleção de pacote
  root.querySelectorAll('.wiz-pkg-card').forEach((card) => {
    card.addEventListener('click', () => {
      root.querySelectorAll('.wiz-pkg-card').forEach((c) => c.classList.remove('selected'));
      card.classList.add('selected');
      pacoteId = card.dataset.pkg;
    });
  });

  // Toggle caixa de CNPJ
  const cnpjBox = root.querySelector('#wiz-cnpj-box');
  root.querySelector('#wiz-btn-cnpj').addEventListener('click', () => {
    cnpjBox.style.display = cnpjBox.style.display === 'none' ? 'block' : 'none';
    if (cnpjBox.style.display === 'block') root.querySelector('#wiz-cnpj-in').focus();
  });

  // Busca rápida de CNPJ
  root.querySelector('#wiz-cnpj-buscar').addEventListener('click', async (e) => {
    const raw = root.querySelector('#wiz-cnpj-in').value;
    const cnpj = onlyDigits(raw);
    if (cnpj.length !== 14) return toast('Digite um CNPJ válido com 14 números.', 'err');
    const btn = e.currentTarget;
    btn.disabled = true;
    btn.textContent = 'Buscando...';
    try {
      const r = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`).then((x) => {
        if (!x.ok) throw new Error(x.status);
        return x.json();
      });
      const novo = novoCliente();
      novo.id = `cli_${Date.now()}`;
      novo.tipo = 'PJ';
      novo.documento = cnpj;
      novo.nome = r.razao_social || '';
      novo.nomeFantasia = r.nome_fantasia || r.razao_social || '';
      novo.logradouro = [r.descricao_tipo_de_logradouro, r.logradouro].filter(Boolean).join(' ');
      novo.numero = r.numero || '';
      novo.complemento = r.complemento || '';
      novo.bairro = r.bairro || '';
      novo.cidade = r.municipio || '';
      novo.uf = r.uf || '';
      novo.cep = fmtCep(r.cep);
      novo.email = (r.email || '').toLowerCase();
      const socio = (r.qsa || [])[0]?.nome_socio;
      if (socio) novo.representante = { nome: socio, cpf: '' };
      novo.criadoEm = new Date().toISOString();

      store.upsert('clientes', novo);
      toast(`Cliente ${novo.nomeFantasia || novo.nome} cadastrado com sucesso!`);

      // Atualiza o select e seleciona ele
      const opt = document.createElement('option');
      opt.value = novo.id;
      opt.textContent = `${novo.nomeFantasia || novo.nome} (${novo.cidade}/${novo.uf})`;
      opt.selected = true;
      cliSelect.prepend(opt);
      clienteId = novo.id;
      cnpjBox.style.display = 'none';
    } catch {
      toast('Não consegui consultar o CNPJ na Receita Federal.', 'err');
    }
    btn.disabled = false;
    btn.textContent = 'Buscar Receita';
  });

  // Concluir criação
  root.querySelector('#wiz-btn-finish').addEventListener('click', () => {
    clienteId = cliSelect.value;
    const p = novaPropostaAssistente({ clienteId, pacoteId });
    m.close();
    toast('Proposta gerada com sucesso! ✨');
    onDone && onDone();
    location.hash = `#/proposta/${p.id}`;
  });
}
