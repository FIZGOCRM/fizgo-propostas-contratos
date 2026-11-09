// Dados iniciais da Fizgo Digital: empresa, regras comerciais, avisos, catálogo,
// planos e modelos de contrato. Tudo pode ser editado em Configurações / Catálogo.

export const DEFAULT_SETTINGS = {
  empresa: {
    nomeFantasia: 'Fizgo Digital',
    razaoSocial: 'FIZGO DIGITAL',
    cnpj: '38.973.600/0001-09',
    logradouro: 'Rua Alfredo Justino, 337',
    bairro: 'Lapa',
    cep: '79.600-100',
    cidade: 'Três Lagoas',
    uf: 'MS',
    estadoExtenso: 'Mato Grosso do Sul',
    representante: 'Marcio Seigi Hirade Junior',
    email: 'contato@fizgodigital.com.br',
    whatsapp: '(67) 99202-1536',
    instagram: '@fizgodigital',
    site: 'www.fizgodigital.com.br',
    pix: '(67) 98189-6548',
    pixTipo: 'celular',
    pixTitular: 'Marcio Seigi Hirade Junior',
    slogan: "Fizgo Let's go!",
    logoParaFundoEscuro: null,
    logoParaFundoClaro: null,
  },
  regras: {
    kickoffPct: 60,
    kickoffLimite: 1000,
    kickoffPctAbaixo: 100,
    kickoffBase: 'pontualidade', // 'pontualidade' = sobre a mensalidade com desconto | 'cheia'
    descontoPontualidade: 100,
    diaPontualidade: 5,
    diaVencimento: 8,
    followupDias: 2,
    plataformaAssinatura: 'Autentique (www.autentique.com.br)',
    validadeDias: 7,
    prazoMeses: 12,
    mesesSemFidelidade: 3,
    renovacaoMeses: 6,
    avisoPrevioDias: 30,
    multaRescisoriaPct: 50,
    prazoMateriaisDias: 30,
    confidencialidadeAnos: 5,
    aprovacaoHoras: 24,
    antecedenciaEntregaDias: 2,
    entradaMaterialPct: 50,
    rodadasAjuste: 2,
  },
  proposta: {
    // Visual da proposta: 'escuro' (igual ao site) ou 'claro'; cor de destaque
    tema: { modo: 'escuro', cor: '#C2FF00' },
    capaFrase: 'Marketing que não *termina no conteúdo*. Estruturamos aquisição e vendas.',
    ctaTitulo: 'Vamos *acelerar* {cliente}?',
    introTitulo: 'Preparamos uma proposta\nfeita para o seu momento',
    intro: 'Aqui está a nossa recomendação para **fazer a sua empresa vender mais**: o que está incluso, os valores e as condições. Depois da aprovação, fazemos uma reunião de onboarding para aprofundar os seus indicadores e ajustar a estratégia ao seu negócio.',
    processoTitulo: 'Como funciona\ndepois que você aprova',
    etapas: [
      { titulo: 'Aprovação e contrato', texto: 'Você escolhe o plano e assina o contrato pelo celular.' },
      { titulo: 'Grupo no WhatsApp', texto: 'Criamos o grupo com a equipe que vai cuidar da sua marca.' },
      { titulo: 'Reunião de onboarding', texto: 'Entendemos o seu negócio, as metas e os desafios.' },
      { titulo: 'Planejamento', texto: 'Montamos a estratégia e o calendário de conteúdo e anúncios.' },
      { titulo: 'Mãos à obra!', texto: 'Campanhas no ar e conteúdo publicado. Agora é crescer!' },
    ],
    proximosPassos: [
      { titulo: 'Aprovação', texto: 'Você escolhe o plano e nos avisa pelo WhatsApp.' },
      { titulo: 'Contrato', texto: 'Enviamos o contrato já preenchido para assinatura.' },
      { titulo: 'Kickoff', texto: 'Pagamento da taxa de implementação via Pix.' },
      { titulo: 'Onboarding', texto: 'Reunião de imersão e início do planejamento.' },
    ],
    rodapeValidade: 'Valores e bonificações podem sofrer alterações após esta data',
    disclaimerProjecao: 'Projeção ilustrativa, baseada em médias de mercado e nos parâmetros informados. Não constitui garantia de resultado.',
  },
  avisos: [
    { id: 'av1', ativo: true, texto: 'Contrato com vigência padrão de {prazoMeses} meses com renovação automática (os primeiros {mesesSemFidelidade} meses sem fidelidade contratual). Todos os planos são pós-pagos;' },
    { id: 'av2', ativo: true, texto: 'Todos os planos contêm taxa de implementação de {kickoffPct}% no início do contrato, não reembolsável (para mensalidades inferiores a {kickoffLimite}, a taxa é de {kickoffPctAbaixo}%);' },
    { id: 'av3', ativo: true, texto: 'Contratação de material visual avulso (logo, landing page, etc.): entrada de {entradaMaterialPct}% e {restoMaterialPct}% na entrega;' },
    { id: 'av4', ativo: true, texto: 'Todos os planos possuem desconto por pontualidade de {descontoPontualidade}, independente do valor;' },
    { id: 'av5', ativo: true, texto: 'Todo cancelamento deve ser solicitado com aviso prévio de {avisoPrevioDias} dias corridos;' },
    { id: 'av6', ativo: true, texto: 'Escopo fechado: somente os itens discriminados no plano contratado são entregues. Demandas adicionais (artes extras a R$ 60/un, vídeos extras a R$ 300/un e pernas adicionais de tráfego a R$ 1.390/mês) são cobradas à parte;' },
    { id: 'av7', ativo: true, texto: 'Planos com captação presencial de vídeo e fotos são exclusivos para Três Lagoas/MS. Para clientes de outras cidades, a assessoria é focada em tráfego, vendas e funil digital, sem captação presencial;' },
    { id: 'av8', ativo: true, texto: 'CRM e Automação de WhatsApp (Kommo): serviço opcional (Plus Estratégico), contratado separadamente ou em planos corporativos dedicados.' },
  ],
  // Páginas de prova social da proposta. Só aparecem quando têm conteúdo.
  portfolio: {
    quemSomosTitulo: 'Quem é a **Fizgo**',
    quemSomos: 'Não somos uma agência de postagens aleatórias: somos uma **assessoria de crescimento e vendas**. Unimos tráfego pago (Google, Meta e TikTok Ads), criativos que convertem, funis de atração e apoio comercial para transformar a sua empresa em um negócio **previsível e lucrativo**.\n\nSede em Três Lagoas/MS, com estúdio e captação local, e assessoria remota para clientes em todo o Brasil.',
    manifesto: 'Não somos uma agência de vaidade; somos uma assessoria focada exclusivamente em fazer o seu negócio vender mais.',
    numeros: [
      { valor: '5.0 ★', label: 'no Google (32 avaliações)' },
      { valor: '+200', label: 'empresas aceleradas em todo o país' },
      { valor: 'Top 3%', label: 'agências Google Partner Premier' },
      { valor: 'Top 1%', label: 'consultorias Meta Business Partner' },
    ],
    selos: [
      { titulo: 'Google Partner Premier', texto: 'Nível mais alto de parceria com o Google. Top 3% do Brasil com acesso direto a especialistas de produto.' },
      { titulo: 'Meta Business Partner', texto: 'Especialistas certificados em anúncios no Instagram e Facebook. Top 1% das consultorias do Brasil.' },
      { titulo: 'Kommo Partner (Plus Estratégico)', texto: 'Parceiro oficial em CRM e automação comercial no WhatsApp. Disponível como Plus opcional para estruturar times comerciais.' },
    ],
    metodoTitulo: 'O método *4 Pilares de Crescimento* FizGO',
    metodoTexto: 'Um método completo para gerar demanda, transformar contatos em vendas e medir o retorno de cada real investido.',
    pilares: [
      { titulo: '1. Aquisição & Tráfego Qualificado', texto: 'Campanhas em Google, Meta e TikTok Ads levando pessoas prontas para comprar direto ao seu canal de vendas.' },
      { titulo: '2. Engajamento & Posicionamento', texto: 'Criativos, vídeos e páginas desenvolvidos com copywriting persuasivo que geram desejo imediato pela sua solução.' },
      { titulo: '3. Conversão & Estrutura de Vendas', texto: 'Apoio na jornada de compra do lead, roteiros de atendimento e estruturação comercial para aumentar sua taxa de fechamento.' },
      { titulo: '4. Retenção & Análise de ROI', texto: 'Painel de métricas (Área do Cliente), acompanhamento semanal de ROAS e estratégias de recompra e aumento de LTV.' },
    ],
    diferenciais: {
      titulo: 'Por que a *FizGO*? Compare você mesmo.',
      colunas: ['Freelancer / Agência Comum', 'Agência Tradicional'],
      linhas: [
        { item: 'Foco exclusivo em vendas, ROAS e receita real', a: false, b: false, nos: 'Foco 100% em vendas' },
        { item: 'Área do Cliente com dashboard em tempo real', a: false, b: false, nos: 'Painel de métricas incluso' },
        { item: 'Captação presencial de vídeo (Três Lagoas/MS)', a: false, b: true, nos: 'Equipe e estúdio locais' },
        { item: 'Maior certificação (Google Premier & Meta Partner)', a: false, b: false, nos: 'Top 1% a 3% do Brasil' },
        { item: 'Acesso liberado a cursos, treinamentos e workshops', a: false, b: false, nos: 'Comunidade e eventos Fizgo' },
        { item: 'Transparência total de escopo sem surpresas', a: true, b: false, nos: 'Escopo claro e contratado' },
      ],
    },
    equipe: [],
    cases: [],
    depoimentos: [],
    logosClientes: [],
    videoPadrao: '',
  },
  // Penalidades e prazos padrão do contrato do prestador PJ
  regrasPJ: {
    multaAtrasoPct: 1, diasNaoEntrega: 3, multaNaoEntregaPct: 5, multaErroGravePct: 10, tetoMultasPct: 30,
    prazoDefesaHoras: 48, prazoAjusteHoras: 24, avisoPrevioDias: 30, diaNF: 2, diaPagamento: 5, diaPagamentoAtraso: 10,
    multaSigiloMeses: 3, multaAliciamentoMeses: 6, anosSigilo: 5,
  },
  // Assinatura eletrônica pelo Autentique (token gerado em painel.autentique.com.br/perfil/api)
  autentique: {
    token: '',
    sandbox: true, // modo teste: documentos não valem e não gastam créditos
    lembrete: 'WEEKLY',
    envioCliente: 'link', // link: você manda o link no WhatsApp · email · whatsapp (o Autentique manda)
    mensagem: 'Olá! Segue o contrato de prestação de serviços da Fizgo Digital para assinatura eletrônica. Qualquer dúvida, estamos à disposição.',
  },
  // Mensagens de WhatsApp. Variáveis: {nome} {numero} {validade} {empresa} {slogan} {valor} {kickoff} {pix} {data} {link}
  mensagens: {
    envio: 'Olá, {nome}! Tudo bem? 😊\n\nSegue a sua proposta *{numero}*, preparada especialmente para vocês. Ela é válida até *{validade}*.\n\nDá uma olhada com calma e me conta o que achou. Se quiser, marcamos uma call rápida para tirar as dúvidas!\n\n{empresa} · {slogan}',
    followup: 'Oi, {nome}! Tudo certo? Passando para saber se conseguiu olhar a proposta *{numero}* que te enviei. Posso te ajudar a escolher o melhor plano ou ajustar algum ponto? 😉',
    vencendo: 'Oi, {nome}! A proposta *{numero}* vale até *{validade}*, e depois disso os valores e bônus podem mudar. Quer garantir essas condições? É só me responder por aqui! 🚀',
    contrato: 'Olá, {nome}! Que alegria ter vocês com a gente! 🎉\n\nO contrato *{numero}* foi enviado para assinatura eletrônica pelo Autentique (chega no seu e-mail). Qualquer dúvida, é só chamar!',
    assinatura: 'Olá, {nome}! Que alegria ter vocês com a gente! 🎉\n\nSegue o link para assinar o contrato *{numero}* de forma eletrônica, pelo Autentique. É rapidinho, dá para assinar pelo celular:\n\n{link}\n\nQualquer dúvida, é só chamar!',
    kickoff: 'Olá, {nome}! Para iniciarmos os trabalhos, segue a taxa de kickoff de *{kickoff}*.\n\nChave Pix: {pix}\n\nAssim que o pagamento for confirmado, já agendamos o onboarding! 💚',
    renovacao: 'Oi, {nome}! O nosso contrato *{numero}* completa o ciclo em {data}. Que tal marcarmos uma conversa para apresentar os resultados e planejar os próximos meses? 📈',
    extras: 'Oi, {nome}! Tudo bem? 😊\n\nSegue a nossa tabela de serviços extras, com sites, vídeos, podcast, design e mais. Os valores de *cliente Fizgo* valem para quem tem plano ativo com a gente.\n\nMe conta o que você precisa que eu monto o orçamento certinho! 🚀',
  },
  // Tabela de serviços extras (Ferramentas → Tabela de extras). Preço de cliente = quem tem plano ativo.
  extras: {
    titulo: 'Serviços *extras*',
    subtitulo: 'Tudo o que a sua marca precisa além do plano, com valor especial para quem já é cliente Fizgo.',
    rotuloCliente: 'Cliente Fizgo',
    rotuloAvulso: 'Avulso',
    mostrar: 'ambos',
    validadeDias: 30,
    condicoes: 'Projetos de entrega única: 50% de entrada e 50% na entrega.\nPrazos contam a partir da aprovação do briefing e do recebimento dos materiais.\nValores de cliente valem para contratos com plano mensal ativo.',
    categorias: [
      { id: 'sites', nome: 'Sites & páginas', icone: 'globe', ativo: true, descricao: 'Presença profissional e páginas que convertem visita em contato.', itens: [
        { nome: 'Landing page de alta conversão', descricao: 'Página única focada em uma oferta, integrada ao WhatsApp e ao pixel', unidade: 'projeto', prazo: '10 dias úteis', cliente: 1800, avulso: 2390 },
        { nome: 'Site institucional one page', descricao: 'Apresentação da empresa, serviços, depoimentos e contato em uma página', unidade: 'projeto', prazo: '15 dias úteis', cliente: 1800, avulso: 2390 },
        { nome: 'Site completo', descricao: 'Até 5 páginas, otimizado para Google e celular', unidade: 'projeto', prazo: '25 dias úteis', cliente: 2250, avulso: 2990 },
        { nome: 'Manutenção de site', descricao: 'Atualizações de conteúdo, backups e suporte', unidade: 'mês', prazo: '', cliente: 150, avulso: 250 },
      ] },
      { id: 'video', nome: 'Vídeo & foto', icone: 'video', ativo: true, descricao: 'Captação e edição com roteiro, do Reels ao institucional.', itens: [
        { nome: 'Vídeo extra (Reels)', descricao: 'Roteiro, edição dinâmica e legenda', unidade: 'vídeo', prazo: '5 dias úteis', cliente: 300, avulso: 390 },
        { nome: 'Captação extra', descricao: 'Equipe e equipamentos em Três Lagoas/MS, até 2 horas', unidade: 'captação', prazo: 'agendada', cliente: 300, avulso: 450 },
        { nome: 'Ensaio fotográfico', descricao: 'Fotos profissionais da marca, equipe ou produtos, com tratamento', unidade: 'ensaio', prazo: '7 dias úteis', cliente: 300, avulso: 450 },
        { nome: 'Vídeo institucional', descricao: 'Até 2 minutos, com roteiro, captação e edição completa', unidade: 'projeto', prazo: '15 dias úteis', cliente: 1500, avulso: 1990 },
        { nome: 'Edição de vídeo', descricao: 'Edição de material gravado por você, até 1 minuto', unidade: 'vídeo', prazo: '3 dias úteis', cliente: 150, avulso: 200 },
      ] },
      { id: 'podcast', nome: 'Podcast & videocast', icone: 'mic', ativo: true, descricao: 'Autoridade em formato longo, com cortes prontos para as redes.', itens: [
        { nome: 'Gravação de episódio', descricao: 'Até 1 hora, 2 câmeras, áudio profissional e iluminação', unidade: 'episódio', prazo: 'agendada', cliente: 600, avulso: 800 },
        { nome: 'Edição do episódio + 3 cortes', descricao: 'Episódio completo editado e 3 cortes verticais com legenda', unidade: 'episódio', prazo: '7 dias úteis', cliente: 450, avulso: 600 },
        { nome: 'Pacote mensal de podcast', descricao: '4 episódios gravados e editados + 12 cortes para as redes', unidade: 'mês', prazo: '', cliente: 3200, avulso: 4200 },
      ] },
      { id: 'design', nome: 'Design & marca', icone: 'layers', ativo: true, descricao: 'Peças e materiais com a cara da sua marca.', itens: [
        { nome: 'Arte avulsa', descricao: 'Post, story ou carrossel', unidade: 'arte', prazo: '3 dias úteis', cliente: 60, avulso: 90 },
        { nome: 'Apresentação comercial', descricao: 'Até 15 slides, para vendas ou reuniões', unidade: 'projeto', prazo: '10 dias úteis', cliente: 900, avulso: 1190 },
        { nome: 'E-book', descricao: 'Até 20 páginas, diagramado e pronto para captar contatos', unidade: 'projeto', prazo: '10 dias úteis', cliente: 750, avulso: 990 },
        { nome: 'Catálogo de produtos', descricao: 'Até 20 páginas, digital ou para impressão', unidade: 'projeto', prazo: '10 dias úteis', cliente: 600, avulso: 790 },
        { nome: 'Criação de logo', descricao: 'Logo com manual de aplicação', unidade: 'projeto', prazo: '15 dias úteis', cliente: 1200, avulso: 1590 },
        { nome: 'Identidade visual completa', descricao: 'Logo, paleta, tipografia e aplicações', unidade: 'projeto', prazo: '20 dias úteis', cliente: 2500, avulso: 3290 },
      ] },
      { id: 'vendas', nome: 'IA, CRM & vendas', icone: 'zap', ativo: true, descricao: 'Para não perder nenhum contato que o marketing gerar.', itens: [
        { nome: 'Implantação de CRM Kommo', descricao: 'Funil, etapas e automações no WhatsApp', unidade: 'projeto', prazo: '15 dias úteis', cliente: 2500, avulso: 3290 },
        { nome: 'Atendente de IA no WhatsApp', descricao: 'Treinada para o seu negócio e integrada ao CRM (+ R$ 400/mês de manutenção)', unidade: 'projeto', prazo: '15 dias úteis', cliente: 2500, avulso: 3290 },
        { nome: 'Treinamento da equipe de atendimento', descricao: 'Script de vendas e simulações, encontro presencial ou online', unidade: 'treinamento', prazo: 'agendado', cliente: 1500, avulso: 1990 },
      ] },
    ],
  },
};

