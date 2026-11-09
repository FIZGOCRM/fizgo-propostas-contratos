# Narração contínua por cena (voz neural pt-BR da Microsoft, via edge-tts).
# Cada cena vira um único áudio, falado de uma vez; o tempo de cada frase sai das marcas de palavra.
import asyncio, json, os, subprocess
import edge_tts

VOZ = os.environ.get("VOZ", "pt-BR-FranciscaNeural")
VEL = os.environ.get("VEL", "+0%")

async def cena(nome, frases):
    com = edge_tts.Communicate(" ".join(frases), VOZ, rate=VEL, boundary="WordBoundary")
    audio, palavras = bytearray(), []
    async for p in com.stream():
        if p["type"] == "audio": audio += p["data"]
        elif p["type"] == "WordBoundary": palavras.append((p["offset"] / 1e7, (p["offset"] + p["duration"]) / 1e7))
    base = f"public/voz/{nome}"
    open(base + ".mp3", "wb").write(audio)
    subprocess.run(["afconvert", "-f", "WAVE", "-d", "LEI16@44100", base + ".mp3", base + ".wav"], check=True)
    os.remove(base + ".mp3")
    info = subprocess.run(["afinfo", base + ".wav"], capture_output=True, text=True).stdout
    total = float(info.split("estimated duration: ")[1].split()[0])
    # Distribui as marcas de palavra entre as frases pela contagem de palavras
    linhas, i = [], 0
    for t in frases:
        n = len([w for w in t.split() if any(c.isalnum() for c in w)])
        ps = palavras[i:i + n] or palavras[-1:]
        i += n
        linhas.append({"texto": t, "inicio": round(ps[0][0], 2), "duracao": round(ps[-1][1] - ps[0][0], 2)})
    return {"arquivo": f"voz/{nome}.wav", "duracao": round(total, 2), "linhas": linhas}

async def main():
    roteiro = json.load(open("scripts/roteiro.json"))
    for f in os.listdir("public/voz"): os.remove(os.path.join("public/voz", f))
    out = {nome: await cena(nome, frases) for nome, frases in roteiro.items()}
    json.dump(out, open("src/narracao.json", "w"), ensure_ascii=False, indent=2)
    for nome, c in out.items(): print(f"{nome}: {c['duracao']}s  " + " | ".join(f"{l['inicio']}" for l in c["linhas"]))
    print("fala total:", round(sum(c["duracao"] for c in out.values()), 1), "s")

asyncio.run(main())
