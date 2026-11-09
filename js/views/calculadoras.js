// Calculadoras rápidas: kickoff & pontualidade, rescisão, reajuste IGP-M, projeção de tráfego.
import { store } from '../store.js';
import { ICON } from '../icons.js';
import { brl, pct, num, today, addMonths, diffDays, fmtDate, reaisExtenso } from '../util.js';
import { bind, field, money, numIn, inp } from '../ui.js';
import { calcProjecao } from '../calc.js';

export function render(main) {
  const r = store.state.settings.regras;
  const s = {
    k: { mensal: 1790 },
    res: { mensal: 1690, inicio: addMonths(today(), -5), saida: today() },
    rj: { valor: 1690, igpm: 4.5 },
    pj: { verba: 3000, cpl: 15, conversao: 10, ticket: 500, mensal: 1690 },
    mt: { valor: 1800 },
  };
  main.innerHTML = `
    <div class="top"><div><h1>Calculadoras</h1><p>Respostas rápidas para negociação, sem planilha.</p></div></div>
    <div class="grid g2">
      <div class="card" id="k"><div class="card-h"><h3>${ICON.zap} Kickoff & pontualidade</h3></div>
        <div class="fgrid">${field('Mensalidade integral (sem pontualidade)', money('k.mensal'), 'c12')}</div><div class="out" style="margin-top:12px"></div></div>
      <div class="card" id="res"><div class="card-h"><h3>${ICON.alert} Multa rescisória</h3></div>
        <div class="fgrid">${field('Mensalidade', money('res.mensal'), 'c12')}${field('Início do contrato', inp('res.inicio', 'type="date"'), 'c6')}${field('Data de saída', inp('res.saida', 'type="date"'), 'c6')}</div><div class="out" style="margin-top:12px"></div></div>
      <div class="card" id="rj"><div class="card-h"><h3>${ICON.refresh} Reajuste anual (IGP-M)</h3></div>
        <div class="fgrid">${field('Mensalidade atual', money('rj.valor'), 'c6')}${field('IGP-M acumulado 12 meses', numIn('rj.igpm', '%'), 'c6', 'Consulte o índice divulgado pela FGV.')}</div><div class="out" style="margin-top:12px"></div></div>
      <div class="card" id="mt"><div class="card-h"><h3>${ICON.layers} Material visual (entrada + entrega)</h3></div>
        <div class="fgrid">${field('Valor total do projeto', money('mt.valor'), 'c12')}</div><div class="out" style="margin-top:12px"></div></div>
      <div class="card" id="pj" style="grid-column:span 2"><div class="card-h"><h3>${ICON.trending} Projeção de tráfego pago</h3></div>
        <div class="fgrid">${field('Verba / mês', money('pj.verba'), 'c3')}${field('Custo por lead', money('pj.cpl'), 'c2')}${field('Conversão', numIn('pj.conversao', '%'), 'c2')}${field('Ticket médio', money('pj.ticket'), 'c2')}${field('Mensalidade Fizgo', money('pj.mensal'), 'c3')}</div><div class="out" style="margin-top:12px"></div></div>
    </div>`;

  const row = (l, v, big) => `<div class="${big ? 'big' : ''}"><span>${l}</span><b>${v}</b></div>`;
  const calc = () => {
    // Kickoff
    const m = num(s.k.mensal), final = m - num(r.descontoPontualidade);
    const kp = m < num(r.kickoffLimite) ? num(r.kickoffPctAbaixo) : num(r.kickoffPct);
    const kb = r.kickoffBase === 'cheia' ? m : final;
    main.querySelector('#k .out').innerHTML = `<div class="calc-out">${row(`Pagando até dia ${r.diaPontualidade}`, brl(final))}${row(`Após dia ${r.diaVencimento}`, brl(m))}${row(`Kickoff (${pct(kp)} de ${brl(kb)})`, brl((kb * kp) / 100), true)}${row(`1º ano (kickoff + ${r.prazoMeses} meses em dia)`, brl((kb * kp) / 100 + final * r.prazoMeses))}</div>`;
    // Rescisão
    const meses = Math.max(0, Math.floor(diffDays(s.res.inicio, s.res.saida) / 30.44));
    const fid = meses < num(r.mesesSemFidelidade);
    const restantes = Math.max(0, num(r.prazoMeses) - meses);
    const multa = fid ? 0 : (restantes * num(s.res.mensal) * num(r.multaRescisoriaPct)) / 100;
    main.querySelector('#res .out').innerHTML = `<div class="calc-out">${row('Meses cumpridos', meses)}${row('Mensalidades restantes', restantes)}${row('Aviso prévio', `${r.avisoPrevioDias} dias`)}${fid ? row('Situação', 'Dentro do período sem fidelidade') : ''}${row(`Multa (${pct(r.multaRescisoriaPct)} das restantes)`, brl(multa), true)}</div>`;
    // Reajuste
    const novo = num(s.rj.valor) * (1 + num(s.rj.igpm) / 100);
    main.querySelector('#rj .out').innerHTML = `<div class="calc-out">${row('Aumento mensal', brl(novo - num(s.rj.valor)))}${row('Nova mensalidade', brl(novo), true)}${row('Aviso ao cliente', '30 dias antes')}</div>`;
    // Material visual
    const ent = (num(s.mt.valor) * num(r.entradaMaterialPct)) / 100;
    main.querySelector('#mt .out').innerHTML = `<div class="calc-out">${row(`Entrada (${pct(r.entradaMaterialPct)})`, brl(ent), true)}${row('Na entrega', brl(num(s.mt.valor) - ent))}${row('Por extenso', reaisExtenso(s.mt.valor))}</div>`;
    // Projeção
    const p = calcProjecao(s.pj, s.pj.mensal);
    main.querySelector('#pj .out').innerHTML = `<div class="calc-out" style="grid-template-columns:repeat(5,1fr);display:grid">${row('Leads', `≈ ${p.leads}`)}${row('Clientes', `≈ ${p.clientes.toLocaleString('pt-BR')}`)}${row('Faturamento', brl(p.receita))}${row('Investimento', brl(p.investimento))}${row('Retorno', `${p.roi.toLocaleString('pt-BR')}x`, true)}</div>`;
    main.querySelectorAll('#pj .calc-out > div').forEach((d) => { d.style.flexDirection = 'column'; });
  };
  bind(main, s, calc);
  calc();
}
