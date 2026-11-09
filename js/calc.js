// Motor de preços: tudo que a proposta e o contrato mostram sai daqui,
// então os dois documentos sempre batem.
import { num, round2, brl, brlShort, inline } from './util.js';

export function bulletDoItem(item) {
  const qtd = Number(item.qtd) || 0;
  return String(item.bullet || item.nome || '').replace(/\{qtd\}/g, qtd);
}

export function calcOpcao(op, regras) {
  const linhas = (op.itens || []).map((i) => ({ ...i, total: round2((Number(i.qtd) || 0) * num(i.preco)) }));
  const mensais = linhas.filter((l) => l.cobranca !== 'unico');
  const unicos = linhas.filter((l) => l.cobranca === 'unico');
  const somaMensal = round2(mensais.reduce((a, l) => a + l.total, 0));
  const unicoTotal = round2(unicos.reduce((a, l) => a + l.total, 0));

  const temMensal = mensais.length > 0;
  const tabela = op.precoModo === 'fixo' ? num(op.valorTabela) : somaMensal;
  const d = op.desconto || { tipo: 'valor', valor: 0 };
  const desconto = round2(d.tipo === 'pct' ? (tabela * num(d.valor)) / 100 : num(d.valor));
  const cheia = Math.max(0, round2(tabela - desconto)); // mensalidade sem desconto de pontualidade
  const pontualidade = temMensal && op.pontualidade !== false ? num(regras.descontoPontualidade) : 0;
  const final = Math.max(0, round2(cheia - pontualidade)); // mensalidade paga em dia

  // Condição de entrada: os primeiros meses saem por um valor menor e depois vale a mensalidade cheia
  const ini = op.inicial || {};
  const inicialMeses = temMensal && ini.ativo && num(ini.valor) > 0 ? Math.max(1, Math.round(num(ini.meses) || 3)) : 0;
  const inicialCheia = inicialMeses ? round2(num(ini.valor)) : 0;
  const inicialFinal = inicialMeses ? Math.max(0, round2(inicialCheia - pontualidade)) : 0;

  // O kickoff é calculado sobre a primeira mensalidade (a de entrada, quando houver)
  const baseCheia = inicialMeses ? inicialCheia : cheia;
  const kickoffPct = baseCheia < num(regras.kickoffLimite) ? num(regras.kickoffPctAbaixo) : num(regras.kickoffPct);
  const kickoffBase = regras.kickoffBase === 'cheia' ? baseCheia : (inicialMeses ? inicialFinal : final);
  const kickoff = temMensal && op.kickoff !== false ? round2((kickoffBase * kickoffPct) / 100) : 0;

  const entradaPct = num(regras.entradaMaterialPct);
  const unicoEntrada = round2((unicoTotal * entradaPct) / 100);
  const unicoSaldo = round2(unicoTotal - unicoEntrada);

  const bonusTotal = round2((op.bonus || []).reduce((a, b) => a + num(b.valor), 0));
  const economiaMes = temMensal ? round2(tabela - final) : 0;
  const meses = num(regras.prazoMeses) || 12;
  const mesesIniciais = Math.min(inicialMeses, meses);
  const primeiroAno = round2(kickoff + inicialFinal * mesesIniciais + final * (meses - mesesIniciais) + unicoTotal);
  const investimentoInicial = round2(kickoff + unicoEntrada);
  const verba = Math.max(0, ...linhas.map((l) => num(l.verba)));

  return {
    linhas, somaMensal, unicoTotal, unicoEntrada, unicoSaldo, temMensal, temUnico: unicos.length > 0,
    tabela, desconto, cheia, pontualidade, final, kickoffPct, kickoffBase, kickoff,
    bonusTotal, economiaMes, economiaAno: round2(economiaMes * meses), primeiroAno,
    inicialMeses, inicialCheia, inicialFinal, investimentoInicial, meses, verba,
  };
}

// Lista de entregáveis (HTML inline) para proposta e contrato
export function entregaveis(op) {
  const list = (op.itens || []).filter((i) => !i.oculto).map((i) => inline(bulletDoItem(i)));
  (op.extras || []).filter((x) => String(x).trim()).forEach((x) => list.push(inline(x)));
  return list;
}

export function calcProjecao(p, mensalidade) {
  const verba = num(p.verba), cpl = num(p.cpl) || 1, conv = num(p.conversao), ticket = num(p.ticket);
  const leads = Math.round(verba / cpl);
  const clientes = Math.round((leads * conv) / 100 * 10) / 10;
  const receita = round2(clientes * ticket);
  const investimento = round2(verba + num(mensalidade));
  const roi = investimento > 0 ? round2(receita / investimento) : 0;
  return { verba, cpl, conv, ticket, leads, clientes, receita, investimento, roi };
}

// Substitui {variavel} nos avisos usando as regras comerciais
export function textoAviso(texto, regras) {
  const v = {
    ...regras,
    descontoPontualidade: brl(regras.descontoPontualidade),
    kickoffLimite: brl(regras.kickoffLimite),
    restoMaterialPct: 100 - num(regras.entradaMaterialPct),
  };
  return String(texto).replace(/\{(\w+)\}/g, (m, k) => (v[k] !== undefined ? v[k] : m));
}

export { brl, brlShort };
