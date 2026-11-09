import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Fundo } from "../Fundo";
import { Narracao } from "../Narracao";
import { COR, FONTE, SERIFA, entrada, linhas } from "../tema";

const ETAPAS = ["Primeiro clique", "Conversa", "Cliente", "Venda"];

// Logo + "assessoria de crescimento e vendas", depois o caminho do clique até a venda
export const QuemSomos: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [l0, l1] = linhas("quem", fps);
  const logo = entrada(frame, l0.inicio - 8, fps, 0.8);
  const sobe = entrada(frame, l1.inicio, fps, 0.8);
  // A linha do caminho se desenha durante a segunda frase
  const caminho = interpolate(frame, [l1.inicio + 0.6 * fps, l1.fim - 0.3 * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ fontFamily: FONTE, color: COR.texto }}>
      <Fundo brilho={[50, 30]} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", translate: `0px ${-sobe * 230}px` }}>
        <Img src={staticFile("logo.svg")} style={{ height: 150, opacity: logo, scale: `${0.9 + logo * 0.1}` }} />
        <div style={{ marginTop: 48, fontSize: 64, fontWeight: 700, letterSpacing: "-0.03em", textAlign: "center", opacity: entrada(frame, l0.inicio + 0.5 * fps, fps), translate: `0px ${(1 - entrada(frame, l0.inicio + 0.5 * fps, fps)) * 30}px` }}>
          Assessoria de <span style={{ fontFamily: SERIFA, fontStyle: "italic", fontWeight: 400, color: COR.lima, fontSize: "1.15em" }}>crescimento</span> e vendas
        </div>
      </AbsoluteFill>

      <div style={{ position: "absolute", left: 200, right: 200, top: 640, height: 220, opacity: sobe }}>
        <div style={{ position: "absolute", left: 40, right: 40, top: 40, height: 4, background: COR.linha, borderRadius: 2 }} />
        <div style={{ position: "absolute", left: 40, top: 40, height: 4, width: `calc((100% - 80px) * ${caminho})`, background: COR.lima, borderRadius: 2, boxShadow: `0 0 24px ${COR.lima}` }} />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {ETAPAS.map((t, i) => {
            const ativo = caminho >= i / (ETAPAS.length - 1) - 0.001;
            const e = entrada(frame, l1.inicio + 0.4 * fps + i * 0.25 * fps, fps);
            return (
              <div key={t} style={{ width: 84, display: "flex", flexDirection: "column", alignItems: "center", gap: 26, opacity: e, translate: `0px ${(1 - e) * 30}px` }}>
                <div style={{ width: 84, height: 84, borderRadius: "50%", display: "grid", placeItems: "center", background: ativo ? COR.lima : COR.card, border: `2px solid ${ativo ? COR.lima : COR.linha}`, color: ativo ? COR.tinta : COR.mudo, fontSize: 34, fontWeight: 800 }}>
                  {i + 1}
                </div>
                <div style={{ fontSize: 40, fontWeight: 700, whiteSpace: "nowrap", color: ativo ? COR.texto : COR.mudo }}>{t}</div>
              </div>
            );
          })}
        </div>
      </div>
      <Narracao cena="quem" />
    </AbsoluteFill>
  );
};