// ---------- Modelos por segmento: preenchem diagnóstico, projeção e plano sugerido ----------
export const DEFAULT_SEGMENTOS = [
  {
    id: 'saude', nome: 'Saúde (clínicas e consultórios)', planoId: 'pl_lakeplus', verba: 1500, cpl: 18, conversao: 15, ticket: 450,
    resumo: 'Profissionais com ótima reputação no consultório, mas que ainda não transmitem essa autoridade no digital.',
    desafios: 'Agenda com horários vagos\nDependência de indicação boca a boca\nInstagram sem frequência nem linha editorial\nDificuldade em comunicar diferenciais respeitando as regras do conselho',
    objetivos: 'Posicionar o profissional como referência na região\nGerar contatos qualificados todo mês\nLotar a agenda com os procedimentos mais rentáveis\nConteúdo educativo que gera confiança',
  },
  {
    id: 'estetica', nome: 'Estética e beleza', planoId: 'pl_lake', verba: 1200, cpl: 12, conversao: 18, ticket: 280,
    resumo: 'Negócio que vive de imagem e recorrência, em um mercado local cada vez mais disputado.',
    desafios: 'Concorrência forte e guerra de preço\nClientes que fazem um procedimento e não voltam\nFotos e vídeos que não mostram o padrão do serviço\nPromoções sem planejamento',
    objetivos: 'Construir desejo pela marca, não pelo preço\nAumentar a recorrência das clientes\nAgenda cheia nas datas sazonais\nVitrine no Instagram à altura do serviço',
  },
  {
    id: 'alimentacao', nome: 'Alimentação (restaurantes e delivery)', planoId: 'pl_lake', verba: 1000, cpl: 6, conversao: 25, ticket: 70,
    resumo: 'Operação com bom produto, que precisa ser lembrada na hora em que o cliente decide onde comer.',
    desafios: 'Movimento irregular durante a semana\nDependência dos aplicativos de delivery e suas taxas\nPouca fotografia profissional dos pratos\nBaixo engajamento nas redes',
    objetivos: 'Aumentar o fluxo nos dias mais fracos\nLevar pedidos para o canal próprio (WhatsApp)\nFotos e vídeos que dão vontade de pedir\nCampanhas para datas e lançamentos',
  },
  {
    id: 'varejo', nome: 'Varejo e loja física', planoId: 'pl_lake', verba: 1500, cpl: 8, conversao: 12, ticket: 220,
    resumo: 'Loja com mix interessante, mas que precisa trazer mais gente até o balcão e para o WhatsApp.',
    desafios: 'Fluxo de loja abaixo do potencial\nProdutos novos que não chegam ao público certo\nVendas concentradas em poucas datas\nAtendimento pelo WhatsApp sem organização',
    objetivos: 'Aumentar o fluxo na loja e no WhatsApp\nDivulgar novidades e coleções com impacto\nCalendário de campanhas o ano todo\nFortalecer a marca na cidade',
  },
  {
    id: 'servicos', nome: 'Serviços e profissionais liberais', planoId: 'pl_lake', verba: 1000, cpl: 20, conversao: 10, ticket: 1200,
    resumo: 'Profissionais competentes que precisam ser encontrados e escolhidos por quem ainda não os conhece.',
    desafios: 'Clientes chegam só por indicação\nDificuldade de explicar o valor do serviço\nPresença digital sem padrão profissional\nPouco tempo para produzir conteúdo',
    objetivos: 'Gerar oportunidades além da indicação\nConteúdo que explica e valoriza o serviço\nImagem profissional e consistente\nProcesso previsível de captação',
  },
  {
    id: 'industria', nome: 'Indústria e B2B', planoId: 'pl_river', verba: 2500, cpl: 45, conversao: 8, ticket: 6000,
    resumo: 'Empresa sólida, com vendas complexas, que precisa gerar oportunidades qualificadas e encurtar o ciclo comercial.',
    desafios: 'Ciclo de venda longo e poucos contatos qualificados\nMarca pouco conhecida fora da carteira atual\nEquipe comercial sem materiais de apoio\nNenhuma medição do retorno do marketing',
    objetivos: 'Gerar leads qualificados para o comercial\nAutoridade da marca no setor\nMateriais que ajudam a equipe a vender\nIndicadores claros de retorno',
  },
  {
    id: 'imobiliario', nome: 'Imobiliário e construção', planoId: 'pl_river', verba: 3000, cpl: 25, conversao: 2, ticket: 15000,
    resumo: 'Mercado de alto ticket, onde confiança e presença constante decidem quem fecha o negócio.',
    desafios: 'Leads frios e curiosos sem perfil de compra\nImóveis e obras mal apresentados nas redes\nConcorrência de portais e grandes imobiliárias\nPouco acompanhamento do lead até a visita',
    objetivos: 'Leads com perfil de compra real\nApresentação de alto padrão dos imóveis\nAgenda de visitas constante\nMarca reconhecida como referência local',
  },
  {
    id: 'educacao', nome: 'Educação e cursos', planoId: 'pl_lakeplus', verba: 2000, cpl: 15, conversao: 6, ticket: 900,
    resumo: 'Instituição com bom ensino que precisa encher turmas em cada período de matrícula.',
    desafios: 'Matrículas concentradas em poucas semanas\nConcorrência com cursos online\nPouca prova social nas redes\nLeads que somem antes da matrícula',
    objetivos: 'Turmas cheias em cada captação\nMostrar resultados de alunos e da estrutura\nCampanhas de matrícula planejadas\nRelacionamento com a comunidade',
  },
];

