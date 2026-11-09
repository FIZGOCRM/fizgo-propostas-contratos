import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Fundo } from "../Fundo";
import { Narracao } from "../Narracao";
import { COR, FONTE, SERIFA, entrada, linhas } from "../tema";

const PERGUNTA = ["Por", "que", "algumas", "empresas", "não", "param", "de", "vender", "na", "internet?"];

// Pergunta palavra por palavra, depois a resposta: "Não é sorte. É método."
export const Abertura: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [l0, l1] = linhas("abertura", fps);
  const passo = (l0.fim - l0.inicio) / PERGUNTA.length;
  const sai = entrada(frame, l1.inicio - 6, fps, 0.5);
  const sorte = entrada(frame, l1.inicio, fps, 0.5);
  const metodo = entrada(frame, l1.inicio + Math.round(0.85 * fps), fps, 0.6);

  return (
    <AbsoluteFill style={{ fontFamily: FONTE, color: COR.texto }}>
      <Fundo brilho={[50, 55]} />
      <Img
        src={staticFile("simbolo.svg")}
        style={{ position: "absolute", right: -60, bottom: -120, height: 760, opacity: 0.06, rotate: `${interpolate(frame, [0, 200], [-6, 0])}deg` }}
      />
      <AbsoluteFill style={{ justifyContent: "center", padding: "0 160px" }}>
        <div
          style={{
            fontSize: 104,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 1.04,
            maxWidth: 1500,
            opacity: 1 - sai,
            translate: `0px ${-sai * 60}px`,
            filter: `blur(${sai * 8}px)`,
          }}
        >
          {PERGUNTA.map((p, i) => {
            const e = entrada(frame, l0.inicio + i * passo, fps, 0.5);
            const destaque = p === "vender";
            return (
              <span key={i} style={{ display: "inline-block", marginRight: 26, opacity: e, translate: `0px ${(1 - e) * 40}px`, color: destaque ? COR.lima : COR.texto }}>
                {p}
              </span>
            );
          })}
        </div>
        <div style={{ position: "absolute", left: 160, right: 160, top: "50%", translate: "0px -50%", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 92, fontWeight: 700, color: COR.mudo, opacity: sorte * (1 - metodo * 0.4), translate: `0px ${(1 - sorte) * 40}px`, textDecoration: metodo > 0.5 ? "line-through" : "none", textDecorationColor: COR.lima }}>
            Não é sorte.
          </div>
          <div style={{ fontSize: 190, fontWeight: 800, letterSpacing: "-0.05em", lineHeight: 1, opacity: metodo, scale: `${0.85 + metodo * 0.15}`, transformOrigin: "left center" }}>
            É <span style={{ fontFamily: SERIFA, fontStyle: "italic", fontWeight: 400, color: COR.lima, fontSize: "1.12em" }}>método.</span>
          </div>
        </div>
      </AbsoluteFill>
      <Narracao cena="abertura" />
    </AbsoluteFill>
  );
};
