// Regras de negócio do fluxo: criar proposta, aplicar planos, aprovar → gerar contrato, avisos.
import { store } from './store.js';
import { uid, clone, today, addDays, addMonths, diffDays, fmtDate, brlShort, num, preencher, pct, inteiroExtenso, valorTxt } from './util.js';
import { calcOpcao } from './calc.js';
import { condicoes } from './render-contrato.js';
import { faltaFizgo } from './autentique.js';

export function itemDoCatalogo(ref, qtd) {
  const c = store.state.catalogo.itens.find((i) => i.id === ref);
  if (!c) return null;
  return { id: uid('it'), ref: c.id, nome: c.nome, bullet: c.bullet, unidade: c.unidade, preco: c.preco, cobranca: c.cobranca, semQtd: !!c.semQtd, verba: c.verba || 0, qtd: qtd ?? c.qtdPadrao ?? 1 };
}

export function novaOpcao(nome = 'Plano personalizado') {
  return { id: uid('op'), nome, descricao: '', recomendado: false, itens: [], extras: [], bonus: [], precoModo: 'auto', valorTabela: 0, desconto: { tipo: 'valor', valor: 0 }, inicial: { ativo: false, meses: 3, valor: 0 }, pontualidade: true, kickoff: true };
}

export function opcaoDoPlano(planoId) {
  const pl = store.state.catalogo.planos.find((p) => p.id === planoId);
  if (!pl) return novaOpcao();
  return {
    ...novaOpcao(pl.nome),
    descricao: pl.descricao || '',
    itens: pl.itens.map((i) => itemDoCatalogo(i.ref, i.qtd)).filter(Boolean),
    extras: clone(pl.extras || []),
    bonus: clone(pl.bonus || []),
    precoModo: pl.precoModo,
    valorTabela: pl.valorTabela,
    desconto: clone(pl.desconto || { tipo: 'valor', valor: 0 }),
    inicial: clone(pl.inicial || { ativo: false, meses: 3, valor: 0 }),
    ...(pl.pontualidade !== undefined ? { pontualidade: pl.pontualidade } : {}),
    ...(pl.kickoff !== undefined ? { kickoff: pl.kickoff } : {}),
  };
}

export function novaProposta(clienteId = '') {
  const s = store.state.settings;
  const cli = store.state.clientes.find((c) => c.id === clienteId);
  const p = {
    id: uid('prop'),
    numero: store.nextNumero('propostas', 'PROP'),
    clienteId,
    saudacao: cli ? (cli.contato || cli.nomeFantasia || cli.nome || '') : '',
    titulo: 'Plano de marketing digital',
    data: today(),
    validadeDias: s.regras.validadeDias,
    status: 'Rascunho',
    opcoes: [opcaoDoPlano('pl_lake')],
    mostrarProcesso: true,
    mostrarComparativo: true,
    introTexto: '',
    diagnostico: { ativo: false, resumo: '', desafios: '', objetivos: '' },
    projecao: { ativo: false, verba: 3000, cpl: 15, conversao: 10, ticket: 500, opcaoId: '' },
    secoes: [],
    avisosOff: [],
    observacoes: '',
    segmentoId: '',
    paginas: { quemSomos: true, metodo: true, resultados: true },
    casesIds: [], // vazio = escolha automática (cases do mesmo segmento primeiro)
    videoUrl: s.portfolio.videoPadrao || '',
    followups: [],
    criadoEm: new Date().toISOString(),
  };
  p.opcoes[0].recomendado = true;
  if (cli?.segmentoId) aplicarSegmento(p, cli.segmentoId);
  store.upsert('propostas', p);
  return p;
}