// ---------- Catálogo de serviços (preços de tabela — edite à vontade) ----------
// bullet: como aparece na proposta/contrato. {qtd} é substituído pela quantidade.
// ---------- Catálogo de serviços (preços cheios de tabela — edite à vontade) ----------
// bullet: como aparece na proposta/contrato. {qtd} é substituído pela quantidade.
export const DEFAULT_ITENS = [
  // Conteúdo & Design (Valores cheios de tabela citados pelo Márcio)
  { id: 'arte', categoria: 'Conteúdo', nome: 'Artes no feed (post / carrossel)', unidade: 'arte', preco: 60, cobranca: 'mensal', bullet: '{qtd} artes no feed (posts estáticos e carrosséis estratégicos)', qtdPadrao: 8 },
  { id: 'video', categoria: 'Conteúdo', nome: 'Vídeos / Reels editados (com roteiro)', unidade: 'vídeo', preco: 300, cobranca: 'mensal', bullet: '{qtd} vídeos (Reels gravados e editados com roteiro persuasivo e legenda)', qtdPadrao: 2 },
  { id: 'captacao_presencial', categoria: 'Conteúdo', nome: 'Captação presencial de vídeo e foto (Três Lagoas/MS)', unidade: 'captação', preco: 600, cobranca: 'mensal', bullet: '{qtd} captação presencial de vídeo e foto com equipe e equipamentos em Três Lagoas/MS', qtdPadrao: 1 },
  { id: 'full_design', categoria: 'Conteúdo', nome: 'Design gráfico contínuo sem limite de artes', unidade: 'mês', preco: 4500, cobranca: 'mensal', bullet: 'Design gráfico e criação contínua sem limite de artes no fluxo mensal', qtdPadrao: 1, semQtd: true },
  { id: 'copy', categoria: 'Estratégia', nome: 'Copywriting e planejamento estratégico', unidade: 'mês', preco: 250, cobranca: 'mensal', bullet: 'Copywriting persuasivo e planejamento estratégico de postagem', qtdPadrao: 1, semQtd: true },
  { id: 'gestao', categoria: 'Estratégia', nome: 'Gestão e agendamento de postagens', unidade: 'mês', preco: 200, cobranca: 'mensal', bullet: 'Gestão e agendamento profissional de postagens nos dias e horários nobres', qtdPadrao: 1, semQtd: true },

  // Tráfego Pago & Performance (Cada perna R$ 1.390/mês, conforme Márcio)
  { id: 'trafego_meta', categoria: 'Tráfego pago', nome: 'Gestão de Tráfego — Meta Ads (Instagram & Facebook)', unidade: 'mês', preco: 1390, cobranca: 'mensal', bullet: 'Gestão de tráfego pago na plataforma Meta Ads (Instagram & Facebook)', qtdPadrao: 1, semQtd: true },
  { id: 'trafego_google', categoria: 'Tráfego pago', nome: 'Gestão de Tráfego — Google Ads (Pesquisa, Maps & YouTube)', unidade: 'mês', preco: 1390, cobranca: 'mensal', bullet: 'Gestão de tráfego pago na plataforma Google Ads (Pesquisa, Maps & YouTube)', qtdPadrao: 1, semQtd: true },
  { id: 'trafego_tiktok', categoria: 'Tráfego pago', nome: 'Gestão de Tráfego — TikTok Ads', unidade: 'mês', preco: 1390, cobranca: 'mensal', bullet: 'Gestão de tráfego pago na plataforma TikTok Ads', qtdPadrao: 1, semQtd: true },
  { id: 'copyads', categoria: 'Tráfego pago', nome: 'Copywriting de anúncios & roteiros', unidade: 'mês', preco: 150, cobranca: 'mensal', bullet: 'Copywriting e roteirização persuasiva para anúncios patrocinados', qtdPadrao: 1, semQtd: true },
  { id: 'report', categoria: 'Tráfego pago', nome: 'Report semanal de performance', unidade: 'mês', preco: 0, cobranca: 'mensal', bullet: 'Relatório semanal de performance com métricas de ROAS, CPL e conversões', qtdPadrao: 1, semQtd: true },
  { id: 'reuniao45', categoria: 'Estratégia', nome: 'Reunião estratégica de resultados', unidade: 'mês', preco: 0, cobranca: 'mensal', bullet: 'Reunião estratégica de alinhamento e apresentação de resultados', qtdPadrao: 1, semQtd: true },

  // Benefícios e Entregáveis de Alto Valor Agregado
  { id: 'areacliente', categoria: 'Estratégia', nome: 'Área do Cliente & Dashboard em tempo real', unidade: 'mês', preco: 0, cobranca: 'mensal', bullet: 'Área do Cliente exclusiva com dashboard de métricas e indicadores de vendas em tempo real', qtdPadrao: 1, semQtd: true },
  { id: 'treinamentos', categoria: 'Consultoria', nome: 'Acesso a treinamentos, cursos e eventos Fizgo', unidade: 'mês', preco: 0, cobranca: 'mensal', bullet: 'Acesso liberado a cursos, workshops e eventos comerciais da Fizgo Digital', qtdPadrao: 1, semQtd: true },
  { id: 'prioridade', categoria: 'Estratégia', nome: 'Prioridade em lançamentos e campanhas sazonais', unidade: 'mês', preco: 0, cobranca: 'mensal', bullet: 'Prioridade estratégica em lançamentos, datas sazonais e testes de novas tecnologias', qtdPadrao: 1, semQtd: true },
  { id: 'grupowhats', categoria: 'Estratégia', nome: 'Canal VIP no WhatsApp com a equipe', unidade: 'mês', preco: 0, cobranca: 'mensal', bullet: 'Canal direto via grupo VIP de WhatsApp com estrategista e equipe de atendimento', qtdPadrao: 1, semQtd: true },

  // Soluções Avançadas e Projetos Pontuais
  { id: 'crmgestao', categoria: 'Conversão & vendas', nome: 'Gestão de CRM e funil de vendas (Kommo) — Plus', unidade: 'mês', preco: 600, cobranca: 'mensal', bullet: 'Gestão do CRM e do funil de vendas no WhatsApp (Kommo) — Plus opcional', qtdPadrao: 1, semQtd: true },
  { id: 'treinamento', categoria: 'Conversão & vendas', nome: 'Treinamento comercial do atendimento', unidade: 'mês', preco: 800, cobranca: 'mensal', bullet: 'Treinamento comercial mensal da equipe de atendimento (script e acompanhamento)', qtdPadrao: 1, semQtd: true },
  { id: 'landing', categoria: 'Presença digital', nome: 'Landing page de alta conversão', unidade: 'projeto', preco: 1800, cobranca: 'unico', bullet: 'Landing page de alta conversão e carregamento ultra-rápido', qtdPadrao: 1, semQtd: true },
  { id: 'kommo', categoria: 'Conversão & vendas', nome: 'Implantação de CRM Kommo (Plus opcional)', unidade: 'projeto', preco: 2500, cobranca: 'unico', bullet: 'Implantação do CRM Kommo (funil, etapas e automações no WhatsApp)', qtdPadrao: 1, semQtd: true },
  { id: 'agenteia', categoria: 'Conversão & vendas', nome: 'Implantação de atendente de IA no WhatsApp', unidade: 'projeto', preco: 2500, cobranca: 'unico', bullet: 'Atendente de IA no WhatsApp: treinamento personalizado e integração com CRM', qtdPadrao: 1, semQtd: true },
  { id: 'logo', categoria: 'Material visual', nome: 'Criação de logo', unidade: 'projeto', preco: 1200, cobranca: 'unico', bullet: 'Criação de logo e manual de aplicação', qtdPadrao: 1, semQtd: true },
  { id: 'identidade', categoria: 'Material visual', nome: 'Identidade visual completa', unidade: 'projeto', preco: 2500, cobranca: 'unico', bullet: 'Identidade visual completa (logo, paleta, tipografia e aplicações)', qtdPadrao: 1, semQtd: true },
];

// ---------- Planos prontos: grade comercial Fizgo ----------
// Cada plano possui ancoragem de Valor Cheio somado e Desconto de Pacote Estratégico.
const BENEFICIOS_PADRAO = [{ ref: 'areacliente', qtd: 1 }, { ref: 'treinamentos', qtd: 1 }, { ref: 'prioridade', qtd: 1 }, { ref: 'grupowhats', qtd: 1 }];

export const DEFAULT_PLANOS = [
  // 1. Só Tráfego Pago (1 Perna - Meta Ads)
  {
    id: 'pl_so_trafego',
    nome: 'Tráfego Pago & Performance (Meta Ads)',
    descricao: 'Gestão cirúrgica de anúncios no Instagram e Facebook para geração diária de leads qualificados.',
    itens: [{ ref: 'trafego_meta', qtd: 1 }, { ref: 'copyads', qtd: 1 }, { ref: 'report', qtd: 1 }, { ref: 'areacliente', qtd: 1 }, { ref: 'grupowhats', qtd: 1 }],
    extras: ['Tráfego focado em aquisição direta no WhatsApp e Direct'],
    bonus: [],
    precoModo: 'fixo',
    valorTabela: 1540,
    desconto: { tipo: 'valor', valor: 150 }, // fica R$ 1.390
  },

  // 2. Growth multicanal (2 pernas: Meta + Google Ads), sem captação: atende qualquer cidade
  {
    id: 'pl_growth_v4',
    nome: 'Assessoria de Vendas & Growth (Meta + Google)',
    descricao: 'Estruturação de máquina de vendas: Tráfego multicanal (Meta + Google), funil de conversão e esteira de criativos. Sem exigência de captação presencial (ideal para todo o Brasil).',
    itens: [
      { ref: 'trafego_meta', qtd: 1 },
      { ref: 'trafego_google', qtd: 1 },
      { ref: 'copyads', qtd: 1 },
      { ref: 'report', qtd: 1 },
      { ref: 'reuniao45', qtd: 1 },
      ...BENEFICIOS_PADRAO,
    ],
    extras: ['Gestão integrada multicanal (Google Ads + Meta Ads)'],
    bonus: [],
    precoModo: 'fixo',
    valorTabela: 3230,
    desconto: { tipo: 'valor', valor: 640 }, // fica R$ 2.590
  },

  // 3. Captação & Audiovisual Local (Presencial Três Lagoas)
  {
    id: 'pl_audiovisual_local',
    nome: 'Captação & Audiovisual (Presencial Três Lagoas)',
    descricao: 'Captação presencial de vídeo e fotos com equipe e equipamentos em Três Lagoas/MS, com edição e entrega de Reels finalizados.',
    itens: [
      { ref: 'captacao_presencial', qtd: 1 },
      { ref: 'video', qtd: 2 },
      { ref: 'copy', qtd: 1 },
      { ref: 'areacliente', qtd: 1 },
      { ref: 'grupowhats', qtd: 1 },
    ],
    extras: ['Captação presencial mensal com roteiro e direção de cena'],
    bonus: [],
    precoModo: 'fixo',
    valorTabela: 1450,
    desconto: { tipo: 'valor', valor: 260 }, // fica R$ 1.190
  },

  // 4. Design Full Sem Limite de Artes (~ R$ 3.000)
  {
    id: 'pl_full_design',
    nome: 'Design Full Sem Limite de Artes',
    descricao: 'Demanda contínua de design gráfico, banners e criativos sem limite de quantidade durante todo o mês.',
    itens: [
      { ref: 'full_design', qtd: 1 },
      { ref: 'copy', qtd: 1 },
      { ref: 'gestao', qtd: 1 },
      ...BENEFICIOS_PADRAO,
    ],
    extras: ['Criação ilimitada de peças gráficas em fluxo contínuo'],
    bonus: [],
    precoModo: 'fixo',
    valorTabela: 4950,
    desconto: { tipo: 'valor', valor: 1960 }, // fica R$ 2.990
  },

  // 5. Marketing Completo Local (Lake - Três Lagoas)
  {
    id: 'pl_lake',
    nome: 'Marketing Completo Local (Lake)',
    descricao: 'Vídeos com captação presencial, artes estratégicas, tráfego pago e gestão de postagem.',
    itens: [
      { ref: 'trafego_meta', qtd: 1 },
      { ref: 'video', qtd: 2 },
      { ref: 'arte', qtd: 6 },
      { ref: 'captacao_presencial', qtd: 1 },
      { ref: 'copy', qtd: 1 },
      { ref: 'gestao', qtd: 1 },
      { ref: 'report', qtd: 1 },
      ...BENEFICIOS_PADRAO,
    ],
    extras: [],
    bonus: [],
    precoModo: 'fixo',
    valorTabela: 2590,
    desconto: { tipo: 'valor', valor: 500 }, // de R$ 2.590 por R$ 2.090 (plano mais vendido)
  },

  // 6. Marketing Completo Acelerado (Lake Plus - Três Lagoas)
  {
    id: 'pl_lakeplus',
    nome: 'Marketing Completo Acelerado (Lake Plus)',
    descricao: 'Mais vídeos, artes semanais, tráfego pago e captação presencial para acelerar autoridade e vendas.',
    itens: [
      { ref: 'trafego_meta', qtd: 1 },
      { ref: 'video', qtd: 4 },
      { ref: 'arte', qtd: 8 },
      { ref: 'captacao_presencial', qtd: 1 },
      { ref: 'copy', qtd: 1 },
      { ref: 'gestao', qtd: 1 },
      { ref: 'report', qtd: 1 },
      ...BENEFICIOS_PADRAO,
    ],
    extras: [],
    bonus: [],
    precoModo: 'fixo',
    valorTabela: 4120,
    desconto: { tipo: 'valor', valor: 1130 }, // de R$ 4.120 por R$ 2.990 (economia de R$ 1.130/mês)
    pontualidade: false,
  },

  // 7. Presença Visual (Só Artes Simplificado)
  {
    id: 'pl_comet',
    nome: 'Presença Visual (Só Artes)',
    descricao: 'Presença consistente com postagens gráficas profissionais no feed, sem vídeos.',
    itens: [
      { ref: 'arte', qtd: 8 },
      { ref: 'copy', qtd: 1 },
      { ref: 'gestao', qtd: 1 },
      { ref: 'areacliente', qtd: 1 },
      { ref: 'grupowhats', qtd: 1 },
    ],
    extras: [],
    bonus: [],
    precoModo: 'fixo',
    valorTabela: 930,
    desconto: { tipo: 'valor', valor: 0 },
  },

  // 8. Full-Service Avançado + CRM Kommo (Plus Estratégico)
  {
    id: 'pl_avancado',
    nome: 'Full-Service Avançado + CRM Kommo (Plus)',
    descricao: 'Marketing multicanal, CRM no WhatsApp, captação presencial e treinamento de vendas do time.',
    itens: [
      { ref: 'trafego_meta', qtd: 1 },
      { ref: 'trafego_google', qtd: 1 },
      { ref: 'video', qtd: 6 },
      { ref: 'arte', qtd: 8 },
      { ref: 'captacao_presencial', qtd: 1 },
      { ref: 'copy', qtd: 1 },
      { ref: 'gestao', qtd: 1 },
      { ref: 'crmgestao', qtd: 1 },
      { ref: 'treinamento', qtd: 1 },
      ...BENEFICIOS_PADRAO,
    ],
    extras: ['Gestão de CRM e acompanhamento de equipe comercial incluso'],
    bonus: [],
    precoModo: 'fixo',
    valorTabela: 8500,
    desconto: { tipo: 'valor', valor: 1600 }, // fica R$ 6.900
  },
];

// Planos da grade antiga → plano equivalente da grade 2026
export const PLANOS_ANTIGOS = {
  pl_acqua: 'pl_so_trafego',
  pl_river: 'pl_growth_v4',
  pl_ocean: 'pl_lakeplus',
  pl_edicao: 'pl_full_design',
  pl_lake_custom: 'pl_lake',
  pl_basic: 'pl_lake',
  pl_impulsionado: 'pl_growth_v4',
};

