import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Fundo, Marca } from "../Fundo";
import { Icone } from "../Icone";
import { Narracao } from "../Narracao";
import { COR, FONTE, SERIFA, entrada, linhas } from "../tema";

const PASSOS = [
  { titulo: "Aprovação", sub: "Contrato assinado pelo celular", icone: "doc" },
  { titulo: "Grupo no WhatsApp", sub: "Com o seu time Fizgo", icone: "grupo" },
  { titulo: "Onboarding", sub: "Entendemos as suas metas", icone: "reuniao" },
  { titulo: "Planejamento", sub: "Conteúdo e anúncios", icone: "calendario" },
  { titulo: "No ar!", sub: "Hora de crescer", icone: "foguete" },
];

// Linha do tempo: cada passo acende junto com a frase dele
export const Processo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ls = linhas("processo", fps);
  const titulo = entrada(frame, ls[0].inicio - 4, fps);
  const inicios = ls.slice(1).map((l) => l.inicio);
  // Progresso da linha: chega em cada passo quando a frase dele começa
  const progresso = interpolate(frame, inicios, inicios.map((_, i) => i / (inicios.length - 1)), { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const foguete = entrada(frame, inicios[4], fps, 0.6);

  return (
    <AbsoluteFill style={{ fontFamily: FONTE, color: COR.texto }}>
      <Fundo brilho={[15 + progresso * 70, 60]} />
      <Marca />
      <div style={{ position: "absolute", left: 160, top: 170, opacity: titulo, translate: `0px ${(1 - titulo) * 30}px` }}>
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "0.2em", color: COR.lima, textTransform: "uppercase" }}>✦ Depois do sim</div>
        <div style={{ fontSize: 96, fontWeight: 800, letterSpacing: "-0.04em", marginTop: 12 }}>
          Como a gente <span style={{ fontFamily: SERIFA, fontStyle: "italic", fontWeight: 400, color: COR.lima, fontSize: "1.12em" }}>começa</span>
        </div>
      </div>
      <div style={{ position: "absolute", left: 120, right: 120, top: 520 }}>
        <div style={{ position: "absolute", left: 160, right: 160, top: 58, height: 4, borderRadius: 2, background: COR.linha }} />
        <div style={{ position: "absolute", left: 160, top: 58, height: 4, borderRadius: 2, width: `calc((100% - 320px) * ${progresso})`, background: COR.lima, boxShadow: `0 0 24px ${COR.lima}` }} />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {PASSOS.map((p, i) => {
            const e = entrada(frame, inicios[i] - 4, fps, 0.6);
            const ultimo = i === PASSOS.length - 1;
            return (
              <div key={p.titulo} style={{ width: 320, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", opacity: 0.35 + e * 0.65 }}>
                <div
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    background: e > 0.5 ? COR.lima : COR.card,
                    border: `2px solid ${e > 0.5 ? COR.lima : COR.linha}`,
                    color: e > 0.5 ? COR.tinta : COR.mudo,
                    scale: `${0.85 + e * 0.15 + (ultimo ? foguete * 0.12 : 0)}`,
                    boxShadow: e > 0.5 ? `0 0 ${ultimo ? 80 : 40}px rgba(194,255,0,0.35)` : "none",
                  }}
                >
                  <div style={{ translate: ultimo ? `${foguete * 6}px ${-foguete * 6}px` : "0px 0px" }}>
                    <Icone nome={p.icone} tamanho={54} />
                  </div>
                </div>
                <div style={{ marginTop: 34, fontSize: 36, fontWeight: 800, letterSpacing: "-0.02em", whiteSpace: "nowrap", translate: `0px ${(1 - e) * 20}px` }}>{p.titulo}</div>
                <div style={{ marginTop: 8, fontSize: 25, color: COR.texto2, opacity: e }}>{p.sub}</div>
              </div>
            );
          })}
        </div>
      </div>
      <Narracao cena="processo" />
    </AbsoluteFill>
  );
};
