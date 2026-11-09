import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { COR } from "./tema";

// Fundo escuro com grade sutil e um brilho verde que passeia devagar
export const Fundo: React.FC<{ brilho?: [number, number] }> = ({ brilho = [70, 30] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{ backgroundColor: COR.fundo, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${COR.linha} 1px, transparent 1px), linear-gradient(90deg, ${COR.linha} 1px, transparent 1px)`,
          backgroundSize: "96px 96px",
          opacity: 0.35,
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)",
          translate: `0px ${-(t * 8) % 96}px`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 1100,
          height: 1100,
          borderRadius: "50%",
          left: `${brilho[0]}%`,
          top: `${brilho[1]}%`,
          translate: `${-550 + Math.sin(t * 0.6) * 60}px ${-550 + Math.cos(t * 0.5) * 50}px`,
          background: `radial-gradient(circle, rgba(194,255,0,0.16) 0%, rgba(194,255,0,0) 62%)`,
          opacity: interpolate(frame, [0, fps], [0, 1], { extrapolateRight: "clamp" }),
        }}
      />
    </AbsoluteFill>
  );
};

// Logo pequeno no canto, presente nas cenas do meio
export const Marca: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Img
      src={staticFile("logo.svg")}
      style={{ position: "absolute", left: 96, top: 72, height: 44, opacity: interpolate(frame, [0, 0.6 * fps], [0, 0.9], { extrapolateRight: "clamp" }) }}
    />
  );
};
