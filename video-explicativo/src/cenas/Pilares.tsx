import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Fundo, Marca } from "../Fundo";
import { Icone } from "../Icone";
import { Narracao } from "../Narracao";
import { COR, FONTE, SERIFA, entrada, linhas } from "../tema";

const PILARES = [
  { n: "01", titulo: "Aquisição", sub: "Anúncios no Google, Instagram e Facebook", icone: "alvo" },
  { n: "02", titulo: "Conteúdo", sub: "Vídeos, artes e textos que geram desejo", icone: "play" },
  { n: "03", titulo: "Conversão", sub: "Conversas do WhatsApp viram clientes", icone: "chat" },
  { n: "04", titulo: "Análise", sub: "Painel de resultados e ajuste semanal", icone: "grafico" },
];

// Animação pequena dentro de cada card enquanto ele está em destaque
const Detalhe: React.FC<{ i: number; t: number }> = ({ i, t }) => {
  if (i === 0) {
    return (
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {["Google", "Instagram", "Facebook"].map((x, k) => {
          const e = Math.min(1, Math.max(0, t * 3 - k * 0.6));
          return <span key={x} style={{ padding: "8px 16px", borderRadius: 99, border: `1.5px solid ${COR.lima}`, fontSize: 22, fontWeight: 700, color: COR.lima, opacity: e, translate: `0px ${(1 - e) * 16}px` }}>{x}</span>;
        })}
      </div>
    );
  }
  if (i === 1) {
    return (
      <div style={{ display: "flex", gap: 10 }}>
        {[0, 1, 2].map((k) => {
          const e = Math.min(1, Math.max(0, t * 3 - k * 0.5));
          return <div key={k} style={{ flex: 1, height: 96, borderRadius: 12, background: k === 1 ? COR.lima : "rgba(194,255,0,0.14)", border: `1.5px solid ${COR.lima}`, opacity: e, scale: `${0.8 + e * 0.2}`, display: "grid", placeItems: "center", color: k === 1 ? COR.tinta : COR.lima }}><Icone nome="play" tamanho={34} /></div>;
        })}
      </div>
    );
  }
  if (i === 2) {
    const msgs = ["Oi! Quero saber mais 👋", "Fechado, pode agendar ✅"];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {msgs.map((m, k) => {
          const e = Math.min(1, Math.max(0, t * 2.6 - k * 0.9));
          return <div key={m} style={{ alignSelf: k ? "flex-end" : "flex-start", padding: "10px 16px", borderRadius: 16, fontSize: 22, fontWeight: 600, background: k ? COR.lima : "rgba(255,255,255,0.08)", color: k ? COR.tinta : COR.texto, opacity: e, translate: `${(1 - e) * (k ? 30 : -30)}px 0px` }}>{m}</div>;
        })}
      </div>
    );
  }
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 100 }}>
      {[0.35, 0.5, 0.45, 0.7, 0.9].map((h, k) => (
        <div key={k} style={{ flex: 1, borderRadius: 6, background: k === 4 ? COR.lima : "rgba(194,255,0,0.3)", height: `${Math.min(1, Math.max(0, t * 2.2 - k * 0.15)) * h * 100}%` }} />
      ))}
    </div>
  );
};

export const Pilares: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ls = linhas("pilares", fps);
  const titulo = entrada(frame, ls[0].inicio - 4, fps);
  // Qual pilar está sendo narrado (−1 antes do primeiro)
  const ativo = ls.slice(1).reduce((a, l, i) => (frame >= l.inicio - 6 ? i : a), -1);

  return (
    <AbsoluteFill style={{ fontFamily: FONTE, color: COR.texto }}>
      <Fundo brilho={[20 + Math.max(ativo, 0) * 20, 65]} />
      <Marca />
      <div style={{ position: "absolute", left: 160, top: 170, opacity: titulo, translate: `0px ${(1 - titulo) * 30}px` }}>
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "0.2em", color: COR.lima, textTransform: "uppercase" }}>✦ O método Fizgo</div>
        <div style={{ fontSize: 96, fontWeight: 800, letterSpacing: "-0.04em", marginTop: 12 }}>
          Quatro <span style={{ fontFamily: SERIFA, fontStyle: "italic", fontWeight: 400, color: COR.lima, fontSize: "1.12em" }}>pilares</span>
        </div>
      </div>
      <div style={{ position: "absolute", left: 160, right: 160, top: 430, display: "flex", gap: 28 }}>
        {PILARES.map((p, i) => {
          const l = ls[i + 1];
          const e = entrada(frame, ls[0].inicio + 0.3 * fps + i * 0.18 * fps, fps);
          const foco = entrada(frame, l.inicio - 6, fps, 0.5) - (ativo > i ? entrada(frame, ls[i + 2]?.inicio - 6 || 99999, fps, 0.5) : 0);
          const t = interpolate(frame, [l.inicio, l.inicio + 2.4 * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const apagado = ativo >= 0 && ativo !== i;
          return (
            <div
              key={p.n}
              style={{
                flex: 1,
                height: 470,
                padding: 34,
                borderRadius: 28,
                background: COR.card,
                border: `2px solid ${foco > 0.5 ? COR.lima : COR.linha}`,
                boxShadow: foco > 0.5 ? `0 0 60px rgba(194,255,0,${0.25 * foco})` : "none",
                display: "flex",
                flexDirection: "column",
                gap: 18,
                opacity: e * (apagado ? 0.45 : 1),
                translate: `0px ${(1 - e) * 60 - foco * 24}px`,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ width: 76, height: 76, borderRadius: 20, display: "grid", placeItems: "center", background: foco > 0.5 ? COR.lima : "rgba(194,255,0,0.1)", color: foco > 0.5 ? COR.tinta : COR.lima }}>
                  <Icone nome={p.icone} tamanho={40} />
                </div>
                <span style={{ fontSize: 30, fontWeight: 800, color: COR.mudo }}>{p.n}</span>
              </div>
              <div style={{ fontSize: 48, fontWeight: 800, letterSpacing: "-0.03em" }}>{p.titulo}</div>
              <div style={{ fontSize: 26, lineHeight: 1.3, color: COR.texto2 }}>{p.sub}</div>
              <div style={{ marginTop: "auto", opacity: foco }}>
                <Detalhe i={i} t={t} />
              </div>
            </div>
          );
        })}
      </div>
      <Narracao cena="pilares" />
    </AbsoluteFill>
  );
};