// ---------- Escopos prontos (páginas extras da proposta) ----------
export const DEFAULT_ESCOPOS = [
  {
    id: 'esc_mentoria', titulo: 'Escopo do projeto de **mentoria**',
    texto: `## Objetivo
Oferecer suporte estratégico contínuo para a estruturação de produtos, organização de trilhas de raciocínio, fortalecimento do posicionamento de marca e desenvolvimento de estratégias de vendas. A mentoria tem como foco transformar o conhecimento do cliente em soluções organizadas, escaláveis e comercialmente eficazes.

## 1. Estruturação de Trilhas de Raciocínio
- Organização lógica do conhecimento técnico e prático
- Mapeamento de dores dos clientes, soluções e etapas de atendimento
- Criação de fluxos estratégicos de atendimento e acompanhamento
- Consolidação de linhas de cuidado com foco em clareza e escalabilidade

## 2. Formatação de Produtos e Serviços
- Identificação das expertises principais e secundárias
- Criação de pacotes, programas ou experiências com valor agregado
- Organização do portfólio de serviços de forma estratégica
- Precificação com base em posicionamento e percepção de valor

## 3. Posicionamento Estratégico de Marca
- Construção e refinamento da narrativa profissional
- Definição dos pilares de marca e identidade verbal
- Alinhamento entre discurso, imagem e valores
- Diretrizes para fortalecimento da autoridade no ambiente digital

## 4. Estratégias de Comunicação e Venda
- Definição da jornada do cliente (atração, conexão e conversão)
- Criação de argumentos comerciais e roteiros de apresentação de produtos
- Orientações para redes sociais, conteúdo e relacionamento com o público
- Apoio na estruturação de campanhas e lançamentos recorrentes

## 5. Organização e Tomada de Decisão Estratégica
- Apoio na definição de prioridades e caminhos viáveis de execução
- Direcionamento sobre gestão de tempo, equipe e recursos
- Estruturação progressiva de processos internos e pontos de controle
- Acompanhamento dos resultados e ajustes contínuos

## Metodologia de Atuação
A mentoria será desenvolvida em ciclos, com foco em entregas estratégicas conforme o estágio atual do cliente. Cada encontro terá objetivo claro e atividades práticas entre sessões.
- Encontros regulares (semanais ou quinzenais)
- Acompanhamento contínuo e personalizado
- Materiais de apoio, mapas mentais e documentos estruturantes
- Entregas evolutivas, baseadas em diagnóstico e necessidades em tempo real

## Exemplos de Entregáveis Possíveis
- Estruturação de programas e pacotes de atendimento
- Fluxograma de raciocínio técnico e comercial
- Posicionamento e narrativa institucional
- Planejamento de campanhas e ações de venda
- Documento de diferenciais e linguagem de marca
- Organização de processos e responsabilidades`,
  },
  {
    id: 'esc_trafego', titulo: 'Como funciona a **gestão de tráfego**',
    texto: `## Estratégia
Campanhas estruturadas por objetivo (reconhecimento, engajamento e conversão), com públicos segmentados e criativos testados continuamente.

## O que está incluso
- Configuração e verificação de pixel e conta de anúncios
- Criação e segmentação de públicos
- Testes A/B de criativos e copies
- Otimização semanal de campanhas
- Relatório mensal de resultados

## Importante
- A verba de anúncios é paga diretamente pelo cliente às plataformas (Meta / Google)
- Os resultados dependem de fatores como oferta, atendimento e sazonalidade`,
  },
];

// ---------- Modelos de contrato ----------
// Variáveis: {{nome}}. {{n}} = número da própria cláusula; {{ref:id}} = número de outra cláusula.
// Linha "[[TABELA_PLANO]]" insere a tabela do plano contratado.
// cond: a cláusula só vem ativa quando a condição é verdadeira ('mensal', 'unico', 'pontualidade', 'kickoff').

