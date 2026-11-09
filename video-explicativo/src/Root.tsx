import { Composition, Folder } from "remotion";
import { Abertura } from "./cenas/Abertura";
import { Fechamento } from "./cenas/Fechamento";
import { Pilares } from "./cenas/Pilares";
import { Processo } from "./cenas/Processo";
import { QuemSomos } from "./cenas/QuemSomos";
import { duracaoCena } from "./tema";
import { duracaoTotal, VideoFizgo } from "./VideoFizgo";

// A duração de cada cena vem da narração (src/narracao.json, gerado por scripts/narrar.sh)
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="ComoFuncionaFizgo" component={VideoFizgo} durationInFrames={duracaoTotal(30)} fps={30} width={1920} height={1080} />
      <Folder name="Cenas">
        <Composition id="Abertura" component={Abertura} durationInFrames={duracaoCena("abertura", 30)} fps={30} width={1920} height={1080} />
        <Composition id="QuemSomos" component={QuemSomos} durationInFrames={duracaoCena("quem", 30)} fps={30} width={1920} height={1080} />
        <Composition id="Pilares" component={Pilares} durationInFrames={duracaoCena("pilares", 30)} fps={30} width={1920} height={1080} />
        <Composition id="Processo" component={Processo} durationInFrames={duracaoCena("processo", 30)} fps={30} width={1920} height={1080} />
        <Composition id="Fechamento" component={Fechamento} durationInFrames={duracaoCena("fechamento", 30)} fps={30} width={1920} height={1080} />
      </Folder>
    </>
  );
};
