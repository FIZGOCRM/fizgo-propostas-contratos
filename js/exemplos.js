// Exemplos baseados nas propostas e contrato reais enviados pela Fizgo, para demonstração.
import { store } from './store.js';
import { uid, today, addDays, clone } from './util.js';
import { novaProposta, opcaoDoPlano, itemDoCatalogo, gerarContrato } from './flow.js';
import { DEFAULT_ESCOPOS } from './defaults.js';

function cliente(dados) {
  const c = { id: uid('cli'), tipo: 'PJ', nome: '', nomeFantasia: '', contato: '', documento: '', email: '', whatsapp: '', instagram: '', segmento: '', cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '', representante: { nome: '', cpf: '' }, criadoEm: new Date().toISOString(), ...dados };
  store.upsert('clientes', c);
  return c;
}

export function carregarExemplos() {
  // 1) Dr. e Dra. Viola — duas opções + escopo de mentoria
  const viola = cliente({ nome: 'Clínica Viola', nomeFantasia: 'Dr. e Dra. Viola', contato: 'Dr e Dra Viola', segmento: 'Saúde', cidade: 'Três Lagoas', uf: 'MS' });
  const p1 = novaProposta(viola.id);
  const lake = opcaoDoPlano('pl_lake'); lake.recomendado = true;
  const imp = opcaoDoPlano('pl_river');
  Object.assign(p1, {
    titulo: 'Marketing digital e mentoria estratégica', status: 'Enviada', data: addDays(today(), -5), opcoes: [lake, imp],
    secoes: [{ id: uid('sec'), titulo: DEFAULT_ESCOPOS[0].titulo, texto: DEFAULT_ESCOPOS[0].texto }],
    diagnostico: { ativo: true, resumo: 'Clínica com excelente reputação no consultório, mas com presença digital tímida.', desafios: 'Postagens sem frequência\nConhecimento técnico pouco traduzido em produtos\nAgenda dependente de indicação', objetivos: 'Posicionar os doutores como autoridade\nEstruturar produtos e pacotes de atendimento\nGerar novos pacientes todo mês com tráfego pago' },
    projecao: { ativo: true, verba: 3000, cpl: 18, conversao: 12, ticket: 650, opcaoId: '' },
  });
  store.upsert('propostas', p1);

  // 2) Cristalle — Lake customizado com bônus Ficha Google
  const cris = cliente({ nome: 'Cristalle Odontologia', nomeFantasia: 'Cristalle', contato: 'Karol', segmento: 'Odontologia' });
  const p2 = novaProposta(cris.id);
  const op2 = opcaoDoPlano('pl_lake');
  op2.itens = [itemDoCatalogo('video', 4), itemDoCatalogo('arte', 4), itemDoCatalogo('copy'), itemDoCatalogo('gestao'), itemDoCatalogo('trafego3')];
  Object.assign(op2, { recomendado: true, extras: ['Tráfego somente plataforma Meta'], bonus: [{ nome: 'Ficha Google Dra Alexsandra e Dr Fernando', valor: 600 }], precoModo: 'fixo', valorTabela: 2690, desconto: { tipo: 'valor', valor: 300 } });
  Object.assign(p2, { opcoes: [op2], data: today() });
  store.upsert('propostas', p2);

  // 3) Nordeste Gás — três opções de edição
  const ng = cliente({ nome: 'Nordeste Gás', nomeFantasia: 'Nordeste Gás', contato: 'Nordeste Gás', segmento: 'Distribuição de gás' });
  const p3 = novaProposta(ng.id);
  const a = opcaoDoPlano('pl_edicao'), b = opcaoDoPlano('pl_lake'), c = opcaoDoPlano('pl_lakeplus');
  b.recomendado = true;
  Object.assign(p3, { titulo: 'Conteúdo e edições para redes sociais', opcoes: [a, b, c], status: 'Rascunho', data: addDays(today(), -4) });
  store.upsert('propostas', p3);

  // 4) Ellen Mazin — proposta aprovada + contrato assinado (igual ao contrato real)
  const ellen = cliente({
    nome: 'Ellen Mazin - Saude Integral da Mulher E C L Mazin', nomeFantasia: 'Ellen Mazin', contato: 'Ellen', documento: '33.142.862/0001-08', segmento: 'Saúde da mulher',
    logradouro: 'Rua José Augusto de Carvalho', numero: '541', complemento: 'Sala 01', bairro: 'Centro', cep: '16900-013', cidade: 'Andradina', uf: 'SP',
  });
  const p4 = novaProposta(ellen.id);
  const basic = opcaoDoPlano('pl_lake'); basic.recomendado = true;
  Object.assign(p4, { opcoes: [basic], status: 'Enviada', data: addDays(today(), -20) });
  store.upsert('propostas', p4);
  const ct = gerarContrato(p4.id, basic.id, { dataInicio: addDays(today(), -14), dataAssinatura: addDays(today(), -15) });
  Object.assign(ct, { status: 'Assinado', kickoffPago: true, assinadoEm: new Date().toISOString() });
  store.upsert('contratos', ct);

  return 4;
}