const C = {
  objeto: { id: 'objeto', titulo: 'OBJETO DO CONTRATO', texto: 'O presente contrato tem por objeto a prestação de serviços de {{tipoServico}} pela **CONTRATADA** à **CONTRATANTE**, conforme as especificações detalhadas neste instrumento{{origemProposta}}.' },
  servicos: {
    id: 'servicos', titulo: 'DESCRIÇÃO DOS SERVIÇOS E DELIMITAÇÃO DE ESCOPO', texto: `{{n}}.1. Os serviços a serem prestados pela **CONTRATADA** incluem o seguinte plano:
[[TABELA_PLANO]]

{{n}}.2. **Delimitação Estrita de Escopo e Cobrança de Demandas Extras:**
Fica expressamente acordado entre as Partes que **somente os serviços, quantidades e canais discriminados no item {{n}}.1 serão executados no escopo mensal contratado**. Quaisquer solicitações adicionais, alterações substanciais ou materiais extras solicitados pela **CONTRATANTE** constituem demandas extras, que serão orçadas à parte e só executadas após a aprovação prévia, por escrito, do orçamento pela **CONTRATANTE**.

{{n}}.3. **Exclusões Expressas:** Estão terminantemente excluídos da responsabilidade da **CONTRATADA**:
- Atendimento direto de mensagens nas redes sociais (*Direct Messages* - DMs) ou SAC/suporte ao cliente final.
- Custos de veiculação e verba de anúncios paga diretamente pela **CONTRATANTE** às plataformas veiculadoras (Meta Ads, Google Ads e TikTok Ads).
- Impressão gráfica física de materiais ou custos de terceiros não expressos.

{{n}}.4. **Entregáveis e Aprovações:**
{{n}}.4.1. A **CONTRATADA** entregará os materiais (posts, vídeos, *copies*) à **CONTRATANTE** com antecedência mínima de {{antecedenciaEntrega}} dias úteis para aprovação.
{{n}}.4.2. A **CONTRATANTE** terá o prazo de {{aprovacaoHoras}} horas para revisar e aprovar ou solicitar alterações nos materiais.
{{n}}.4.3. Caso a **CONTRATANTE** não se manifeste dentro do prazo estipulado no item {{n}}.4.2, os materiais serão considerados tacitamente aprovados.` },
  prazo: {
    id: 'prazo', titulo: 'PRAZO E RENOVAÇÃO', cond: 'mensal', texto: `{{n}}.1. O presente contrato terá duração de {{prazoMeses}} meses, a contar de {{dataInicio}}, com exceção dos primeiros {{mesesSemFidelidade}} meses, durante os quais não haverá fidelidade contratual.

{{n}}.2. Após o período inicial de {{prazoMeses}} meses, o contrato será automaticamente renovado por períodos sucessivos de {{renovacaoMeses}} meses, a menos que uma das Partes notifique a outra, por escrito, sobre a intenção de não renovar, com antecedência mínima de {{avisoPrevio}} dias do término do período vigente.` },
  kickoff: { id: 'kickoff', titulo: 'TAXA INICIAL (KICK-OFF)', cond: 'kickoff', texto: 'Para o início dos trabalhos, a **CONTRATANTE** pagará à **CONTRATADA**, a título de taxa inicial (*kick-off*) para implementação, configuração de *pixel* e da conta de anúncio, o valor correspondente a {{kickoffPct}} sobre o valor da primeira mensalidade ({{kickoffBase}}), totalizando {{kickoffValor}}, a ser pago via Pix no início da vigência deste contrato. **Esta taxa inicial não será passível de devolução em caso de rescisão contratual.**' },
  pagamento: { id: 'pagamento', titulo: 'CONDIÇÕES DE PAGAMENTO', cond: 'mensal', texto: 'O pagamento mensal pelos serviços prestados será de {{mensalidadeCheiaTxt}}, sendo a **mensalidade pós-paga**. O primeiro pagamento será devido até o dia {{diaVencimento}} do mês seguinte ao mês de início da prestação dos serviços. Os pagamentos subsequentes deverão ser realizados até o dia {{diaVencimento}} de cada mês.{{dadosPix}}' },
  pontualidade: {
    id: 'pontualidade', titulo: 'DESCONTO POR PONTUALIDADE', cond: 'pontualidade', texto: `{{n}}.1. Caso o pagamento da mensalidade seja efetuado até o dia {{diaPontualidade}} de cada mês, a **CONTRATANTE** fará jus a um desconto por pontualidade no valor de {{descontoPontualidadeTxt}}, totalizando o valor a ser pago de {{mensalidadeTxt}}.

{{n}}.2. O não pagamento da mensalidade até a data de vencimento estabelecida na Cláusula {{ref:pagamento}} (dia {{diaVencimento}} do mês) implicará na perda do desconto por pontualidade, sendo devido o valor integral da mensalidade de {{mensalidadeCheiaTxt}}.

{{n}}.3. O atraso no pagamento da mensalidade, após a data de vencimento, poderá acarretar na suspensão dos serviços prestados pela **CONTRATADA**, a seu exclusivo critério, até a regularização integral do pagamento. A suspensão dos serviços não exime a **CONTRATANTE** da obrigação de pagamento da mensalidade referente ao período.` },
  avulsos: {
    id: 'avulsos', titulo: 'SERVIÇOS DE ENTREGA ÚNICA', cond: 'unico', texto: `{{n}}.1. Os serviços de natureza única descritos na Cláusula {{ref:servicos}} (material visual e afins) totalizam {{unicoTotalTxt}}, a serem pagos da seguinte forma: {{entradaMaterialPct}} de entrada, no valor de {{unicoEntrada}}, na assinatura deste contrato, e o saldo de {{unicoSaldo}} na entrega dos materiais.

{{n}}.2. Estão incluídas até {{rodadasAjuste}} rodadas de ajustes por peça. Ajustes adicionais ou mudanças de escopo serão orçados à parte.

{{n}}.3. O valor de entrada não será restituído caso a **CONTRATANTE** desista do serviço após o início da produção.` },
  quitacao: { id: 'quitacao', titulo: 'QUITAÇÃO', texto: 'A quitação mútua das obrigações decorrentes deste contrato ocorrerá após o cumprimento integral de todas as cláusulas e condições aqui estabelecidas.' },
  propriedade: {
    id: 'propriedade', titulo: 'PROPRIEDADE INTELECTUAL E AUTORIA DAS CAMPANHAS', texto: `{{n}}.1. Todos os materiais, estruturas de anúncios, parametrizações de pixels, segmentações avançadas de públicos, testes de conversão, estratégias de tráfego pago, funis de vendas, copys, artes e documentos produzidos pela **CONTRATADA** são de autoria e propriedade intelectual exclusiva da **CONTRATADA** (Lei nº 9.610/1998 e Lei nº 9.279/1996).

{{n}}.2. A **CONTRATANTE** recebe, única e exclusivamente durante a vigência deste contrato, uma licença temporária e não exclusiva de fruição dos resultados comerciais decorrentes das campanhas veiculadas.

{{n}}.3. Fica expressamente vedada à **CONTRATANTE** a apropriação indevida, reprodução, espelhamento ou repasse de quaisquer estratégias, públicos, copys e inteligências desenvolvidas pela **CONTRATADA** a terceiros ou outros prestadores.` },
  exclusao: { id: 'exclusao', titulo: 'TÉRMINO E EXCLUSÃO DE MATERIAIS', texto: 'Após o término deste contrato, a **CONTRATANTE** terá o prazo de {{prazoMateriais}} dias corridos para solicitar e receber quaisquer materiais finais produzidos pela **CONTRATADA** durante a vigência contratual. Decorrido este período, a **CONTRATADA** estará autorizada a excluir permanentemente tais materiais de seus servidores ou meios de armazenamento, sem qualquer ônus ou responsabilidade.' },
  rescisao: {
    id: 'rescisao', titulo: 'RESCISÃO', texto: `{{n}}.1. O presente contrato poderá ser rescindido antecipadamente por qualquer uma das Partes, mediante notificação por escrito à outra Parte, com antecedência mínima de {{avisoPrevio}} dias corridos.

{{n}}.2. Em caso de rescisão antecipada por iniciativa da **CONTRATANTE** após o período sem fidelidade previsto na Cláusula {{ref:prazo}}, esta deverá pagar à **CONTRATADA**, a título de multa compensatória, o valor correspondente a {{multaPct}} do valor total das mensalidades restantes até o término do prazo contratual estipulado na Cláusula {{ref:prazo}}.

{{n}}.3. Em caso de rescisão antecipada por iniciativa da **CONTRATADA**, esta deverá restituir à **CONTRATANTE**, no prazo de 30 (trinta) dias corridos, o valor proporcional dos serviços não prestados, referente ao período entre a data da rescisão e o término do prazo contratual, se houver pagamento antecipado.

{{n}}.4. A rescisão deste contrato por justa causa, nos termos da legislação aplicável, isenta a Parte inocente do pagamento de qualquer multa ou indenização.` },
  campanhas: {
    id: 'campanhas', titulo: 'DA GESTÃO DA CONTA DE ANÚNCIOS, DADOS E MULTA PENAL', cond: 'mensal', texto: `{{n}}.1. **Inteligência e Vedação à Exclusão de Dados:** Toda a inteligência criada nas contas de anúncios gerenciadas (Meta Ads, Google Ads, TikTok Ads, etc.) é de autoria e metodologia da **CONTRATADA**. Fica expressamente vedado à **CONTRATANTE** excluir, apagar ou descaracterizar quaisquer dados, públicos, parametrizações analíticas ou campanhas criadas pela **CONTRATADA**.

{{n}}.2. **Vedação à Remoção de Acessos e Multa Penal de 30%:** É terminantemente proibido à **CONTRATANTE** revogar, alterar credenciais, bloquear ou remover o acesso da **CONTRATADA** aos Gerenciadores de Negócios e contas de anúncios durante a vigência deste instrumento ou antes do término formal com aviso prévio e quitação integral.
Caso a **CONTRATANTE** remova a **CONTRATADA** das contas de anúncios sem autorização prévia por escrito, incorrerá automaticamente no vencimento antecipado de todas as parcelas vincendas até o término do contrato, acrescidas de **MULTA PENAL COMPENSATÓRIA IRREDUTÍVEL DE 30% (TRINTA POR CENTO) SOBRE O VALOR TOTAL GLOBAL DO CONTRATO**{{multaContaAnunciosTxt}}, sem prejuízo da cobrança de perdas e danos e lucros cessantes.

{{n}}.3. Em caso de término regular deste contrato, todas as campanhas de tráfego pago ativas e sob gestão da **CONTRATADA** serão desativadas por esta, sendo vedada sua reativação ou cópia pela **CONTRATANTE** sem expressa autorização.` },
  imagem: {
    id: 'imagem', titulo: 'USO DE IMAGEM, VOZ E MARCA', texto: `{{n}}.1. A **CONTRATANTE** autoriza expressamente a **CONTRATADA**, em caráter gratuito e não exclusivo durante o período de prestação dos serviços, a utilizar sua marca comercial, logotipo, imagens, vídeos, fotografias, voz e depoimentos de seus porta-vozes e representantes exclusivamente para a criação, veiculação e impulsionamento dos anúncios e peças publicitárias contratadas (Art. 20 do Código Civil).

{{n}}.2. A **CONTRATADA** fica autorizada a divulgar métricas de desempenho, cases de sucesso e resultados de crescimento obtidos (preservando dados estratégicos restritos e sigilosos) em seu portfólio institucional, redes sociais e apresentações comerciais.` },
  aditivos: {
    id: 'aditivos', titulo: 'ALTERAÇÕES, ADITIVOS E NOVOS SERVIÇOS', texto: `{{n}}.1. Qualquer alteração contratual que envolva ampliação de escopo, inclusão de novas plataformas de tráfego, acréscimo de verbas administradas, serviços extras de criação ou prorrogação de prazos deverá ser formalizada mediante **Termo Aditivo Contratual** devidamente assinado pelas Partes.` },
  autonomiaMei: {
    id: 'autonomiaMei', titulo: 'DA AUTONOMIA E INEXISTÊNCIA DE VÍNCULO EMPREGATÍCIO', texto: `{{n}}.1. As Partes declaram e reconhecem expressamente que o presente contrato possui natureza mercantil e civil entre pessoas jurídicas (B2B), nos termos da Lei nº 13.467/2017 e arts. 593 e seguintes do Código Civil, inexistindo qualquer vínculo de emprego (CLT, art. 3º).

{{n}}.2. O **CONTRATADO** atuará com **plena autonomia técnica, operacional e de horários**, sem subordinação jurídica ou hierárquica, inexistindo qualquer controle ou fiscalização de jornada de trabalho ou obrigatoriedade de cumprimento de carga horária diária fixa, pautando-se exclusivamente pelo cumprimento dos prazos e qualidade das entregas acordadas.

{{n}}.3. O **CONTRATADO** declara expressamente que exerce atividade econômica própria e independente, sendo livre para prestar serviços concomitantes a outros clientes e empresas do mercado, não havendo qualquer cláusula de exclusividade.

{{n}}.4. São de exclusiva responsabilidade do **CONTRATADO** todas as obrigações tributárias (incluindo o recolhimento tempestivo do DAS-MEI), previdenciárias e fiscais decorrentes de sua atividade.` },
  naoConcorrencia: {
    id: 'naoConcorrencia', titulo: 'NÃO CONCORRÊNCIA E NÃO ALICIAMENTO', texto: `{{n}}.1. O **CONTRATADO** compromete-se a não prestar serviços diretos ou indiretos a quaisquer clientes ativos da **CONTRATADA** com os quais tenha tido contato durante a prestação dos serviços, durante a vigência deste contrato e pelo prazo de 12 (doze) meses subsequentes à sua rescisão.

{{n}}.2. O **CONTRATADO** obriga-se a não repassar metodologias proprietárias, fluxos de automação, bases de prompts e estratégias internas da **CONTRATADA** a agências concorrentes diretas no mesmo setor de atuação.

{{n}}.3. O descumprimento injustificado de quaisquer das obrigações desta cláusula sujeitará o **CONTRATADO** ao pagamento de multa penal não compensatória de R$ 30.000,00 (trinta mil reais), sem prejuízo da apuração de perdas e danos por concorrência desleal (Lei nº 9.279/1996, art. 195).` },
  sublocacaoCoworking: {
    id: 'sublocacaoCoworking', titulo: 'DA CESSÃO DE ESPAÇO E COMODATO DE FERRAMENTAS DE IA', texto: `{{n}}.1. A **CONTRATADA** disponibiliza ao **CONTRATADO**, em regime de ambiente compartilhado (coworking interno) e comodato tecnológico civil (arts. 565 e 579 do Código Civil), estação de trabalho física, conectividade de internet e acesso corporativo a ferramentas computacionais e plataformas de Inteligência Artificial (Claude AI, OpenAI ChatGPT, Midjourney e softwares de automação).

{{n}}.2. A disponibilização do espaço e das ferramentas tecnológicas constitui mera facilidade de infraestrutura civil para viabilizar a prestação dos serviços autônomos, não configurando, sob nenhuma hipótese, fornecimento de instrumentos de trabalho subordinados com fins de controle patronal. O uso do espaço é estritamente facultativo, podendo o **CONTRATADO** executar suas atividades remotamente ou utilizar a infraestrutura inclusive para demandas de terceiros.

{{n}}.3. Fica expressamente vedada a extração, cópia ou vazamento de prompts proprietários, bases de conhecimento e inteligências desenvolvidas no ambiente corporativo da **CONTRATADA**.` },
  aditivoObjeto: {
    id: 'aditivoObjeto', titulo: 'DO OBJETO DO TERMO ADITIVO', texto: `{{n}}.1. O presente Termo Aditivo tem por objeto formalizar as alterações acordadas entre as Partes com relação ao escopo, canais de veiculação, valores ou prazos originalmente estipulados no contrato principal.

{{n}}.2. Ficam expressamente ratificadas e mantidas em pleno vigor todas as demais cláusulas e condições do contrato principal que não tenham sido expressamente alteradas por este instrumento.` },
  disputas: { id: 'disputas', titulo: 'RESOLUÇÃO DE DISPUTAS', texto: 'Quaisquer litígios, controvérsias ou reclamações decorrentes ou relacionadas ao presente contrato serão submetidas, inicialmente, à mediação, buscando uma solução amigável entre as Partes. Caso a mediação não logre êxito em solucionar a disputa, as Partes concordam em submeter a questão à arbitragem, a ser conduzida de acordo com as normas da Lei nº 9.307/96 e suas alterações. O local da arbitragem será a Comarca de {{foroCidade}}, {{foroEstado}}.' },
  foro: { id: 'foro', titulo: 'FORO', texto: 'Fica eleito o foro da Comarca de {{foroCidade}}, Estado de {{foroEstado}}, como o competente para dirimir quaisquer dúvidas ou litígios oriundos do presente contrato, renunciando as Partes a qualquer outro, por mais privilegiado que seja ou venha a ser.' },
  limitacao: { id: 'limitacao', titulo: 'LIMITAÇÃO DE RESPONSABILIDADE', texto: 'A **CONTRATADA** não será responsável por quaisquer danos indiretos, incidentais, especiais ou consequenciais decorrentes de falhas ou atrasos no fornecimento dos serviços, ou por danos causados por terceiros, incluindo, mas não se limitando a interrupções, suspensões ou alterações no funcionamento de plataformas de redes sociais ou ferramentas de marketing utilizadas na prestação dos serviços.' },
  confidencialidade: { id: 'confidencialidade', titulo: 'CONFIDENCIALIDADE', texto: 'As Partes concordam em manter em sigilo e confidencialidade todas as informações confidenciais e proprietárias, incluindo, mas não se limitando a dados de clientes, estratégias de marketing, informações financeiras e outros detalhes compartilhados durante a prestação dos serviços. Esta obrigação de confidencialidade permanecerá em vigor mesmo após o término deste contrato, por um período de {{confidencialidadeAnos}} anos.' },
  forca: { id: 'forca', titulo: 'CASO FORTUITO E FORÇA MAIOR', texto: 'A **CONTRATADA** não será responsabilizada por atrasos ou interrupções na prestação dos serviços causados por eventos fora de seu controle razoável, tais como, mas não se limitando a catástrofes naturais, pandemias, guerras, atos governamentais, greves, distúrbios civis, falhas em infraestruturas críticas de energia ou comunicação. Adicionalmente, a **CONTRATADA** não se responsabiliza por instabilidades, interrupções ou alterações nos algoritmos, ou políticas de plataformas de terceiros, como Facebook, Instagram e WhatsApp, mesmo que tais eventos afetem a execução dos serviços contratados.' },
  independencia: { id: 'independencia', titulo: 'INDEPENDÊNCIA DAS PARTES', texto: 'As Partes declaram e reconhecem que o presente contrato não cria qualquer vínculo de emprego, agência, parceria, *joint venture* ou representação entre elas. Cada Parte é responsável por suas próprias obrigações legais, fiscais e trabalhistas.' },
  alteracoes: { id: 'alteracoes', titulo: 'ALTERAÇÕES E ADENDOS', texto: 'Qualquer alteração ou adendo ao presente contrato somente será válido se formalizado por escrito e devidamente assinado por ambos os representantes legais das Partes. A não execução por uma das Partes de qualquer cláusula ou condição deste contrato não constituirá renúncia ao direito de executar a referida cláusula, ou condição em momento futuro.' },
  integridade: { id: 'integridade', titulo: 'INTEGRIDADE DO CONTRATO', texto: 'O presente contrato constitui a totalidade do acordo entre as Partes com relação ao objeto aqui tratado e substitui quaisquer acordos ou entendimentos prévios, sejam verbais ou escritos. Caso qualquer disposição deste contrato seja considerada inválida ou inexequível por decisão judicial, ou administrativa, as demais disposições permanecerão em pleno vigor e efeito.' },
  reajuste: {
    id: 'reajuste', titulo: 'AJUSTE DE PREÇOS', cond: 'mensal', texto: `{{n}}.1. Os valores previstos neste contrato poderão ser reajustados anualmente, a contar da data de assinatura, com base na variação positiva do Índice Geral de Preços do Mercado (IGP-M), divulgado pela Fundação Getúlio Vargas (FGV), ou outro índice que venha a substituí-lo em caso de extinção.

{{n}}.2. A **CONTRATADA** notificará a **CONTRATANTE**, por escrito, com antecedência mínima de 30 (trinta) dias corridos, sobre qualquer reajuste de preço a ser aplicado.` },
  lgpd: {
    id: 'lgpd', titulo: 'DA PROTEÇÃO DE DADOS', texto: `{{n}}.1. A **CONTRATANTE** atuará como "controlador" no sentido estrito do Regulamento Geral de Proteção de Dados da União Europeia (GDPR – Regulamento 2016/679) e da Lei Geral de Proteção de Dados Pessoais (LGPD – Lei nº 13.709/2018).

{{n}}.2. A **CONTRATADA** atuará como "processador" (nos termos da definição de "subcontratante" no sentido estrito da GDPR) e "operador" (no sentido estrito da LGPD).

{{n}}.3. **Parágrafo Primeiro** - A **CONTRATANTE** declara-se ciente e concorda que deverá adotar todas as medidas necessárias para cientificar seus parceiros (empresas terceirizadas), empregados, prestadores de serviço e contratantes acerca do tratamento de dados e dos meios de sua proteção, e que a **CONTRATADA**, em decorrência do presente Contrato, poderá ter acesso, utilizar, manter e processar, eletrônica e manualmente, informações e dados prestados pela **CONTRATANTE** e seus empregados, denominados como "Dados Protegidos", exclusivamente para os fins específicos de prestação dos serviços objeto deste contrato.

{{n}}.4. **Parágrafo Segundo** - As Partes declaram-se cientes dos direitos, obrigações e penalidades aplicáveis constantes da Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018), e obrigam-se a adotar todas as medidas razoáveis para garantir, por si, seu pessoal, empregados, prestadores de serviços, subcontratados e contratantes que utilizem os dados protegidos na forma da legislação vigente.

{{n}}.5. **Parágrafo Terceiro** - As Partes comprometem-se a dar ciência mútua e a eventuais outros prestadores de serviço sobre as medidas adotadas para o cumprimento da LGPD, garantindo que possuem todos os consentimentos e avisos necessários para permitir a transferência legal de dados pessoais de seus respectivos empregados, durante o exercício dos serviços objeto deste contrato.` },
  assinaturaEletronica: { id: 'assinaturaEletronica', titulo: 'ASSINATURA ELETRÔNICA', ativoPadrao: true, texto: 'As Partes reconhecem como válida e eficaz a assinatura deste instrumento de forma eletrônica, pela plataforma {{plataformaAssinatura}}, nos termos da Medida Provisória nº 2.200-2/2001 e da Lei nº 14.063/2020, dispensando-se a assinatura física e a presença das testemunhas, uma vez que a plataforma garante a autoria e a integridade do documento.' },
};

const PREAMBULO = `**{{contratante.nome}}**, {{contratante.qualificacao}}, doravante denominada **CONTRATANTE**,

E:

**{{contratada.nome}}**, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº {{contratada.cnpj}}, com sede na {{contratada.endereco}}, neste ato representada por {{contratada.representante}}, doravante denominada **CONTRATADA**.

As partes acima identificadas, doravante denominadas em conjunto como "Partes" e individualmente como "Parte", celebram o presente {{tituloContrato}}, que se regerá pelas cláusulas e condições seguintes:`;

const FECHO = 'E, por estarem assim justas e contratadas, as Partes assinam o presente {{tituloContrato}} em 02 (duas) vias de igual teor e forma, na presença das 02 (duas) testemunhas abaixo, para produzir seus jurídicos e legais efeitos.';

// ---------- Contrato com prestador PJ: a Fizgo é a CONTRATANTE e o prestador é a CONTRATADA ----------
// Marcadores [[...]] são preenchidos ao gerar o contrato (função, valores e multas) e viram texto editável.
const PREAMBULO_PJ = `**{{fizgo.nome}}**, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº {{fizgo.cnpj}}, com sede na {{fizgo.endereco}}, neste ato representada por {{fizgo.representante}}, doravante denominada **CONTRATANTE**,

E:

**{{prestador.nome}}**, {{prestador.qualificacao}}, doravante denominada **CONTRATADA**.

As partes acima identificadas, doravante denominadas em conjunto como "Partes" e individualmente como "Parte", celebram o presente {{tituloContrato}}, que se regerá pelas cláusulas e condições seguintes:`;