// Criação rápida e automática via assistente visual (1 minuto)
export function novaPropostaAssistente({ clienteId = '', pacoteId = 'lake', titulo = '', introTexto = '' } = {}) {
  const s = store.state.settings;
  const cli = store.state.clientes.find((c) => c.id === clienteId);
  const p = {
    id: uid('prop'),
    numero: store.nextNumero('propostas', 'PROP'),
    clienteId,
    saudacao: cli ? (cli.contato || cli.nomeFantasia || cli.nome || '') : '',
    titulo: titulo || 'Plano de Aceleração Comercial & Marketing',
    data: today(),
    validadeDias: s.regras.validadeDias,
    status: 'Rascunho',
    opcoes: [],
    mostrarProcesso: true,
    mostrarComparativo: true,
    introTexto: introTexto || '',
    diagnostico: { ativo: false, resumo: '', desafios: '', objetivos: '' },
    projecao: { ativo: false, verba: 3000, cpl: 15, conversao: 10, ticket: 500, opcaoId: '' },
    secoes: [],
    avisosOff: [],
    observacoes: '',
    segmentoId: '',
    paginas: { quemSomos: true, metodo: true, resultados: true },
    casesIds: [],
    videoUrl: s.portfolio.videoPadrao || '',
    followups: [],
    criadoEm: new Date().toISOString(),
  };

  if (pacoteId === 'so_trafego' || pacoteId === 'trafego') {
    p.titulo = 'Estratégia de Aquisição & Tráfego Pago';
    const op1 = opcaoDoPlano('pl_so_trafego'); op1.recomendado = true;
    p.opcoes = [op1];
  } else if (pacoteId === 'growth_v4' || pacoteId === 'river') {
    p.titulo = 'Assessoria Estratégica de Vendas & Growth';
    const op = opcaoDoPlano('pl_growth_v4'); op.recomendado = true;
    p.opcoes = [op];
  } else if (pacoteId === 'audiovisual') {
    p.titulo = 'Produção Audiovisual & Captação Presencial';
    const op = opcaoDoPlano('pl_audiovisual_local'); op.recomendado = true;
    p.opcoes = [op];
  } else if (pacoteId === 'full_design') {
    p.titulo = 'Design Gráfico Contínuo Sem Limite de Artes';
    const op = opcaoDoPlano('pl_full_design'); op.recomendado = true;
    p.opcoes = [op];
  } else if (pacoteId === 'lakeplus') {
    p.titulo = 'Marketing de Alta Frequência (Lake Plus)';
    const op = opcaoDoPlano('pl_lakeplus'); op.recomendado = true;
    p.opcoes = [op];
  } else if (pacoteId === 'comet') {
    p.titulo = 'Presença Visual Estratégica (Só Artes)';
    const op = opcaoDoPlano('pl_comet'); op.recomendado = true;
    p.opcoes = [op];
  } else if (pacoteId === 'avancado') {
    p.titulo = 'Marketing, CRM & Vendas (Full-Service + Kommo)';
    const op = opcaoDoPlano('pl_avancado'); op.recomendado = true;
    p.opcoes = [op];
  } else if (pacoteId === 'landing') {
    p.titulo = 'Landing Page de Alta Conversão & WhatsApp';
    const op = novaOpcao('Landing Page de Alta Performance');
    op.itens = [
      itemDoCatalogo('landing', 1),
      itemDoCatalogo('copyads', 1),
    ].filter(Boolean);
    op.precoModo = 'fixo';
    op.valorTabela = 2500;
    op.recomendado = true;
    op.pontualidade = false;
    op.kickoff = false;
    p.opcoes = [op];
  } else if (pacoteId === 'ia') {
    p.titulo = 'Atendente Inteligente com IA & CRM no WhatsApp';
    const op = novaOpcao('Implantação IA + Kommo CRM');
    op.itens = [
      itemDoCatalogo('agenteia', 1),
      itemDoCatalogo('kommo', 1),
    ].filter(Boolean);
    op.precoModo = 'fixo';
    op.valorTabela = 4500;
    op.recomendado = true;
    p.opcoes = [op];
  } else if (pacoteId === 'branco') {
    p.titulo = 'Proposta Comercial Personalizada';
    const op = novaOpcao('Plano Estruturado');
    op.recomendado = true;
    p.opcoes = [op];
  } else {
    // lake padrão
    p.titulo = 'Plano de Marketing Completo (Lake)';
    const op = opcaoDoPlano('pl_lake'); op.recomendado = true;
    p.opcoes = [op];
  }

  if (cli?.segmentoId) {
    aplicarSegmento(p, cli.segmentoId, { plano: false });
  } else {
    p.diagnostico = {
      ativo: true,
      resumo: `Diagnóstico comercial elaborado com foco em atração qualificada e aumento da taxa de conversão da empresa ${cli?.nomeFantasia || cli?.nome || ''}.`,
      desafios: 'Crescimento dependente de indicações boca a boca\nFalta de previsibilidade na captação mensal de novos clientes\nPresença digital que ainda não converte contatos em vendas reais\nConcorrência cada vez mais ativa nos canais digitais',
      objetivos: 'Implementar máquina previsível de aquisição e novos clientes\nElevar o posicionamento de autoridade no mercado regional e digital\nAumentar a taxa de fechamento e retorno sobre o investimento (ROI)\nEstruturar métricas claras e relatórios transparentes de desempenho',
    };
    p.projecao = { ativo: true, verba: 2500, cpl: 15, conversao: 12, ticket: 450, opcaoId: '' };
  }

  store.upsert('propostas', p);
  return p;
}

