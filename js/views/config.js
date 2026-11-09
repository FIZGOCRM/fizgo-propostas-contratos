// Configurações: dados da agência, logos, regras comerciais, avisos, textos, modelos e backup.
import { store, freshState } from '../store.js';
import { ICON } from '../icons.js';
import { esc, uid, clone, toast, fileToDataURL, download, today } from '../util.js';
import { bind, field, inp, money, numIn, sw, confirmDialog } from '../ui.js';
import { textoAviso } from '../calc.js';
import { logoSVG, BRAND } from '../logo.js';
import { refreshChrome } from '../app.js';
import { carregarExemplos } from '../exemplos.js';
import { testarConexao, servidorDisponivel } from '../autentique.js';

const ABAS = [['empresa', 'Agência & logo'], ['regras', 'Regras comerciais'], ['avisos', 'Avisos'], ['textos', 'Textos da proposta'], ['mensagens', 'Mensagens WhatsApp'], ['autentique', 'Autentique'], ['modelos', 'Modelos de contrato'], ['dados', 'Backup']];

export function render(main, abaInicial) {
  let aba = ABAS.find((a) => a[0] === abaInicial) ? abaInicial : 'empresa';
  main.innerHTML = `
    <div class="top"><div><h1>Configurações</h1><p>Tudo aqui se reflete automaticamente em propostas e contratos novos.</p></div></div>
    <div class="toolbar"><div class="seg" id="seg">${ABAS.map(([k, l]) => `<button data-a="${k}">${l}</button>`).join('')}</div></div>
    <div id="out"></div>`;
  const out = main.querySelector('#out');
  const st = store.state;
  const save = () => store.save();

  const empresa = () => {
    const e = st.settings.empresa;
    const prev = (k, dark) => e[k] ? `<img src="${e[k]}">` : (dark ? logoSVG({ altura: 48 }) : logoSVG({ cor: BRAND.teal, altura: 48 }));
    out.innerHTML = `<div class="grid g2" style="align-items:start">
      <div class="card"><div class="card-h"><h3>Dados da agência (CONTRATADA)</h3></div><div class="fgrid">
        ${field('Nome fantasia', inp('nomeFantasia'), 'c6')}${field('Razão social', inp('razaoSocial'), 'c6')}
        ${field('CNPJ', inp('cnpj'), 'c6')}${field('Representante legal', inp('representante'), 'c6')}
        ${field('Endereço', inp('logradouro'), 'c8')}${field('Bairro', inp('bairro'), 'c4')}
        ${field('CEP', inp('cep'), 'c4')}${field('Cidade', inp('cidade'), 'c5')}${field('UF', inp('uf'), 'c3')}
        ${field('Estado por extenso (contratos)', inp('estadoExtenso'), 'c12')}
        ${field('WhatsApp', inp('whatsapp'), 'c6')}${field('E-mail', inp('email'), 'c6')}
        ${field('Instagram', inp('instagram'), 'c6')}${field('Site', inp('site'), 'c6')}
        ${field('Chave Pix (contrato e cobrança)', inp('pix'), 'c5')}${field('Tipo da chave', inp('pixTipo', 'placeholder="celular, CNPJ, e-mail…"'), 'c3')}${field('Titular da conta', inp('pixTitular'), 'c4')}
        ${field('Slogan (capa da proposta)', inp('slogan'), 'c12')}
      </div></div>
      <div class="card"><div class="card-h"><h3>Logo</h3></div>
        <p class="small muted" style="margin-top:0">O sistema já usa uma versão vetorial da marca Fizgo Digital. Se quiser usar o arquivo oficial, envie em PNG/SVG com fundo transparente.</p>
        <div class="field" style="margin-bottom:14px"><label>Versão para fundo escuro (capa)</label><div class="logo-up"><div class="lg-prev dark">${prev('logoParaFundoEscuro', true)}</div><div style="display:flex;flex-direction:column;gap:6px"><label class="btn btn-sm">${ICON.upload} Enviar<input type="file" accept="image/*" data-logo="logoParaFundoEscuro" hidden></label>${e.logoParaFundoEscuro ? '<button class="btn btn-sm btn-danger" data-rmlogo="logoParaFundoEscuro">Usar padrão</button>' : ''}</div></div></div>
        <div class="field"><label>Versão para fundo claro (páginas e contrato)</label><div class="logo-up"><div class="lg-prev">${prev('logoParaFundoClaro', false)}</div><div style="display:flex;flex-direction:column;gap:6px"><label class="btn btn-sm">${ICON.upload} Enviar<input type="file" accept="image/*" data-logo="logoParaFundoClaro" hidden></label>${e.logoParaFundoClaro ? '<button class="btn btn-sm btn-danger" data-rmlogo="logoParaFundoClaro">Usar padrão</button>' : ''}</div></div></div>
      </div></div>`;
    bind(out.querySelector('.card'), e, save);
    out.querySelectorAll('[data-logo]').forEach((i) => i.onchange = async () => {
      const f = i.files[0]; if (!f) return;
      if (f.size > 1.5 * 1024 * 1024) return toast('Use uma imagem de até 1,5 MB.', 'err');
      e[i.dataset.logo] = await fileToDataURL(f); save(); refreshChrome(); empresa(); toast('Logo atualizado!');
    });
    out.querySelectorAll('[data-rmlogo]').forEach((b) => b.onclick = () => { e[b.dataset.rmlogo] = null; save(); refreshChrome(); empresa(); });
  };

  const regras = () => {
    out.innerHTML = `<div class="grid g2" style="align-items:start">
      <div class="card"><div class="card-h"><h3>${ICON.wallet} Valores</h3></div><div class="fgrid">
        ${field('Taxa de kickoff', numIn('kickoffPct', '%'), 'c4')}${field('Se mensalidade abaixo de', money('kickoffLimite'), 'c4')}${field('Kickoff nesse caso', numIn('kickoffPctAbaixo', '%'), 'c4')}
        ${field('Kickoff calculado sobre', `<select class="in" data-bind="kickoffBase"><option value="pontualidade">Mensalidade com pontualidade (como no contrato)</option><option value="cheia">Mensalidade integral</option></select>`, 'c12')}
        ${field('Desconto por pontualidade', money('descontoPontualidade'), 'c6')}${field('Pontualidade até o dia', numIn('diaPontualidade'), 'c3')}${field('Vencimento dia', numIn('diaVencimento'), 'c3')}
        ${field('Entrada em material visual', numIn('entradaMaterialPct', '%'), 'c6')}${field('Rodadas de ajuste', numIn('rodadasAjuste'), 'c6')}
      </div></div>
      <div class="card"><div class="card-h"><h3>${ICON.clock} Prazos</h3></div><div class="fgrid">
        ${field('Validade da proposta', numIn('validadeDias', 'dias'), 'c6')}${field('Duração do contrato', numIn('prazoMeses', 'meses'), 'c6')}
        ${field('Meses sem fidelidade', numIn('mesesSemFidelidade', 'meses'), 'c6')}${field('Renovação automática', numIn('renovacaoMeses', 'meses'), 'c6')}
        ${field('Aviso prévio', numIn('avisoPrevioDias', 'dias'), 'c6')}${field('Multa rescisória', numIn('multaRescisoriaPct', '%'), 'c6')}
        ${field('Entrega para aprovação', numIn('antecedenciaEntregaDias', 'dias úteis'), 'c6')}${field('Prazo do cliente aprovar', numIn('aprovacaoHoras', 'horas'), 'c6')}
        ${field('Guarda de materiais após término', numIn('prazoMateriaisDias', 'dias'), 'c6')}${field('Confidencialidade', numIn('confidencialidadeAnos', 'anos'), 'c6')}
        ${field('Lembrar follow-up após', numIn('followupDias', 'dias sem resposta'), 'c6')}${field('Plataforma de assinatura', inp('plataformaAssinatura'), 'c6')}
      </div></div></div>
      <div class="note info" style="margin-top:14px">${ICON.sparkle}<span>Mudanças valem para propostas e contratos <b>gerados a partir de agora</b>. Contratos já existentes guardam as condições negociadas.</span></div>`;
    out.querySelectorAll('.card').forEach((c) => bind(c, st.settings.regras, save));
  };

  const avisos = () => {
    const draw = () => {
      out.innerHTML = `<div class="card"><div class="card-h"><div><h3>${ICON.alert} Avisos do rodapé das propostas</h3><p class="small muted" style="margin:4px 0 0">Use {kickoffPct}, {descontoPontualidade}, {prazoMeses}, {mesesSemFidelidade}, {avisoPrevioDias}, {entradaMaterialPct}… e eles acompanham as regras.</p></div><button class="btn btn-sm" data-act="add">${ICON.plus} Aviso</button></div>
        ${st.settings.avisos.map((a, i) => `<div class="box" style="margin-bottom:8px" data-i="${i}">
          <div style="display:flex;gap:8px;align-items:flex-start"><label class="switch"><input type="checkbox" data-f="ativo" ${a.ativo ? 'checked' : ''}><i></i></label><b class="mono" style="margin-top:2px">[${i + 1}]</b>
          <textarea class="in" rows="2" data-f="texto" style="flex:1">${esc(a.texto)}</textarea><button class="btn btn-ghost btn-icon btn-sm" data-rm>${ICON.trash}</button></div>
          <div class="small muted" style="margin:6px 0 0 86px">Fica assim: ${esc(textoAviso(a.texto, st.settings.regras))}</div></div>`).join('')}</div>`;
    };
    draw();
    out.oninput = (e) => { const b = e.target.closest('[data-i]'); if (!b || e.target.dataset.f !== 'texto') return; st.settings.avisos[b.dataset.i].texto = e.target.value; save(); };
    out.onchange = (e) => { const b = e.target.closest('[data-i]'); if (!b || e.target.dataset.f !== 'ativo') return; st.settings.avisos[b.dataset.i].ativo = e.target.checked; save(); };
    out.onclick = (e) => {
      const t = e.target.closest('button'); if (!t) return;
      if (t.dataset.act === 'add') st.settings.avisos.push({ id: uid('av'), ativo: true, texto: 'Novo aviso;' });
      if (t.dataset.rm != null) st.settings.avisos.splice(Number(t.closest('[data-i]').dataset.i), 1);
      save(); draw();
    };
  };

  const textos = () => {
    const pr = st.settings.proposta;
    const lista = (key, titulo) => `<div class="card"><div class="card-h"><h3>${titulo}</h3><button class="btn btn-sm" data-add="${key}">${ICON.plus}</button></div>
      ${pr[key].map((e, i) => `<div class="fgrid" style="margin-bottom:8px" data-k="${key}" data-i="${i}"><input class="in c4" data-f="titulo" value="${esc(e.titulo)}"><input class="in c7" data-f="texto" value="${esc(e.texto)}"><button class="btn btn-ghost btn-icon btn-sm c1" data-rm>${ICON.x}</button></div>`).join('')}</div>`;
    const cores = [['#C2FF00', 'Limão do site'], ['#00F07A', 'Verde da logo']];
    out.innerHTML = `<div class="card" id="visual" style="margin-bottom:16px"><div class="card-h"><div><h3>${ICON.sparkle} Visual da proposta</h3><p class="small muted" style="margin:4px 0 0">Escuro deixa a proposta igual ao site. Use *texto* nos títulos para o destaque em itálico.</p></div></div><div class="fgrid">
        ${field('Fundo', '<select class="in" data-bind="tema.modo"><option value="escuro">Escuro (igual ao site)</option><option value="claro">Claro (bom para imprimir)</option></select>', 'c4')}
        <div class="field c8"><label>Cor de destaque</label><div class="in-group"><input class="in" type="color" data-bind="tema.cor" style="max-width:56px;padding:4px">${cores.map(([c, l]) => `<button class="btn btn-sm" data-cor="${c}"><span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${c}"></span>${l}</button>`).join('')}</div></div>
        ${field('Frase da capa', inp('capaFrase'), 'c12', 'Ex.: Marketing que não *termina no conteúdo*. Estruturamos aquisição e vendas.')}
        ${field('Chamada da última página', inp('ctaTitulo'), 'c12', '{cliente} vira o nome do cliente. Ex.: Vamos *acelerar* {cliente}?')}
      </div></div>
      <div class="card"><div class="card-h"><h3>Abertura</h3></div><div class="fgrid">
        ${field('Título de abertura', '<textarea class="in" rows="2" data-bind="introTitulo"></textarea>', 'c6')}
        ${field('Título do processo', '<textarea class="in" rows="2" data-bind="processoTitulo"></textarea>', 'c6')}
        ${field('Texto padrão de introdução', '<textarea class="in" rows="3" data-bind="intro"></textarea>', 'c12')}
        ${field('Complemento da validade', inp('rodapeValidade'), 'c12')}
        ${field('Aviso da projeção de resultados', inp('disclaimerProjecao'), 'c12')}
      </div></div>
      ${lista('etapas', 'Processo após o fechamento')}
      ${lista('proximosPassos', 'Próximos passos (página final)')}`;
    bind(out.querySelector('#visual'), pr, save);
    bind(out.querySelector('#visual + .card'), pr, save);
    out.oninput = (e) => { const r = e.target.closest('[data-k]'); if (!r) return; pr[r.dataset.k][r.dataset.i][e.target.dataset.f] = e.target.value; save(); };
    out.onclick = (e) => {
      const t = e.target.closest('button'); if (!t) return;
      if (t.dataset.cor) pr.tema.cor = t.dataset.cor;
      else if (t.dataset.add) pr[t.dataset.add].push({ titulo: 'Nova etapa', texto: 'Descrição' });
      else if (t.dataset.rm != null) { const r = t.closest('[data-k]'); pr[r.dataset.k].splice(Number(r.dataset.i), 1); } else return;
      save(); textos();
    };
  };

  const mensagens = () => {
    const M = st.settings.mensagens;
    const lista = [['envio', 'Envio da proposta'], ['followup', 'Follow-up (sem resposta)'], ['vencendo', 'Proposta perto de vencer'], ['assinatura', 'Link de assinatura do contrato'], ['contrato', 'Contrato enviado (assinatura por e-mail)'], ['kickoff', 'Cobrança do kickoff'], ['renovacao', 'Renovação / conversa de resultados'], ['extras', 'Tabela de serviços extras']];
    out.innerHTML = `<div class="note info" style="margin-bottom:14px">${ICON.whatsapp}<span>Mensagens usadas nos botões de WhatsApp do painel, da proposta e do contrato. Variáveis: {nome}, {numero}, {validade}, {valor}, {kickoff}, {pix}, {data}, {link} (link de assinatura), {empresa}, {slogan}. Use *texto* para negrito no WhatsApp.</span></div>
      <div class="grid g2" style="align-items:start">${lista.map(([k, l]) => `<div class="card"><div class="card-h"><h3>${l}</h3></div><textarea class="in" rows="6" data-bind="${k}"></textarea></div>`).join('')}</div>`;
    bind(out, M, save);
  };

  const autentique = async () => {
    const A = st.settings.autentique;
    out.innerHTML = `<div class="grid g2" style="align-items:start">
      <div class="card"><div class="card-h"><h3>${ICON.sign} Conexão com o Autentique</h3></div>
        <div id="srv"></div>
        <ol class="small" style="margin:0 0 12px;padding-left:18px;color:var(--muted)"><li>Entre no Autentique e abra <a href="https://painel.autentique.com.br/perfil/api" target="_blank" rel="noopener">Perfil → API</a>.</li><li>Gere um token e cole aqui.</li><li>Clique em "Testar conexão".</li></ol>
        <div class="fgrid">
          <div class="field c12"><label>Token da API</label><div class="in-group"><input class="in" type="password" data-bind="token" placeholder="cole o token aqui" autocomplete="off"><button class="btn btn-dark" data-act="testar">Testar conexão</button></div><span class="hint" id="teste-res">O token fica salvo só neste computador e não vai no backup.</span></div>
          <div class="field c12">${sw('sandbox', 'Modo teste')}<span class="hint">Documentos de teste não valem juridicamente, não gastam créditos e somem em alguns dias. Desligue para enviar contratos de verdade.</span></div>
        </div></div>
      <div class="card"><div class="card-h"><h3>Envio</h3></div><div class="fgrid">
        ${field('Como o cliente recebe o contrato', '<select class="in" data-bind="envioCliente"><option value="link">Link de assinatura, que eu mando no WhatsApp</option><option value="email">E-mail do Autentique</option><option value="whatsapp">WhatsApp enviado pelo Autentique</option></select>', 'c12')}
        ${field('Lembrete automático para quem não assinou', '<select class="in" data-bind="lembrete"><option value="">Sem lembrete</option><option value="DAILY">Todo dia</option><option value="WEEKLY">Toda semana</option></select>', 'c12')}
        ${field('Mensagem no e-mail do Autentique', '<textarea class="in" rows="4" data-bind="mensagem"></textarea>', 'c12')}
      </div>
      <div class="note info">${ICON.sparkle}<span>Quem assina: o contratante (pelo link que você manda no WhatsApp, ou como escolher acima), a Fizgo (${esc(st.settings.empresa.email)}) e as testemunhas que tiverem e-mail. Quando todos assinam, o contrato vira "Assinado" sozinho e a via assinada é guardada.</span></div></div></div>`;
    bind(out, A, save);
    const srv = out.querySelector('#srv');
    if (!(await servidorDisponivel())) srv.innerHTML = `<div class="note" style="margin-bottom:12px">${ICON.alert}<span>Para conectar ao Autentique, abra o sistema pelo servidor da Fizgo: no Terminal, dentro da pasta, rode <b class="mono">python3 server.py</b> (em vez de "python3 -m http.server").</span></div>`;
    out.querySelector('[data-act="testar"]').onclick = async (e) => {
      const res = out.querySelector('#teste-res');
      const btn = e.currentTarget;
      if (!A.token) return toast('Cole o token primeiro.', 'warn');
      btn.disabled = true; res.textContent = 'Testando…';
      try { const me = await testarConexao(); res.innerHTML = `<span style="color:var(--green-d);font-weight:700">Conectado como ${esc(me?.name || '')} ${me?.email ? `(${esc(me.email)})` : ''}</span>`; toast('Autentique conectado!'); }
      catch (err) { res.innerHTML = `<span style="color:var(--red);font-weight:700">${esc(err.message)}</span>`; }
      btn.disabled = false;
    };
  };

  let modeloId = st.modelos[0].id;
  const modelos = () => {
    const m = st.modelos.find((x) => x.id === modeloId);
    out.innerHTML = `<div class="card"><div class="card-h"><div class="seg">${st.modelos.map((x) => `<button data-m="${x.id}" class="${x.id === modeloId ? 'on' : ''}">${esc(x.nome)}</button>`).join('')}</div>
        <button class="btn btn-sm btn-ghost" data-act="reset">${ICON.refresh} Restaurar padrão Fizgo</button></div>
      <div class="note info" style="margin-bottom:12px">${ICON.sparkle}<span>Edições aqui valem para os próximos contratos. Variáveis: {{mensalidadeTxt}}, {{mensalidadeCheiaTxt}}, {{kickoffValor}}, {{prazoMeses}}, {{dataInicio}}, {{foroCidade}}… e {{n}} / {{ref:pagamento}} para numeração.</span></div>
      <div class="fgrid" style="margin-bottom:14px">${field('Título do contrato', inp('tituloContrato'), 'c6')}${field('Tipo de serviço (cláusula objeto)', inp('tipoServico'), 'c6')}${field('Preâmbulo (partes)', '<textarea class="in" rows="5" data-bind="preambulo"></textarea>', 'c12')}</div>
      ${m.clausulas.map((cl, i) => `<details class="clause" data-i="${i}"><summary class="clause-h"><span class="num">${i + 1}</span><span class="t">${esc(cl.titulo)}${cl.cond ? ` <span class="chip" style="margin-left:6px">só se ${cl.cond}</span>` : ''}</span></summary>
        <div class="clause-b"><input class="in" data-f="titulo" value="${esc(cl.titulo)}" style="margin-bottom:6px"><textarea class="in" data-f="texto">${esc(cl.texto)}</textarea></div></details>`).join('')}
      <div id="fecho">${field('Fecho', '<textarea class="in" rows="3" data-bind="fecho"></textarea>', 'c12')}</div></div>`;
    bind(out.querySelector('.fgrid'), m, save);
    bind(out.querySelector('#fecho'), m, save);
    out.oninput = (e) => { const d = e.target.closest('details[data-i]'); if (!d) return; m.clausulas[d.dataset.i][e.target.dataset.f] = e.target.value; save(); };
    out.onclick = async (e) => {
      const t = e.target.closest('button'); if (!t) return;
      if (t.dataset.m) { modeloId = t.dataset.m; modelos(); }
      if (t.dataset.act === 'reset' && await confirmDialog('Restaurar este modelo para o texto padrão?', { ok: 'Restaurar' })) {
        const def = freshState().modelos.find((x) => x.id === modeloId);
        if (def) { st.modelos[st.modelos.findIndex((x) => x.id === modeloId)] = def; save(); modelos(); }
      }
    };
  };

  const dados = () => {
    out.innerHTML = `<div class="grid g2">
      <div class="card"><div class="card-h"><h3>${ICON.download} Backup</h3></div><p class="small muted">Os dados ficam salvos neste navegador. Faça backup de vez em quando — e use-o para levar tudo para outro computador.</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-dark" data-act="exp">${ICON.download} Exportar backup</button><label class="btn">${ICON.upload} Importar backup<input type="file" accept="application/json" id="imp" hidden></label></div></div>
      <div class="card"><div class="card-h"><h3>${ICON.sparkle} Exemplos</h3></div><p class="small muted">Cria clientes e propostas de exemplo (baseados nas propostas da Dr. e Dra. Viola, Cristalle e Nordeste Gás) para você ver o sistema funcionando.</p>
        <button class="btn" data-act="ex">${ICON.plus} Carregar exemplos</button></div>
      <div class="card"><div class="card-h"><h3 style="color:var(--red)">Zona de perigo</h3></div><p class="small muted">Apaga clientes, propostas e contratos (mantém configurações e catálogo).</p>
        <button class="btn btn-danger" data-act="wipe">${ICON.trash} Apagar dados comerciais</button></div></div>`;
    out.onclick = async (e) => {
      const t = e.target.closest('[data-act]'); if (!t) return;
      if (t.dataset.act === 'exp') { const b = clone(st); b.settings.autentique.token = ''; download(`fizgo-backup-${today()}.json`, JSON.stringify(b, null, 1)); }
      if (t.dataset.act === 'ex') { const n = carregarExemplos(); toast(`${n} propostas de exemplo criadas!`); location.hash = '#/propostas'; }
      if (t.dataset.act === 'wipe' && await confirmDialog('Apagar todos os clientes, propostas e contratos? Faça um backup antes.', { ok: 'Apagar tudo', danger: true })) {
        st.clientes = []; st.propostas = []; st.contratos = []; await store.saveNow(); toast('Dados comerciais apagados.', 'warn'); refreshChrome();
      }
    };
    out.querySelector('#imp').onchange = async (e) => {
      const f = e.target.files[0]; if (!f) return;
      try {
        const data = JSON.parse(await f.text());
        if (!data.settings || !Array.isArray(data.propostas)) throw new Error('formato');
        if (!(await confirmDialog('Importar este backup vai substituir todos os dados atuais. Continuar?', { ok: 'Importar', danger: true }))) return;
        const token = st.settings.autentique?.token; await store.replace(data); if (token && !store.state.settings.autentique.token) { store.state.settings.autentique.token = token; store.save(); } refreshChrome(); toast('Backup importado!');
      } catch { toast('Arquivo de backup inválido.', 'err'); }
    };
  };

  const FN = { empresa, regras, avisos, textos, mensagens, autentique, modelos, dados };
  const show = (k) => { aba = k; out.oninput = out.onchange = out.onclick = null; main.querySelectorAll('#seg button').forEach((b) => b.classList.toggle('on', b.dataset.a === k)); FN[k](); };
  main.querySelector('#seg').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) show(b.dataset.a); });
  show(aba);
}