const CP = {
  objeto: { id: 'objetoPJ', titulo: 'OBJETO', texto: `{{n}}.1. O presente contrato tem por objeto a prestação, pela **CONTRATADA**, de serviços de **[[funcao]]**, de forma autônoma e com foco no resultado, em apoio aos projetos de marketing que a **CONTRATANTE** executa para a sua carteira de clientes.

{{n}}.2. As atribuições, as entregas e os respectivos prazos (SLA) constam da Cláusula {{ref:atribuicoesPJ}} e integram este contrato para todos os fins.` },
  atribuicoes: { id: 'atribuicoesPJ', titulo: 'ATRIBUIÇÕES, ENTREGAS E PRAZOS (SLA)', texto: `{{n}}.1. Constituem atribuições da **CONTRATADA**:
[[atribuicoes]]

{{n}}.2. As entregas e os prazos máximos de cada uma são os seguintes:
[[entregas]]

{{n}}.3. Os prazos são contados a partir do recebimento do briefing completo e dos materiais necessários, registrados na ferramenta de gestão de tarefas da **CONTRATANTE** (atualmente o eKyte). Demandas não registradas na ferramenta não geram obrigação de entrega nem penalidade.

{{n}}.4. A **CONTRATADA** observará os padrões técnicos de qualidade e as especificações de entrega da **CONTRATANTE**, descritos no Manual de Padrões e Processos ("Bíblia Operacional"), que lhe é disponibilizado. O Manual trata exclusivamente do resultado esperado de cada entrega, e não da forma, do local ou do horário de execução dos serviços.

{{n}}.5. Considera-se concluída a entrega que, cumulativamente: (a) atenda às especificações do briefing e aos padrões técnicos; (b) esteja registrada como concluída na ferramenta de gestão; e (c) tenha os arquivos finais salvos no repositório indicado pela **CONTRATANTE** (Google Drive), na estrutura e com a nomenclatura padronizadas.` },
  qualidade: { id: 'qualidadePJ', titulo: 'QUALIDADE, AJUSTES E RETRABALHO', texto: `{{n}}.1. A entrega que não atender às especificações do briefing ou aos padrões técnicos poderá ser devolvida pela **CONTRATANTE**, com a indicação objetiva dos pontos a corrigir, e deverá ser reapresentada corrigida pela **CONTRATADA** em até [[prazoAjuste]] horas úteis, sem custo adicional.

{{n}}.2. Ajustes decorrentes de mudança de briefing ou de nova solicitação do cliente final, feitas após a aprovação, não configuram retrabalho e serão tratados como nova demanda.

{{n}}.3. A **CONTRATADA** responde pelos erros técnicos de sua responsabilidade (como erros de ortografia, dimensões incorretas, envio de arquivo errado, falhas de áudio ou de legenda), devendo corrigi-los com prioridade, sem prejuízo das penalidades da Cláusula {{ref:penalidadesPJ}}.` },
  penalidades: { id: 'penalidadesPJ', titulo: 'PENALIDADES POR ATRASO, NÃO ENTREGA E ERRO GRAVE', texto: `{{n}}.1. **Atraso:** o descumprimento de qualquer prazo da Cláusula {{ref:atribuicoesPJ}} sujeitará a **CONTRATADA** à multa moratória de [[multaAtraso]] [[base]] por dia útil de atraso, para cada entrega atrasada.

{{n}}.2. **Não entrega:** considera-se não realizada a entrega que não for apresentada em até [[diasNaoEntrega]] dias úteis após o prazo, ou que, devolvida para correção, não for reapresentada nos termos da Cláusula {{ref:qualidadePJ}}. Nesse caso, além da multa moratória acumulada, incidirá multa compensatória de [[multaNaoEntrega]] [[base]] por entrega não realizada, e a **CONTRATANTE** poderá contratar terceiro para executá-la, abatendo o custo correspondente da remuneração da **CONTRATADA**.

{{n}}.3. **Erro grave:** o envio ao cliente, a publicação ou a disponibilização de material com erro de responsabilidade da **CONTRATADA** que cause dano à imagem do cliente ou da **CONTRATANTE**, ou que descumpra norma ética de conselho profissional (CFM, CRO, OAB, CFP, entre outros) indicada no briefing ou na ficha do cliente, sujeitará a **CONTRATADA** à multa de [[multaErroGrave]] [[base]] por ocorrência, sem prejuízo da reparação dos danos.

{{n}}.4. **Limite:** a soma das multas desta cláusula fica limitada a [[tetoMultas]] [[base]] em cada mês, e o excedente não se acumula para os meses seguintes. Atingido esse limite em 2 (dois) meses, consecutivos ou não, dentro de um período de 6 (seis) meses, a **CONTRATANTE** poderá rescindir este contrato por justa causa, nos termos da Cláusula {{ref:rescisaoPJ}}.

{{n}}.5. **Procedimento:** a **CONTRATANTE** comunicará a ocorrência por escrito (e-mail ou WhatsApp), com a descrição do fato e o valor apurado, e a **CONTRATADA** terá [[prazoDefesa]] horas para apresentar sua justificativa. Não acolhida a justificativa, o valor será compensado na remuneração seguinte, nos termos do art. 368 do Código Civil, e constará do demonstrativo de pagamento.

{{n}}.6. **Excludentes:** não se aplicam as penalidades quando o atraso ou a falha decorrer de: (a) briefing incompleto, ou materiais, acessos ou aprovações não fornecidos pela **CONTRATANTE** ou pelo cliente final; (b) falha comprovada de plataformas de terceiros (Meta, Google, eKyte, entre outras); (c) caso fortuito ou força maior (art. 393 do Código Civil); ou (d) prorrogação de prazo autorizada previamente e por escrito pela **CONTRATANTE**.

{{n}}.7. As multas desta cláusula não excluem a indenização pelos prejuízos que excederem o seu valor, desde que comprovados, conforme autoriza o parágrafo único do art. 416 do Código Civil.` },
  remuneracao: { id: 'remuneracaoPJ', titulo: 'REMUNERAÇÃO, NOTA FISCAL E PAGAMENTO', texto: `{{n}}.1. Pela execução das entregas previstas neste contrato, a **CONTRATANTE** pagará à **CONTRATADA** [[remuneracao]]. Demandas fora do escopo só serão executadas mediante aprovação prévia e por escrito da **CONTRATANTE** e serão remuneradas conforme o valor acordado para cada uma.

{{n}}.2. A **CONTRATADA** emitirá a Nota Fiscal de serviços até o dia [[diaNF]] de cada mês, referente aos serviços do mês anterior, e a enviará ao e-mail financeiro da **CONTRATANTE**. O pagamento será feito até o dia [[diaPagamento]], via Pix ou transferência para conta de titularidade da **CONTRATADA**[[pix]].

{{n}}.3. A Nota Fiscal emitida após o dia [[diaNF]] será paga até o dia [[diaPagamentoAtraso]] do mesmo mês, sem qualquer acréscimo. Nenhum pagamento será feito sem a respectiva Nota Fiscal.

{{n}}.4. Do valor devido serão abatidos as multas apuradas na forma da Cláusula {{ref:penalidadesPJ}} e o valor proporcional das entregas não realizadas, discriminados em demonstrativo enviado junto com o pagamento.

{{n}}.5. A remuneração poderá ser revista anualmente, de comum acordo entre as Partes, mediante termo aditivo.` },
  autonomia: { id: 'autonomiaPJ', titulo: 'AUTONOMIA E INEXISTÊNCIA DE VÍNCULO EMPREGATÍCIO', texto: `{{n}}.1. Este contrato tem natureza civil e é celebrado entre pessoas jurídicas, nos termos dos arts. 593 a 609 do Código Civil, não gerando vínculo empregatício entre a **CONTRATANTE** e a **CONTRATADA**, seus sócios, empregados ou prepostos.

{{n}}.2. A **CONTRATADA** executa os serviços com autonomia técnica e organizacional, definindo livremente a forma, o local e os horários de trabalho, sem controle de jornada, desde que respeitados os prazos e os padrões de entrega deste contrato. Reuniões de alinhamento, planejamentos e captações serão agendados em comum acordo.

{{n}}.3. A **CONTRATADA** poderá executar os serviços por meio de seus sócios, empregados ou prepostos qualificados, mediante prévia comunicação à **CONTRATANTE**, permanecendo integralmente responsável pela qualidade, pelos prazos e pela confidencialidade.

{{n}}.4. A **CONTRATADA** é livre para prestar serviços a outras empresas, observadas as restrições da Cláusula {{ref:naoAliciamentoPJ}}.

{{n}}.5. A **CONTRATADA** utiliza seus próprios equipamentos e meios de trabalho. Equipamentos eventualmente cedidos pela **CONTRATANTE** (como lapelas, iluminação e tripés) serão objeto de comodato (arts. 579 a 585 do Código Civil) e deverão ser devolvidos no estado em que foram recebidos, respondendo a **CONTRATADA** por danos decorrentes de mau uso, perda ou extravio.

{{n}}.6. São de responsabilidade exclusiva da **CONTRATADA** os tributos, as contribuições previdenciárias e os encargos de sua atividade, bem como as obrigações relativas a seus empregados e prepostos, ficando a **CONTRATANTE** autorizada a fazer as retenções exigidas por lei.

{{n}}.7. Caso a **CONTRATANTE** seja demandada, judicial ou administrativamente, por obrigação de responsabilidade da **CONTRATADA**, esta a ressarcirá de todos os valores despendidos, inclusive custas e honorários advocatícios.` },
  sistemas: { id: 'sistemasPJ', titulo: 'SISTEMAS, ACESSOS E SEGURANÇA', texto: `{{n}}.1. O acesso às ferramentas e aos sistemas da **CONTRATANTE** e de seus clientes (eKyte, Google Drive, Business Manager, contas de anúncios e perfis em redes sociais) é concedido apenas para viabilizar as entregas, é pessoal e intransferível e pode ser revogado a qualquer tempo.

{{n}}.2. É vedado à **CONTRATADA**: (a) solicitar ou utilizar senhas de contas de anúncios de clientes, cujo acesso deve ocorrer sempre por convite via Business Manager; (b) alterar, remover ou transferir acessos, administradores, públicos, campanhas ou dados das contas sem autorização por escrito; (c) armazenar arquivos ou dados de clientes fora dos sistemas indicados pela **CONTRATANTE**; e (d) usar os acessos para finalidade diversa deste contrato.

{{n}}.3. O registro das tarefas e entregas na ferramenta de gestão e os arquivos salvos no repositório indicado constituem a prova das entregas para todos os fins deste contrato.` },
  propriedade: { id: 'propriedadePJ', titulo: 'PROPRIEDADE INTELECTUAL E CESSÃO DE DIREITOS', texto: `{{n}}.1. A **CONTRATADA** cede à **CONTRATANTE**, em caráter total, definitivo, irrevogável e exclusivo, todos os direitos patrimoniais de autor sobre os materiais produzidos em razão deste contrato (artes, vídeos, fotografias, copys, roteiros, arquivos editáveis, brutos, campanhas, públicos, relatórios e prompts), nos termos dos arts. 49 e 50 da Lei nº 9.610/1998, para qualquer modalidade de utilização prevista no art. 29 da mesma lei, inclusive pelos clientes da **CONTRATANTE**, sem limite de território ou de tempo.

{{n}}.2. A cessão está incluída na remuneração prevista na Cláusula {{ref:remuneracaoPJ}}, nada mais sendo devido a esse título.

{{n}}.3. A **CONTRATADA** garante que os materiais são originais ou utilizam apenas elementos devidamente licenciados (trilhas, imagens, fontes e vídeos de banco), e responde por qualquer violação de direitos de terceiros.

{{n}}.4. A **CONTRATADA** somente poderá exibir os materiais em seu portfólio com autorização prévia da **CONTRATANTE**, após a publicação pelo cliente e sem dados estratégicos ou sigilosos.` },
  confidencialidade: { id: 'confidencialidadePJ', titulo: 'CONFIDENCIALIDADE E PROTEÇÃO DE DADOS (LGPD)', texto: `{{n}}.1. A **CONTRATADA** manterá em sigilo todas as informações a que tiver acesso em razão deste contrato, incluindo dados de clientes, estratégias, resultados, preços, processos internos, metodologias, prompts e o Manual de Padrões e Processos, durante a vigência e por [[anosSigilo]] anos após o seu término.

{{n}}.2. No tratamento de dados pessoais, a **CONTRATADA** atuará como operadora, nos termos da Lei nº 13.709/2018 (LGPD), tratando-os apenas para executar as entregas, conforme as instruções da **CONTRATANTE**, com medidas de segurança adequadas, e comunicará qualquer incidente de segurança em até 24 (vinte e quatro) horas após tomar conhecimento.

{{n}}.3. A violação desta cláusula sujeitará a **CONTRATADA** à multa de [[multaSigilo]] por ocorrência, sem prejuízo da indenização pelos danos que excederem esse valor e da rescisão por justa causa.` },
  naoAliciamento: { id: 'naoAliciamentoPJ', titulo: 'NÃO ALICIAMENTO DE CLIENTES E DE PROFISSIONAIS', texto: `{{n}}.1. Durante a vigência deste contrato e por 12 (doze) meses após o seu término, a **CONTRATADA** não prestará serviços de marketing, diretamente ou por meio de terceiros, a clientes da **CONTRATANTE** que tenha atendido nos 12 (doze) meses anteriores ao término, nem os incentivará a encerrar ou reduzir o contrato com a **CONTRATANTE**.

{{n}}.2. No mesmo período, a **CONTRATADA** não aliciará profissionais, colaboradores ou prestadores da **CONTRATANTE** para trabalhar consigo ou com concorrentes.

{{n}}.3. O descumprimento desta cláusula sujeitará a **CONTRATADA** à multa de [[multaAliciamento]] por cliente ou profissional aliciado, sem prejuízo da indenização pelos danos que excederem esse valor.` },
  rescisao: { id: 'rescisaoPJ', titulo: 'PRAZO E RESCISÃO', texto: `{{n}}.1. Este contrato vigora por prazo indeterminado, a partir de {{dataInicio}}.

{{n}}.2. Qualquer das Partes poderá rescindi-lo sem motivo, mediante aviso prévio por escrito de [[avisoPrevio]] dias, durante os quais as entregas seguem normalmente e são remuneradas. A Parte que não cumprir o aviso prévio pagará à outra multa equivalente à remuneração proporcional aos dias de aviso não cumpridos.

{{n}}.3. O contrato poderá ser rescindido de imediato, por justa causa, sem aviso prévio e sem multa para a Parte inocente, nos casos de: (a) violação das Cláusulas {{ref:confidencialidadePJ}} ou {{ref:naoAliciamentoPJ}}; (b) atingimento do limite de multas previsto na Cláusula {{ref:penalidadesPJ}}; (c) abandono das entregas por mais de 5 (cinco) dias úteis sem justificativa; (d) conduta que cause dano à imagem da **CONTRATANTE** ou de seus clientes; ou (e) atraso no pagamento pela **CONTRATANTE** por mais de 15 (quinze) dias, após notificação.

{{n}}.4. Em qualquer caso de término, a **CONTRATADA** deverá, em até 48 (quarenta e oito) horas: (a) salvar no repositório indicado todos os arquivos finais, editáveis e brutos; (b) concluir ou repassar as tarefas em andamento, com o status atualizado na ferramenta de gestão; (c) devolver equipamentos, credenciais e acessos; e (d) excluir as cópias de dados de clientes mantidas em seus dispositivos. A remuneração final, proporcional às entregas realizadas, será paga após o cumprimento dessas obrigações.` },
};

