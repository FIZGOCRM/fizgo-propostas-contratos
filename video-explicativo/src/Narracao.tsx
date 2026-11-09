import { Audio } from "@remotion/media";
import { Sequence, staticFile, useVideoConfig } from "remotion";
import { audioCena, inicioFala, type Cena } from "./tema";

// Toca a narração da cena, falada de uma vez
export const Narracao: React.FC<{ cena: Cena }> = ({ cena }) => {
  const { fps } = useVideoConfig();
  return (
    <Sequence name={`Voz: ${cena}`} from={inicioFala(fps)} premountFor={fps}>
      <Audio src={staticFile(audioCena(cena))} />
    </Sequence>
  );
};