// Preenche diagnóstico, projeção e plano sugerido a partir do modelo do segmento
export function aplicarSegmento(p, segmentoId, { plano = true } = {}) {
  const seg = store.state.catalogo.segmentos.find((x) => x.id === segmentoId);
  if (!seg) return;
  p.segmentoId = seg.id;
  p.diagnostico = { ativo: true, resumo: seg.resumo, desafios: seg.desafios, objetivos: seg.objetivos };
  p.projecao = { ...p.projecao, ativo: num(seg.verba) > 0, verba: seg.verba, cpl: seg.cpl, conversao: seg.conversao, ticket: seg.ticket, opcaoId: '' };
  if (plano && seg.planoId) {
    const op = opcaoDoPlano(seg.planoId);
    op.recomendado = true;
    p.opcoes = [op];
  }
}

// Cases que entram na proposta: os escolhidos, ou até 3 automáticos (mesmo segmento primeiro)
export function casesDaProposta(p) {
  const todos = (store.state.settings.portfolio.cases || []).filter((c) => c.ativo !== false);
  if (p.casesIds?.length) return p.casesIds.map((id) => todos.find((c) => c.id === id)).filter(Boolean);
  return [...todos].sort((a, b) => (b.segmentoId === p.segmentoId) - (a.segmentoId === p.segmentoId)).slice(0, 3);
}

// ---------- Mensagens de WhatsApp ----------
function varsBase() {
  const e = store.state.settings.empresa;
  return { empresa: e.nomeFantasia, slogan: e.slogan, pix: e.pix ? `${e.pix}${e.pixTitular ? ` (${e.pixTitular})` : ''}` : '[cadastre a chave Pix em Configurações]' };
}
export function mensagemProposta(p, chave) {
  const st = store.state;
  const cli = st.clientes.find((c) => c.id === p.clienteId);
  const v = valorPrincipal(p);
  const texto = preencher(st.settings.mensagens[chave], {
    ...varsBase(), nome: p.saudacao || cli?.contato || cli?.nomeFantasia || '', numero: p.numero,
    validade: fmtDate(addDays(p.data, p.validadeDias)), valor: brlShort(v.mensal || v.unico),
  });
  return { tel: cli?.whatsapp || '', texto };
}
export function mensagemContrato(ct, chave) {
  const st = store.state;
  const c = calcOpcao(ct.opcao, ct.params);
  const cli = st.clientes.find((x) => x.id === ct.clienteId);
  const k = ct.contratante;
  const texto = preencher(st.settings.mensagens[chave], {
    ...varsBase(), nome: cli?.contato || k.representante?.nome?.split(' ')[0] || k.nomeFantasia || k.nome, numero: ct.numero,
    kickoff: brlShort(c.kickoff), valor: brlShort(ct.mensalidadeVigente || c.final), data: fmtDate(addMonths(ct.dataInicio, ct.params.prazoMeses)),
    link: ct.autentique?.linkCliente || '',
  });
  return { tel: k.whatsapp || cli?.whatsapp || '', texto };
}

// Registra que o follow-up foi feito hoje (o aviso some por alguns dias)
export function registrarFollowup(p) {
  (p.followups ||= []).push(today());
  store.upsert('propostas', p);
}

export function duplicarProposta(id) {
  const src = store.find('propostas', id);
  if (!src) return null;
  const p = clone(src);
  Object.assign(p, { id: uid('prop'), numero: store.nextNumero('propostas', 'PROP'), status: 'Rascunho', data: today(), contratoId: '', opcaoAprovadaId: '', criadoEm: new Date().toISOString(), enviadaEm: '' });
  p.opcoes.forEach((o) => { o.id = uid('op'); });
  store.upsert('propostas', p);
  return p;
}

// Status efetivo: "Enviada" vira "Expirada" quando passa da validade
export function statusProposta(p) {
  if (p.status === 'Enviada' && diffDays(today(), addDays(p.data, p.validadeDias)) < 0) return 'Expirada';
  return p.status;
}

export function valorPrincipal(p) {
  const regras = store.state.settings.regras;
  const op = p.opcoes.find((o) => o.id === p.opcaoAprovadaId) || p.opcoes.find((o) => o.recomendado) || p.opcoes[0];
  if (!op) return { mensal: 0, unico: 0 };
  const c = calcOpcao(op, regras);
  return { mensal: c.temMensal ? c.final : 0, unico: c.unicoTotal, nome: op.nome };
}