const projetoPagamento = {
  id: 'pagamento', titulo: 'VALOR E CONDIÇÕES DE PAGAMENTO', texto: `{{n}}.1. Pelos serviços descritos na Cláusula {{ref:servicos}}, a **CONTRATANTE** pagará à **CONTRATADA** o valor total de {{unicoTotalTxt}}.

{{n}}.2. O pagamento será realizado da seguinte forma: {{entradaMaterialPct}} de entrada, no valor de {{unicoEntrada}}, na assinatura deste contrato, e o saldo de {{unicoSaldo}} na entrega dos materiais.{{dadosPix}}

{{n}}.3. O valor de entrada não será restituído caso a **CONTRATANTE** desista do serviço após o início da produção.` };
const projetoPrazo = { id: 'prazo', titulo: 'PRAZO DE EXECUÇÃO', texto: 'Os serviços serão executados no prazo de {{prazoEntrega}}, contados a partir de {{dataInicio}} e do recebimento das informações e materiais necessários para a produção. Estão incluídas até {{rodadasAjuste}} rodadas de ajustes por peça; ajustes adicionais ou mudanças de escopo serão orçados à parte.' };
const projetoPropriedade = { id: 'propriedade', titulo: 'PROPRIEDADE INTELECTUAL', texto: `{{n}}.1. Após a quitação integral dos valores previstos neste contrato, a **CONTRATADA** cede à **CONTRATANTE** os direitos patrimoniais de uso dos materiais finais aprovados, para as finalidades a que se destinam.

{{n}}.2. Arquivos abertos/editáveis, estudos e alternativas não aprovadas permanecem de propriedade da **CONTRATADA**, salvo contratação específica.

{{n}}.3. A **CONTRATADA** poderá exibir os materiais produzidos em seu portfólio, salvo solicitação expressa em contrário.` };
const projetoRescisao = { id: 'rescisao', titulo: 'RESCISÃO', texto: `{{n}}.1. O presente contrato poderá ser rescindido por qualquer das Partes mediante notificação por escrito.

{{n}}.2. Em caso de rescisão por iniciativa da **CONTRATANTE** após o início da produção, o valor de entrada não será devolvido, e serão devidos os valores proporcionais às entregas já realizadas.

{{n}}.3. A rescisão deste contrato por justa causa, nos termos da legislação aplicável, isenta a Parte inocente do pagamento de qualquer multa ou indenização.` };

const mk = (c) => ({ ...c, ativo: c.ativoPadrao !== false });

export const DEFAULT_MODELOS = [
  {
    id: 'recorrente',
    categoria: 'cliente',
    nome: 'Marketing recorrente completo (Lake / Lake Plus)',
    tituloContrato: 'Contrato de Prestação de Serviços de Marketing & Tráfego Pago',
    tipoServico: 'marketing digital, produção de conteúdo e gestão de tráfego',
    preambulo: PREAMBULO,
    fecho: FECHO,
    clausulas: [C.objeto, C.servicos, C.prazo, C.kickoff, C.pagamento, C.pontualidade, C.avulsos, C.quitacao, C.propriedade, C.imagem, C.exclusao, C.rescisao, C.campanhas, C.aditivos, C.disputas, C.foro, C.limitacao, C.confidencialidade, C.forca, C.independencia, C.alteracoes, C.integridade, C.reajuste, C.lgpd, C.assinaturaEletronica].map(mk),
  },
  {
    id: 'contrato_trafego',
    categoria: 'cliente',
    nome: 'Gestão de Tráfego Pago & Performance (Meta, Google ou TikTok Ads)',
    tituloContrato: 'Contrato de Gestão de Tráfego Pago & Otimização de Performance',
    tipoServico: 'gestão estratégica de tráfego pago, análise de dados e otimização de conversões',
    preambulo: PREAMBULO,
    fecho: FECHO,
    clausulas: [C.objeto, C.servicos, C.prazo, C.kickoff, C.pagamento, C.pontualidade, C.quitacao, C.propriedade, C.imagem, C.exclusao, C.rescisao, C.campanhas, C.aditivos, C.disputas, C.foro, C.limitacao, C.confidencialidade, C.forca, C.independencia, C.alteracoes, C.integridade, C.reajuste, C.lgpd, C.assinaturaEletronica].map(mk),
  },
  {
    id: 'contrato_growth_v4',
    categoria: 'cliente',
    nome: 'Assessoria de Vendas & Growth (Nacional / Remoto)',
    tituloContrato: 'Contrato de Assessoria Estratégica de Vendas & Growth Marketing',
    tipoServico: 'assessoria estratégica de vendas, growth marketing e tráfego multicanal',
    preambulo: PREAMBULO,
    fecho: FECHO,
    clausulas: [C.objeto, C.servicos, C.prazo, C.kickoff, C.pagamento, C.pontualidade, C.quitacao, C.propriedade, C.imagem, C.exclusao, C.rescisao, C.campanhas, C.aditivos, C.disputas, C.foro, C.limitacao, C.confidencialidade, C.forca, C.independencia, C.alteracoes, C.integridade, C.reajuste, C.lgpd, C.assinaturaEletronica].map(mk),
  },
  {
    id: 'contrato_audiovisual',
    categoria: 'cliente',
    nome: 'Produção Audiovisual & Captação Presencial (Três Lagoas)',
    tituloContrato: 'Contrato de Produção Audiovisual & Captação Presencial de Vídeo',
    tipoServico: 'produção audiovisual, captação presencial de vídeo e fotos e edição de Reels',
    preambulo: PREAMBULO,
    fecho: FECHO,
    clausulas: [C.objeto, C.servicos, C.prazo, C.kickoff, C.pagamento, C.pontualidade, C.avulsos, C.quitacao, C.propriedade, C.imagem, C.exclusao, C.rescisao, C.aditivos, C.disputas, C.foro, C.limitacao, C.confidencialidade, C.forca, C.independencia, C.alteracoes, C.integridade, C.reajuste, C.lgpd, C.assinaturaEletronica].map(mk),
  },
  {
    id: 'contrato_design_full',
    categoria: 'cliente',
    nome: 'Design Gráfico Contínuo Sem Limite de Artes',
    tituloContrato: 'Contrato de Criação Visual & Design Gráfico Full',
    tipoServico: 'design gráfico contínuo, criação visual e peças publicitárias',
    preambulo: PREAMBULO,
    fecho: FECHO,
    clausulas: [C.objeto, C.servicos, C.prazo, C.kickoff, C.pagamento, C.pontualidade, C.quitacao, C.propriedade, C.imagem, C.exclusao, C.rescisao, C.aditivos, C.disputas, C.foro, C.limitacao, C.confidencialidade, C.forca, C.independencia, C.alteracoes, C.integridade, C.reajuste, C.lgpd, C.assinaturaEletronica].map(mk),
  },
  {
    id: 'projeto',
    categoria: 'cliente',
    nome: 'Projeto pontual (material visual, landing page, etc.)',
    tituloContrato: 'Contrato de Prestação de Serviços de Criação & Design',
    tipoServico: 'criação e design',
    preambulo: PREAMBULO,
    fecho: FECHO,
    clausulas: [C.objeto, { ...C.servicos, texto: C.servicos.texto.split('\n{{n}}.3.')[0].replace(/\n- Responder mensagens[^\n]*/, '') }, projetoPrazo, projetoPagamento, C.quitacao, projetoPropriedade, C.imagem, projetoRescisao, C.aditivos, C.disputas, C.foro, C.limitacao, C.confidencialidade, C.forca, C.independencia, C.alteracoes, C.integridade, C.lgpd, C.assinaturaEletronica].map(mk),
  },
  {
    id: 'colaborador_mei',
    categoria: 'prestador',
    nome: 'Prestador de serviços especializado (PJ / MEI com SLAs)',
    tituloContrato: 'Contrato de Prestação de Serviços entre Pessoas Jurídicas',
    tipoServico: 'serviços especializados de marketing',
    partes: 'prestador',
    preambulo: PREAMBULO_PJ,
    fecho: FECHO,
    clausulas: [CP.objeto, CP.atribuicoes, CP.qualidade, CP.penalidades, CP.remuneracao, CP.autonomia, CP.sistemas, CP.propriedade, CP.confidencialidade, CP.naoAliciamento, CP.rescisao, C.foro, C.assinaturaEletronica].map(mk),
  },
  {
    id: 'sublocacao_ia',
    categoria: 'prestador',
    nome: 'Cessão de espaço (coworking) & comodato de IA e ferramentas',
    tituloContrato: 'Instrumento Particular de Cessão de Espaço e Comodato Tecnológico',
    tipoServico: 'cessão de espaço e infraestrutura de tecnologia',
    preambulo: PREAMBULO,
    fecho: FECHO,
    clausulas: [C.objeto, C.sublocacaoCoworking, C.confidencialidade, C.rescisao, C.disputas, C.foro, C.assinaturaEletronica].map(mk),
  },
  {
    id: 'aditivo',
    categoria: 'cliente',
    nome: 'Termo aditivo contratual',
    tituloContrato: 'Termo Aditivo ao Contrato de Prestação de Serviços',
    tipoServico: 'aditamento contratual',
    preambulo: PREAMBULO,
    fecho: FECHO,
    clausulas: [C.aditivoObjeto, C.pagamento, C.disputas, C.foro, C.assinaturaEletronica].map(mk),
  },
];

export const DEFAULT_COLABORADORES = [
  {
    id: 'colab_rodrigo',
    nome: 'Rodrigo Santana de Souza',
    razaoSocial: 'RODRIGO SANTANA TECNOLOGIA MEI',
    tipo: 'PJ',
    cpfCnpj: '28.910.456/0001-33',
    cpfResponsavel: '345.678.901-22',
    email: 'rodrigo.santana@fizgotech.com.br',
    telefone: '(67) 98111-2233',
    funcaoId: 'gt',
    cargo: 'Gestor de Tráfego Pago & Engenheiro de Prompts IA',
    especialidade: 'Meta Ads, Google Ads, Claude AI, ChatGPT e Automações',
    logradouro: 'Rua Domingos de Morais',
    numero: '1250',
    complemento: 'Sala 82',
    bairro: 'Vila Mariana',
    cidade: 'Três Lagoas',
    uf: 'MS',
    cep: '79600-010',
    remuneracao: 4800,
    periodicidade: 'Mensal',
    chavePix: 'rodrigo.santana@fizgotech.com.br',
    dataInicio: '2026-06-01',
    status: 'Ativo',
    observacoes: 'Prestador MEI autônomo. Estação 02 no coworking interno com comodato de ferramentas Claude AI e ChatGPT Plus.',
    documentos: [
      {
        id: 'doc_res_demo',
        tipoDoc: 'residencia',
        nomeOriginal: 'Comprovante_Residencia_Enersul_Rodrigo.pdf',
        tipoMime: 'application/pdf',
        tamanho: 142850,
        dataUpload: '2026-10-15',
        dados: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrCjEgMCBvYmoKPDwKL1R5cGUgL0NhdGFsb2cKL1BhZ2VzIDIgMCBSCj4+CmVuZG9iagoyIDAgb2JqCjw8Ci9UeXBlIC9QYWdlcwovS2lkcyBbMyAwIFJdCi9Db3VudCAxCj4+CmVuZG9iagozIDAgb2JqCjw8Ci9UeXBlIC9QYWdlCi9QYXJlbnQgMiAwIFIKL01lZGlhQm94IFswIDAgNTk1IDg0Ml0KL0NvbnRlbnRzIDQgMCBSCj4+CmVuZG9iago0IDAgb2JqCjw8Ci9MZW5ndGggNTUKPj4Kc3RyZWFtCkJUCi9GMSAyNCBUZgoxMDAgNzAwIFREClsoQ29tcHJvdmFudGUgZGUgUmVzaWRlbmNpYSkdIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDUKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDE4IDAwMDAwIG4gCjAwMDAwMDAwNjggMDAwMDAgbiAowMDAwMDAwMTI1IDAwMDAwIG4gCjAwMDAwMDAyMTUgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA1Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgoyOTgKJSVFT0YK'
      },
      {
        id: 'doc_cnh_demo',
        tipoDoc: 'identidade',
        nomeOriginal: 'CNH_Digital_Rodrigo_Santana.pdf',
        tipoMime: 'application/pdf',
        tamanho: 215400,
        dataUpload: '2026-10-15',
        dados: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrCjEgMCBvYmoKPDwKL1R5cGUgL0NhdGFsb2cKL1BhZ2VzIDIgMCBSCj4+CmVuZG9iagoyIDAgb2JqCjw8Ci9UeXBlIC9QYWdlcwovS2lkcyBbMyAwIFJdCi9Db3VudCAxCj4+CmVuZG9iagozIDAgb2JqCjw8Ci9UeXBlIC9QYWdlCi9QYXJlbnQgMiAwIFIKL01lZGlhQm94IFswIDAgNTk1IDg0Ml0KL0NvbnRlbnRzIDQgMCBSCj4+CmVuZG9iago0IDAgb2JqCjw8Ci9MZW5ndGggNTUKPj4Kc3RyZWFtCkJUCi9GMSAyNCBUZgoxMDAgNzAwIFREClsoQ05IIERpZ2l0YWwpXSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCA1CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxOCAwMDAwMCBuIAowMDAwMDAwMDY4IDAwMDAwIG4gCjAwMDAwMDAxMjUgMDAwMDAgbiAKMDAwMDAwMDIxNSAwMDAwMCBuIAp0cmFpbGVyCjw8Ci9TaXplIDUKL1Jvb3QgMSAwIFIKPj4Kc3RhcnR4cmVmCjI5OAolJUVPRgo='
      },
      {
        id: 'doc_cnpj_demo',
        tipoDoc: 'cnpj',
        nomeOriginal: 'Cartao_CNPJ_Receita_Federal_Rodrigo.pdf',
        tipoMime: 'application/pdf',
        tamanho: 98400,
        dataUpload: '2026-10-15',
        dados: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrCjEgMCBvYmoKPDwKL1R5cGUgL0NhdGFsb2cKL1BhZ2VzIDIgMCBSCj4+CmVuZG9iagoyIDAgb2JqCjw8Ci9UeXBlIC9QYWdlcwovS2lkcyBbMyAwIFJdCi9Db3VudCAxCj4+CmVuZG9iagozIDAgb2JqCjw8Ci9UeXBlIC9QYWdlCi9QYXJlbnQgMiAwIFIKL01lZGlhQm94IFswIDAgNTk1IDg0Ml0KL0NvbnRlbnRzIDQgMCBSCj4+CmVuZG9iago0IDAgb2JqCjw8Ci9MZW5ndGggNTUKPj4Kc3RyZWFtCkJUCi9GMSAyNCBUZgoxMDAgNzAwIFREClsoQ2FydGFvIENPUEopXSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCA1CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxOCAwMDAwMCBuIAowMDAwMDAwMDY4IDAwMDAwIG4gCjAwMDAwMDAxMjUgMDAwMDAgbiAKMDAwMDAwMDIxNSAwMDAwMCBuIAp0cmFpbGVyCjw8Ci9TaXplIDUKL1Jvb3QgMSAwIFIKPj4Kc3RhcnR4cmVmCjI5OAolJUVPRgo='
      }
    ]
  },
  {
    id: 'colab_juliana',
    nome: 'Juliana Beatriz Silveira',
    razaoSocial: 'JB SILVEIRA DESIGN & CRIATIVOS MEI',
    tipo: 'PJ',
    cpfCnpj: '41.332.998/0001-77',
    cpfResponsavel: '298.765.432-11',
    email: 'juliana.design@silveirastudio.com',
    telefone: '(67) 97654-3210',
    funcaoId: 'designer',
    cargo: 'Designer de Criativos & Copywriter',
    especialidade: 'Photoshop, Figma, Midjourney e Copy persuasiva com IA',
    logradouro: 'Av. Rosário Congro',
    numero: '420',
    complemento: 'Apto 31',
    bairro: 'Centro',
    cidade: 'Três Lagoas',
    uf: 'MS',
    cep: '79600-020',
    remuneracao: 3800,
    periodicidade: 'Mensal',
    chavePix: '41.332.998/0001-77',
    dataInicio: '2026-10-15',
    status: 'Pendente Documentos',
    observacoes: 'Aguardando envio do comprovante de residência e cartão CNPJ.',
    documentos: []
  }
];

