import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { Audio } from "@remotion/media";
import { interpolate, staticFile, useVideoConfig } from "remotion";
import { Abertura } from "./cenas/Abertura";
import { Fechamento } from "./cenas/Fechamento";
import { Pilares } from "./cenas/Pilares";
import { Processo } from "./cenas/Processo";
import { QuemSomos } from "./cenas/QuemSomos";
import narracao from "./narracao.json";
import { duracaoCena, inicioFala, type Cena } from "./tema";

export const TRANSICAO = 12;

// Vídeo explicativo da proposta: como a Fizgo funciona (sem valores)
export const VideoFizgo: React.FC = () => {
  const { fps } = useVideoConfig();
  const t = () => <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: TRANSICAO })} />;
  return (
    <>
    <Audio src={staticFile("musica.wav")} volume={(f) => volumeMusica(f, fps)} />
    <TransitionSeries>
      <TransitionSeries.Sequence name="Abertura" durationInFrames={duracaoCena("abertura", fps)} premountFor={fps}>
        <Abertura />
      </TransitionSeries.Sequence>
      {t()}
      <TransitionSeries.Sequence name="Quem é a Fizgo" durationInFrames={duracaoCena("quem", fps)} premountFor={fps}>
        <QuemSomos />
      </TransitionSeries.Sequence>
      {t()}
      <TransitionSeries.Sequence name="4 pilares" durationInFrames={duracaoCena("pilares", fps)} premountFor={fps}>
        <Pilares />
      </TransitionSeries.Sequence>
      {t()}
      <TransitionSeries.Sequence name="Como começa" durationInFrames={duracaoCena("processo", fps)} premountFor={fps}>
        <Processo />
      </TransitionSeries.Sequence>
      {t()}
      <TransitionSeries.Sequence name="Fechamento" durationInFrames={duracaoCena("fechamento", fps)} premountFor={fps}>
        <Fechamento />
      </TransitionSeries.Sequence>
    </TransitionSeries>
    </>
  );
};

const CENAS: Cena[] = ["abertura", "quem", "pilares", "processo", "fechamento"];

// Música mais alta nos respiros e abaixada (ducking) enquanto a narração fala
const volumeMusica = (f: number, fps: number) => {
  let inicio = 0;
  let fala = 0;
  for (const c of CENAS) {
    const a = inicio + inicioFala(fps);
    const b = a + Math.round(narracao[c].duracao * fps);
    fala = Math.max(fala, interpolate(f, [a - 8, a, b, b + 10], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    inicio += duracaoCena(c, fps) - TRANSICAO;
  }
  return interpolate(fala, [0, 1], [0.32, 0.13]);
};

export const duracaoTotal = (fps: number) =>
  CENAS.reduce((a, c) => a + duracaoCena(c, fps), 0) - 4 * TRANSICAO;
