// Identidade do site da Fizgo (a mesma da proposta) e o tempo de cada frase da narração.
import { loadFont as jakarta } from "@remotion/google-fonts/PlusJakartaSans";
import { loadFont as serif } from "@remotion/google-fonts/InstrumentSerif";
import { spring } from "remotion";
import narracao from "./narracao.json";

export const COR = {
  fundo: "#070A08",
  card: "#111814",
  linha: "rgba(255,255,255,0.10)",
  texto: "#F4F7F4",
  texto2: "#C9D1CA",
  mudo: "#8E9A90",
  lima: "#C2FF00",
  tinta: "#070A08",
};

export const FONTE = jakarta("normal", { weights: ["400", "600", "700", "800"], subsets: ["latin"] }).fontFamily;
export const SERIFA = serif("italic", { weights: ["400"], subsets: ["latin"] }).fontFamily;

export type Cena = keyof typeof narracao;
export type Linha = { texto: string; duracao: number; inicio: number; fim: number };

// Respiro antes da fala e no fim da cena (segundos)
const ANTES = 0.4;
const DEPOIS = 0.7;

// Frases da cena em frames (a fala começa depois do respiro ANTES)
export const linhas = (cena: Cena, fps: number): Linha[] =>
  narracao[cena].linhas.map((l) => {
    const inicio = Math.round((ANTES + l.inicio) * fps);
    return { ...l, inicio, fim: inicio + Math.round(l.duracao * fps) };
  });

export const duracaoCena = (cena: Cena, fps: number) => Math.round((ANTES + narracao[cena].duracao + DEPOIS) * fps);

export const inicioFala = (fps: number) => Math.round(ANTES * fps);
export const audioCena = (cena: Cena) => narracao[cena].arquivo;

// 0 → 1 com mola suave, começando no frame indicado
export const entrada = (frame: number, inicio: number, fps: number, duracao = 0.7) =>
  spring({ frame: frame - inicio, fps, durationInFrames: Math.round(duracao * fps), config: { damping: 200 } });