// ---------- Funções dos prestadores (Bíblia Operacional v3.0) ----------
// Viram as atribuições e os prazos (SLA) do contrato do prestador. Só entregas e prazos: nada de
// horário ou jornada, para não caracterizar vínculo de emprego.
export const DEFAULT_FUNCOES = [
  {
    id: 'account', nome: 'Account / Sucesso do Cliente (CS)',
    atribuicoes: [
      'Conduzir o onboarding do cliente: criação do grupo de WhatsApp, mensagens padrão, envio do formulário e das perguntas estratégicas e follow-up.',
      'Enviar o planejamento mensal ao cliente, controlar o prazo de aprovação (72h) e registrar aprovações e ajustes no eKyte.',
      'Fazer a aprovação interna de toda peça (arte, vídeo e copy) antes do envio ao cliente.',
      'Agendar as postagens no eKyte, verificar o post publicado e registrar o desempenho.',
      'Moderar os comentários nas primeiras 2 horas após a publicação, conforme a ficha do cliente.',
      'Fazer a triagem dos serviços extras e alinhar prazo e custo antes de qualquer execução.',
      'Atualizar o Mapa de Saúde das contas e aplicar os protocolos de retenção.',
      'Classificar e conduzir as crises operacionais de nível 1 e acionar o responsável nos demais níveis.',
      'Disparar os CSATs conforme o calendário.',
    ],
    entregas: [
      ['Grupo do cliente criado e configurado', 'até 24h após o aceite da proposta'],
      ['Lembrete de formulário sem resposta', '48h após o envio'],
      ['Feedback do cliente processado e reenviado', 'até 24h após o retorno do cliente'],
      ['Postagem agendada no eKyte (versão final aprovada)', 'no mínimo 48h antes da publicação'],
      ['Desempenho do post registrado no eKyte', '24h após a publicação'],
      ['Classificação e primeira resposta a crise', 'até 30 minutos após a identificação'],
      ['Contato com cliente em "Atenção" / "Em risco"', 'até 48h / até 24h'],
      ['Mapa de Saúde das contas atualizado', 'mensalmente'],
    ],
  },
  {
    id: 'gt', nome: 'Gestor de Projetos e Tráfego (GT)',
    atribuicoes: [
      'Conduzir a reunião de onboarding com a análise prévia do cliente concluída.',
      'Configurar o workspace do cliente no eKyte: canais, equipe, base de conhecimento, ficha, acessos e entregas.',
      'Elaborar a ficha do cliente e o planejamento inicial, junto com a Copy.',
      'Planejar, criar, gerenciar e otimizar as campanhas de tráfego pago (Meta Ads e, quando contratado, Google Ads), com acesso sempre por convite via Business Manager.',
      'Produzir e revisar a copy dos anúncios antes de subir qualquer campanha.',
      'Fazer a revisão semanal de todas as contas e enviar o report semanal ao cliente.',
      'Validar estrategicamente o planejamento mensal de conteúdo.',
      'Preparar e conduzir a reunião de alinhamento com o cliente a cada 45 dias.',
      'Atuar nas crises de nível 2 e na precificação dos serviços extras.',
    ],
    entregas: [
      ['Workspace do cliente configurado no eKyte', 'até 48h após o onboarding'],
      ['Ficha do cliente e planejamento inicial', 'até 72h após o onboarding'],
      ['Revisão semanal das contas e report ao cliente', 'semanalmente'],
      ['Pausa do criativo com CPL 30% acima da meta e pedido de novo criativo', 'após 3 dias consecutivos acima da meta'],
      ['Material da reunião de alinhamento', '5 dias antes da reunião (ciclo de 45 dias)'],
      ['Resumo pós-reunião ao cliente', 'até 24h após a reunião'],
      ['Análise mensal dos criativos (ranking e top 3)', 'mensalmente'],
    ],
  },
  {
    id: 'copy', nome: 'Copywriter / Planejamento de Conteúdo',
    atribuicoes: [
      'Fazer a análise prévia do cliente (perfil, concorrência e mercado), com no mínimo 5 hipóteses de conteúdo, antes do onboarding.',
      'Elaborar o planejamento mensal de conteúdo de cada cliente, cobrindo o mês seguinte e a primeira semana do mês subsequente.',
      'Escrever a copy de cada peça no padrão Head + Copy + CTA, sem emojis, com indicação de funil e orientação visual para o Designer.',
      'Escrever os roteiros dos vídeos, com gancho nos 3 primeiros segundos, narrativa e CTA.',
      'Consultar a ficha do cliente antes de qualquer copy e respeitar o tom, as restrições e as normas dos conselhos profissionais (CFM, CRO, OAB, CFP).',
      'Configurar o projeto do mês no eKyte, validar o cronograma e gerar as tarefas.',
    ],
    entregas: [
      ['Análise prévia com 5 hipóteses de conteúdo', 'antes da reunião de onboarding'],
      ['Planejamento mensal completo (copys e roteiros)', 'até o 2º sábado de cada mês'],
      ['Projeto do mês configurado e tarefas geradas no eKyte', 'até o 2º sábado de cada mês'],
      ['Ajustes do planejamento pedidos pelo cliente', 'até 24h após o retorno do cliente'],
    ],
  },
  {
    id: 'designer', nome: 'Designer',
    atribuicoes: [
      'Ler o briefing completo no eKyte e consultar a ficha do cliente (paleta, tipografia, referências e elementos proibidos) antes de criar.',
      'Criar as peças conforme as especificações técnicas: dimensões por plataforma, safe zone, legibilidade no celular e texto de no máximo 20% da área nos criativos de tráfego.',
      'Aplicar o checklist de design antes de enviar para a aprovação interna.',
      'Criar os criativos de tráfego solicitados pelo GT.',
      'Salvar os arquivos finais (PNG/PDF) e editáveis (PSD/AI/Canva/Figma) no Google Drive, na estrutura e nomenclatura padrão.',
    ],
    entregas: [
      ['Lote de peças do mês', 'até 48h úteis após o briefing completo e no mínimo 48h antes da postagem'],
      ['Criativo de tráfego solicitado pelo GT', 'até 48h úteis após o briefing'],
      ['Arquivos finais e editáveis no Drive', 'na data da entrega da peça'],
    ],
  },
  {
    id: 'editor', nome: 'Editor de Vídeo',
    atribuicoes: [
      'Conferir os brutos e o roteiro antes de editar e apontar divergências antes de continuar.',
      'Fazer a decupagem completa, a correção de cor, a trilha sem direitos autorais (no máximo 20% do volume da voz) e transições predominantemente secas.',
      'Garantir o gancho visual nos 3 primeiros segundos e aplicar o template do cliente.',
      'Legendar com revisão de ortografia, dentro da safe zone, e fazer a capa no padrão do cliente.',
      'Exportar em MP4 (H.264, 1080p) e salvar o vídeo final e o projeto editável no Google Drive.',
    ],
    entregas: [
      ['Vídeo editado', 'até 72h úteis após os brutos disponíveis e no mínimo 48h antes da postagem'],
      ['Ajustes pedidos na aprovação interna', 'até 4h úteis'],
      ['MP4 final e projeto editável no Drive', 'na data da entrega do vídeo'],
    ],
  },
  {
    id: 'captador', nome: 'Captador de Vídeo e Foto',
    atribuicoes: [
      'Propor datas ao cliente e agendar as captações, registrando na Agenda Google com os e-mails indicados pela Fizgo.',
      'Enviar as confirmações ao cliente antes de cada captação.',
      'Cumprir o checklist pré-captação: roteiros aprovados, equipamentos carregados e armazenamento livre.',
      'Executar a captação no padrão técnico (vertical 9:16, resolução máxima, 60fps, lapela testada, iluminação frontal), com fotos de capa e controle de qualidade antes de encerrar.',
      'Zelar pelos equipamentos e conferi-los ao final de cada captação.',
      'Enviar o relatório da captação, postar o making-off e enviar o CSAT.',
      'Subir todas as tomadas no Google Drive, com a estrutura e a nomenclatura padrão, e acionar a edição.',
    ],
    entregas: [
      ['Proposta de datas de captação ao cliente', 'na última semana do mês anterior'],
      ['Captação agendada', 'com no mínimo 72h de antecedência'],
      ['Confirmações ao cliente', '24h, 2h e 30 minutos antes'],
      ['Brutos completos no Drive (todas as tomadas)', 'no mesmo dia da captação'],
      ['Relatório, making-off, CSAT e eKyte atualizado', 'no mesmo dia da captação'],
    ],
  },
  {
    id: 'ti', nome: 'Suporte de TI e Sistemas',
    atribuicoes: [
      'Cadastrar os clientes no eKyte e enviar os convites de acesso.',
      'Apoiar a conexão dos canais (Instagram e Facebook) e a configuração dos sistemas.',
      'Criar a estrutura de pastas de cada cliente no Google Drive e compartilhá-la com o time.',
      'Dar suporte técnico a acessos, sistemas e equipamentos.',
      'Revogar os acessos de clientes e prestadores desligados.',
    ],
    entregas: [
      ['Cliente cadastrado no eKyte e convite enviado', 'até 48h após o onboarding'],
      ['Estrutura de pastas do cliente no Drive', 'até 48h após o onboarding'],
      ['Atendimento de chamado técnico', 'até 1 dia útil'],
      ['Revogação de acessos', 'até 24h após o aviso de desligamento'],
    ],
  },
  {
    id: 'financeiro', nome: 'Financeiro',
    atribuicoes: [
      'Responder às solicitações financeiras recebidas pelo e-mail corporativo.',
      'Registrar entradas e saídas e fazer a conciliação bancária no ContaAzul.',
      'Executar o calendário financeiro: notas fiscais, ciclos de cobrança e acompanhamento dos vencimentos.',
      'Fazer as cobranças em alinhamento com o Account e escalar à diretoria os inadimplentes com mais de 20 dias.',
      'Arquivar no Google Drive os contratos assinados.',
      'Apresentar o DRE do mês à diretoria.',
    ],
    entregas: [
      ['Resposta a solicitações financeiras', 'até 2 horas úteis'],
      ['Lançamentos e conciliação no ContaAzul', 'diariamente (dias úteis)'],
      ['Ciclos de cobrança', '5º dia útil e dias 12, 18 e 25'],
      ['Contrato assinado arquivado no Drive', 'no mesmo dia da assinatura'],
      ['DRE completo à diretoria', 'no último dia útil do mês'],
    ],
  },
];