// ---------- Proposta aprovada → contrato ----------
export function gerarContrato(propostaId, opcaoId, extras = {}) {
  const st = store.state;
  const p = store.find('propostas', propostaId);
  const op = p.opcoes.find((o) => o.id === opcaoId);
  const cli = store.find('clientes', p.clienteId) || {};
  const regras = clone(st.settings.regras);
  const temMensal = op.itens.some((i) => i.cobranca !== 'unico');
  let autoModelo = temMensal ? 'recorrente' : 'projeto';
  const opNome = (op.nome || '').toLowerCase();
  if (opNome.includes('tráfego') && !opNome.includes('completo') && !opNome.includes('lake')) {
    autoModelo = 'contrato_trafego';
  } else if (opNome.includes('growth') || opNome.includes('v4') || opNome.includes('assessoria')) {
    autoModelo = 'contrato_growth_v4';
  } else if (opNome.includes('audiovisual') || opNome.includes('captação')) {
    autoModelo = 'contrato_audiovisual';
  } else if (opNome.includes('design full') || opNome.includes('sem limite')) {
    autoModelo = 'contrato_design_full';
  }
  const modelo = st.modelos.find((m) => m.id === (extras.modeloId || autoModelo)) || st.modelos[0];
  const dataInicio = extras.dataInicio || today();

  const ct = {
    id: uid('ct'),
    numero: store.nextNumero('contratos', 'CT'),
    propostaId: p.id,
    propostaNumero: p.numero,
    clienteId: cli.id || '',
    modeloId: modelo.id,
    status: 'Rascunho',
    criadoEm: new Date().toISOString(),
    dataInicio,
    dataAssinatura: extras.dataAssinatura || today(),
    cidadeAssinatura: `${st.settings.empresa.cidade}, Estado de ${st.settings.empresa.estadoExtenso}`,
    contratante: {
      tipo: cli.tipo || 'PJ', nome: cli.nome || '', nomeFantasia: cli.nomeFantasia || '', documento: cli.documento || '',
      logradouro: cli.logradouro || '', numero: cli.numero || '', complemento: cli.complemento || '', bairro: cli.bairro || '',
      cidade: cli.cidade || '', uf: cli.uf || '', cep: cli.cep || '', email: cli.email || '', whatsapp: cli.whatsapp || '',
      representante: clone(cli.representante || { nome: '', cpf: '' }),
    },
    opcao: clone(op),
    params: { ...regras, prazoEntrega: '30 (trinta) dias úteis', foroCidade: st.settings.empresa.cidade, foroEstado: st.settings.empresa.estadoExtenso },
    tituloContrato: modelo.tituloContrato,
    tipoServico: modelo.tipoServico,
    preambulo: modelo.preambulo,
    fecho: modelo.fecho,
    clausulas: clone(modelo.clausulas),
    testemunhas: [{ nome: '', cpf: '' }, { nome: '', cpf: '' }],
    kickoffPago: false,
    arquivoAssinado: null,
  };
  aplicarCondicoes(ct);
  store.upsert('contratos', ct);

  p.status = 'Aprovada';
  p.opcaoAprovadaId = op.id;
  p.contratoId = ct.id;
  p.aprovadaEm = new Date().toISOString();
  store.upsert('propostas', p);
  return ct;
}

// Liga/desliga cláusulas condicionais conforme o plano (mensal, entrega única, pontualidade, kickoff)
export function aplicarCondicoes(ct) {
  const cond = condicoes(ct);
  ct.clausulas.forEach((cl) => { if (cl.cond) cl.ativo = !!cond[cl.cond]; });
}

export function trocarModelo(ct, modeloId) {
  const m = store.state.modelos.find((x) => x.id === modeloId);
  if (!m) return;
  Object.assign(ct, { modeloId, tituloContrato: m.tituloContrato, tipoServico: m.tipoServico, preambulo: m.preambulo, fecho: m.fecho, clausulas: clone(m.clausulas) });
  aplicarCondicoes(ct);
}

export function mensalidadeContrato(ct) {
  const c = calcOpcao(ct.opcao, ct.params);
  return c;
}

