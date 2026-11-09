import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Fundo } from "../Fundo";
import { Icone } from "../Icone";
import { Narracao } from "../Narracao";
import { COR, FONTE, SERIFA, entrada, linhas } from "../tema";

const INCLUSO = ["O que está incluso no plano", "Como cada entrega funciona", "Os próximos passos"];

// A proposta tem tudo → chame no WhatsApp → logo e "Let's go!"
export const Fechamento: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [l0, l1, l2] = linhas("fechamento", fps);
  const doc = entrada(frame, l0.inicio - 4, fps);
  const botao = entrada(frame, l1.inicio + 0.6 * fps, fps, 0.6);
  const final = entrada(frame, l2.inicio - 8, fps, 0.8);
  const pulso = 1 + Math.sin(((frame - l1.inicio) / fps) * Math.PI * 2) * 0.02 * botao;

  return (
    <AbsoluteFill style={{ fontFamily: FONTE, color: COR.texto }}>
      <Fundo brilho={[50, 50]} />
      <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 90, opacity: 1 - final, filter: `blur(${final * 10}px)` }}>
        <div style={{ width: 660, padding: 44, borderRadius: 32, background: COR.card, border: `2px solid ${COR.linha}`, opacity: doc, translate: `0px ${(1 - doc) * 60}px`, rotate: `${(1 - doc) * -4}deg` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, color: COR.lima }}>
            <Icone nome="doc" tamanho={44} />
            <span style={{ fontSize: 24, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase" }}>Sua proposta</span>
          </div>
          <div style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 20 }}>
            {INCLUSO.map((t, i) => {
              const e = entrada(frame, l0.inicio + 0.4 * fps + i * 0.35 * fps, fps);
              return (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 32, fontWeight: 600, whiteSpace: "nowrap", opacity: e, translate: `${(1 - e) * 20}px 0px` }}>
                  <span style={{ width: 40, height: 40, borderRadius: "50%", background: COR.lima, color: COR.tinta, display: "grid", placeItems: "center", flex: "none" }}><Icone nome="check" tamanho={24} traco={3} /></span>
                  {t}
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 30, maxWidth: 820 }}>
          <div style={{ fontSize: 76, fontWeight: 800, whiteSpace: "nowrap", letterSpacing: "-0.04em", lineHeight: 1.05, opacity: entrada(frame, l1.inicio - 4, fps) }}>
            Ficou alguma <span style={{ fontFamily: SERIFA, fontStyle: "italic", fontWeight: 400, color: COR.lima, fontSize: "1.12em" }}>dúvida?</span>
          </div>
          <div style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 18, padding: "26px 40px", borderRadius: 99, background: COR.lima, color: COR.tinta, fontSize: 40, fontWeight: 800, whiteSpace: "nowrap", opacity: botao, scale: `${(0.8 + botao * 0.2) * pulso}`, boxShadow: `0 0 70px rgba(194,255,0,${0.35 * botao})` }}>
            <Icone nome="chat" tamanho={46} traco={2.4} /> Chame a gente no WhatsApp
          </div>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 30, opacity: final }}>
        <Img src={staticFile("logo.svg")} style={{ height: 170, scale: `${0.9 + final * 0.1}` }} />
        <div style={{ fontFamily: SERIFA, fontStyle: "italic", fontSize: 120, color: COR.lima, translate: `0px ${(1 - final) * 30}px` }}>Let's go!</div>
      </AbsoluteFill>
      <Narracao cena="fechamento" />
    </AbsoluteFill>
  );
};