export function gerarContratoColaborador(colaboradorId, modeloId = 'colaborador_mei') {
  const st = store.state;
  const colab = store.find('colaboradores', colaboradorId);
  if (!colab) return null;
  const modelo = st.modelos.find((m) => m.id === modeloId) || st.modelos.find((m) => m.id === 'colaborador_mei') || st.modelos[0];
  const e = st.settings.empresa;
  const regras = clone(st.settings.regras);
  const dataInicio = colab.dataInicio || today();
  const isSublocacao = modeloId === 'sublocacao_ia';
  const prefixo = isSublocacao ? 'COW' : 'COLAB';

  const op = {
    id: uid('op'),
    nome: isSublocacao ? 'Cessão de Espaço & Comodato de IA' : (funcaoDoColaborador(colab)?.nome || colab.cargo || 'Prestação de serviços'),
    descricao: colab.especialidade || '',
    recomendado: true,
    itens: [
      {
        id: uid('it'),
        ref: 'custom',
        nome: isSublocacao ? 'Sublocação de Estação Coworking & Comodato Tecnológico IA' : (colab.cargo || 'Prestação de Serviços Especializados'),
        bullet: isSublocacao ? 'Disponibilização de infraestrutura civil, computadores, Claude AI, ChatGPT, Midjourney e nuvem' : (colab.especialidade || 'Autonomia técnica e operacional, sem subordinação e sem exclusividade'),
        unidade: 'Mês',
        preco: isSublocacao ? 0 : (num(colab.remuneracao) || 3500),
        cobranca: 'mensal',
        semQtd: true,
        verba: 0,
        qtd: 1,
      },
    ],
    extras: [],
    bonus: [],
    precoModo: 'tabela',
    valorTabela: isSublocacao ? 0 : (num(colab.remuneracao) || 3500),
    desconto: { tipo: 'valor', valor: 0 },
    pontualidade: false,
    kickoff: false,
  };

  const ct = {
    id: uid('ct'),
    numero: store.nextNumero('contratos', prefixo),
    propostaId: '',
    propostaNumero: '',
    clienteId: '',
    colaboradorId: colab.id,
    modeloId: modelo.id,
    status: 'Rascunho',
    criadoEm: new Date().toISOString(),
    dataInicio,
    dataAssinatura: today(),
    cidadeAssinatura: `${e.cidade}, Estado de ${e.estadoExtenso}`,
    contratante: {
      tipo: colab.tipo === 'PF' ? 'PF' : 'PJ',
      nome: colab.razaoSocial || colab.nome,
      nomeFantasia: colab.nome,
      documento: colab.cpfCnpj || '',
      logradouro: colab.logradouro || '',
      numero: colab.numero || '',
      complemento: colab.complemento || '',
      bairro: colab.bairro || '',
      cidade: colab.cidade || e.cidade,
      uf: colab.uf || e.uf,
      cep: colab.cep || '',
      email: colab.email || '',
      whatsapp: colab.telefone || '',
      representante: {
        nome: colab.nome,
        cpf: colab.cpfResponsavel || (colab.tipo === 'PF' ? colab.cpfCnpj : ''),
      },
    },
    opcao: op,
    params: {
      ...regras,
      prazoMeses: 12,
      diaVencimento: 10,
      descontoPontualidade: 0,
      kickoffPct: 0,
      prazoEntrega: 'Contínuo',
      foroCidade: e.cidade,
      foroEstado: e.estadoExtenso,
    },
    tituloContrato: modelo.tituloContrato,
    tipoServico: modelo.tipoServico,
    preambulo: modelo.preambulo,
    fecho: modelo.fecho,
    clausulas: clone(modelo.clausulas),
    testemunhas: [{ nome: '', cpf: '' }, { nome: '', cpf: '' }],
    kickoffPago: true,
    arquivoAssinado: null,
  };

  if (modelo.partes === 'prestador') prepararContratoPJ(ct, colab);
  aplicarCondicoes(ct);
  store.upsert('contratos', ct);
  return ct;
}

// Criação de contrato direto (sem necessidade de proposta prévia)
export function criarContratoDireto({ clienteId = '', colaboradorId = '', modeloId = 'recorrente', planoId = 'pl_lake', nomePlano = '', valorMensal = null, valorUnico = null, prazoMeses = 12 } = {}) {
  const st = store.state;
  if (colaboradorId) {
    return gerarContratoColaborador(colaboradorId, modeloId);
  }
  const cli = st.clientes.find((c) => c.id === clienteId) || {};
  const e = st.settings.empresa;
  const regras = clone(st.settings.regras);
  if (prazoMeses) regras.prazoMeses = prazoMeses;

  const modelo = st.modelos.find((m) => m.id === modeloId) || st.modelos[0];
  const isProjeto = modelo.id === 'projeto' || modelo.id === 'aditivo';

  let op;
  if (planoId && st.catalogo.planos.find((p) => p.id === planoId)) {
    op = opcaoDoPlano(planoId);
  } else {
    op = novaOpcao(nomePlano || (isProjeto ? 'Prestação de Serviços Pontual' : 'Gestão e Estratégia de Marketing'));
    if (isProjeto) {
      op.itens = [{
        id: uid('it'), ref: 'custom', nome: nomePlano || 'Projeto de Marketing e Desenvolvimento', bullet: 'Execução do escopo acordado e entregas contratuais',
        unidade: 'projeto', preco: valorUnico || 3500, cobranca: 'unico', semQtd: true, verba: 0, qtd: 1,
      }];
      op.precoModo = 'fixo';
      op.valorTabela = valorUnico || 3500;
      op.pontualidade = false;
      op.kickoff = false;
    } else {
      op.itens = [{
        id: uid('it'), ref: 'custom', nome: nomePlano || 'Gestão Estratégica de Marketing Digital e Tráfego', bullet: 'Gestão contínua de campanhas, produção de conteúdo e otimização de vendas',
        unidade: 'Mês', preco: valorMensal || 3200, cobranca: 'mensal', semQtd: true, verba: 0, qtd: 1,
      }];
      op.precoModo = 'fixo';
      op.valorTabela = valorMensal || 3200;
      op.pontualidade = true;
      op.kickoff = true;
    }
  }

  const ct = {
    id: uid('ct'),
    numero: store.nextNumero('contratos', 'CT'),
    propostaId: '',
    propostaNumero: '',
    clienteId: cli.id || '',
    colaboradorId: '',
    modeloId: modelo.id,
    status: 'Rascunho',
    criadoEm: new Date().toISOString(),
    dataInicio: today(),
    dataAssinatura: today(),
    cidadeAssinatura: `${e.cidade}, Estado de ${e.estadoExtenso}`,
    contratante: {
      tipo: cli.tipo || 'PJ', nome: cli.nome || '', nomeFantasia: cli.nomeFantasia || '', documento: cli.documento || '',
      logradouro: cli.logradouro || '', numero: cli.numero || '', complemento: cli.complemento || '', bairro: cli.bairro || '',
      cidade: cli.cidade || e.cidade, uf: cli.uf || e.uf, cep: cli.cep || '', email: cli.email || '', whatsapp: cli.whatsapp || '',
      representante: clone(cli.representante || { nome: '', cpf: '' }),
    },
    opcao: clone(op),
    params: { ...regras, prazoEntrega: '30 (trinta) dias úteis', foroCidade: e.cidade, foroEstado: e.estadoExtenso },
    tituloContrato: modelo.tituloContrato,
    tipoServico: modelo.tipoServico,
    preambulo: modelo.preambulo,
    fecho: modelo.fecho,
    clausulas: clone(modelo.clausulas),
    testemunhas: [{ nome: '', cpf: '' }, { nome: '', cpf: '' }],
    kickoffPago: false,
    arquivoAssinado: null,
  };
  aplicarCondicoes(ct);
  store.upsert('contratos', ct);
  return ct;
}

// Contrato do prestador PJ: a Fizgo é a CONTRATANTE. Preenche a função (atribuições e SLAs da
// Bíblia Operacional), a remuneração e as multas direto no texto, que fica editável no contrato.
export function funcaoDoColaborador(colab) {
  const fs = store.state.catalogo.funcoes || [];
  return fs.find((f) => f.id === colab.funcaoId) || null;
}
function prepararContratoPJ(ct, colab) {
  const R = store.state.settings.regrasPJ;
  const f = funcaoDoColaborador(colab);
  const rem = num(colab.remuneracao);
  const mensal = (colab.periodicidade || 'Mensal') === 'Mensal';
  const pc = (x) => `${pct(x)} (${inteiroExtenso(num(x))} por cento)`;
  const n = (x) => `${num(x)} (${inteiroExtenso(num(x))})`;
  const meses = (m) => `${valorTxt(rem * num(m))}, equivalente a ${n(m)} ${mensal ? 'remunerações mensais' : 'vezes o valor de referência'}`;
  const remTxt = {
    Mensal: `a remuneração mensal fixa de ${valorTxt(rem)}, que remunera integralmente o pacote de entregas do mês`,
    'Por Projeto': `o valor de ${valorTxt(rem)} por projeto entregue e aprovado`,
    'Por Hora': `o valor de ${valorTxt(rem)} por hora técnica efetivamente prestada, conforme relatório aprovado pela **CONTRATANTE**`,
  }[colab.periodicidade || 'Mensal'] || `a remuneração de ${valorTxt(rem)}`;
  const lista = (arr) => (arr || []).map((x) => `- ${x}`).join('\n');
  const vars = {
    funcao: f?.nome || colab.cargo || 'serviços especializados de marketing',
    atribuicoes: lista(f?.atribuicoes?.length ? f.atribuicoes : [colab.especialidade || 'Executar as demandas da sua especialidade registradas na ferramenta de gestão de tarefas.']),
    entregas: lista((f?.entregas || []).map(([e, p]) => `**${e}:** ${p}.`)) || '- Cada demanda: no prazo registrado na ferramenta de gestão de tarefas.',
    base: mensal ? 'da remuneração mensal' : 'do valor faturado no mês',
    remuneracao: remTxt,
    pix: colab.chavePix ? ` (chave Pix ${colab.chavePix})` : '',
    multaAtraso: pc(R.multaAtrasoPct), multaNaoEntrega: pc(R.multaNaoEntregaPct), multaErroGrave: pc(R.multaErroGravePct), tetoMultas: pc(R.tetoMultasPct),
    diasNaoEntrega: n(R.diasNaoEntrega), prazoDefesa: n(R.prazoDefesaHoras), prazoAjuste: n(R.prazoAjusteHoras), avisoPrevio: n(R.avisoPrevioDias),
    diaNF: n(R.diaNF), diaPagamento: n(R.diaPagamento), diaPagamentoAtraso: n(R.diaPagamentoAtraso), anosSigilo: n(R.anosSigilo),
    multaSigilo: meses(R.multaSigiloMeses), multaAliciamento: meses(R.multaAliciamentoMeses),
  };
  const fill = (t) => String(t || '').replace(/\[\[(\w+)\]\]/g, (m, k) => (vars[k] !== undefined ? vars[k] : m));
  ct.partes = 'prestador';
  ct.funcaoId = f?.id || '';
  ct.tipoServico = vars.funcao;
  ct.clausulas.forEach((c) => { c.texto = fill(c.texto); });
}

// ---------- Avisos do sistema ----------
export function alertas() {
  const st = store.state;
  const hoje = today();
  const out = [];
  st.propostas.forEach((p) => {
    const cli = st.clientes.find((c) => c.id === p.clienteId);
    const nome = cli?.nomeFantasia || cli?.nome || p.saudacao || p.numero;
    const venc = addDays(p.data, p.validadeDias);
    const d = diffDays(hoje, venc);
    const ultimoContato = [p.enviadaEm?.slice(0, 10) || p.data, ...(p.followups || [])].sort().pop();
    const semResposta = diffDays(ultimoContato, hoje);
    const prop = { tipo: 'proposta', id: p.id };
    if (p.status === 'Enviada' && d < 0) out.push({ tipo: 'amber', ico: 'clock', titulo: `Proposta de ${nome} expirou`, texto: `Venceu em ${fmtDate(venc)}. Faça um follow-up ou renove a validade.`, href: `#/proposta/${p.id}`, wa: { ...prop, msg: 'followup' }, ordem: 2 });
    else if (p.status === 'Enviada' && d <= 2) out.push({ tipo: 'red', ico: 'clock', titulo: `Proposta de ${nome} vence ${d === 0 ? 'hoje' : `em ${d} dia${d > 1 ? 's' : ''}`}`, texto: 'Lembre o cliente de garantir as condições.', href: `#/proposta/${p.id}`, wa: { ...prop, msg: 'vencendo' }, ordem: 1 });
    else if (p.status === 'Enviada' && semResposta >= num(st.settings.regras.followupDias || 2)) out.push({ tipo: 'blue', ico: 'whatsapp', titulo: `Follow-up: ${nome}`, texto: `Proposta enviada há ${semResposta} dias sem resposta.`, href: `#/proposta/${p.id}`, wa: { ...prop, msg: 'followup' }, ordem: 2 });
    if (p.status === 'Aprovada' && !p.contratoId) out.push({ tipo: 'green', ico: 'sign', titulo: `${nome} aprovou — falta o contrato`, texto: 'Gere o contrato com 1 clique a partir da proposta.', href: `#/proposta/${p.id}`, ordem: 1 });
    if (p.status === 'Rascunho' && diffDays(p.data, hoje) >= 3) out.push({ tipo: 'blue', ico: 'send', titulo: `Rascunho parado: ${nome}`, texto: `Criado em ${fmtDate(p.data)} e ainda não enviado.`, href: `#/proposta/${p.id}`, ordem: 4 });
  });
  st.contratos.forEach((ct) => {
    const nome = ct.contratante.nomeFantasia || ct.contratante.nome || ct.numero;
    const c = calcOpcao(ct.opcao, ct.params);
    if (ct.autentique?.recusado && ct.status !== 'Assinado') out.push({ tipo: 'red', ico: 'x', titulo: `${nome} recusou a assinatura`, texto: 'Veja o motivo no contrato e reenvie após ajustar.', href: `#/contrato/${ct.id}`, ordem: 0 });
    else if (ct.status === 'Enviado' && ct.autentique?.assinaturas?.some((s) => s.assinou) && faltaFizgo(ct)) out.push({ tipo: 'green', ico: 'sign', titulo: `${nome} assinou — falta a sua assinatura`, texto: `${ct.numero} · assine pelo e-mail do Autentique para concluir.`, href: `#/contrato/${ct.id}`, ordem: 0 });
    else if (['Rascunho', 'Enviado'].includes(ct.status) && diffDays(ct.criadoEm.slice(0, 10), hoje) >= 3) out.push({ tipo: 'amber', ico: 'sign', titulo: `Contrato de ${nome} sem assinatura`, texto: `${ct.numero} · gerado há ${diffDays(ct.criadoEm.slice(0, 10), hoje)} dias.`, href: `#/contrato/${ct.id}`, wa: ct.autentique?.linkCliente ? { tipo: 'contrato', id: ct.id, msg: 'assinatura' } : undefined, ordem: 2 });
    if (ct.autentique?.sandbox && ct.status === 'Enviado') out.push({ tipo: 'amber', ico: 'alert', titulo: `${ct.numero} foi enviado em modo teste`, texto: 'Assinatura de teste não tem validade jurídica. Desligue o modo teste em Configurações e reenvie.', href: `#/contrato/${ct.id}`, ordem: 1 });
    if (ct.status !== 'Assinado') return;
    if (c.kickoff && !ct.kickoffPago) out.push({ tipo: 'red', ico: 'wallet', titulo: `Kickoff pendente: ${nome}`, texto: `${brlShort(c.kickoff)} a receber via Pix.`, href: `#/contrato/${ct.id}`, wa: { tipo: 'contrato', id: ct.id, msg: 'kickoff' }, ordem: 1 });
    if (!c.temMensal) return;
    const fimFid = addMonths(ct.dataInicio, ct.params.mesesSemFidelidade);
    const dFid = diffDays(hoje, fimFid);
    if (dFid >= 0 && dFid <= 15) out.push({ tipo: 'blue', ico: 'target', titulo: `${nome}: fim do período sem fidelidade em ${dFid} dia${dFid === 1 ? '' : 's'}`, texto: 'Hora de apresentar resultados e reforçar o relacionamento.', href: `#/contrato/${ct.id}`, ordem: 3 });
    const fim = addMonths(ct.dataInicio, ct.params.prazoMeses);
    const dFim = diffDays(hoje, fim);
    if (dFim >= 0 && dFim <= num(ct.params.avisoPrevioDias) + 15) out.push({ tipo: 'amber', ico: 'refresh', titulo: `Renovação de ${nome} em ${dFim} dias`, texto: `Vigência termina em ${fmtDate(fim)}. Marque a conversa de resultados.`, href: `#/contrato/${ct.id}`, wa: { tipo: 'contrato', id: ct.id, msg: 'renovacao' }, ordem: 2 });
    // Reajuste anual: a cada 12 meses de contrato
    const anos = Math.ceil(Math.max(1, diffDays(ct.dataInicio, hoje)) / 365);
    const aniv = addMonths(ct.dataInicio, 12 * anos);
    const dAniv = diffDays(hoje, aniv);
    if (dAniv >= 0 && dAniv <= 30 && !(ct.reajustes || []).some((r) => r.data >= addDays(aniv, -45))) out.push({ tipo: 'amber', ico: 'trending', titulo: `Reajuste anual de ${nome} em ${dAniv} dia${dAniv === 1 ? '' : 's'}`, texto: `Mensalidade atual ${brlShort(ct.mensalidadeVigente || c.final)}. Aplique o IGP-M no contrato.`, href: `#/contrato/${ct.id}`, ordem: 2 });
  });
  (st.colaboradores || []).forEach((c) => {
    const docs = c.documentos || [];
    const isPj = c.tipo === 'MEI' || c.tipo === 'PJ';
    const total = isPj ? 3 : 2;
    const hasRes = docs.some((d) => d.tipoDoc === 'residencia');
    const hasIdt = docs.some((d) => d.tipoDoc === 'identidade');
    const hasCnp = docs.some((d) => d.tipoDoc === 'cnpj');
    const count = (hasRes ? 1 : 0) + (hasIdt ? 1 : 0) + (isPj && hasCnp ? 1 : 0);
    if (count < total && c.status !== 'Inativo') {
      out.push({
        tipo: 'amber',
        ico: 'file',
        titulo: `Dossiê incompleto: ${c.nome}`,
        texto: `Faltam ${total - count} documento(s) cadastrais para regularização jurídica.`,
        href: '#/colaboradores',
        ordem: 3,
      });
    }
  });
  return out.sort((a, b) => a.ordem - b.ordem);
}
