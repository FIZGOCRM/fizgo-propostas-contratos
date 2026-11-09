# Trilha de fundo própria (sem direitos de terceiros): pad, arpejo, baixo e batida leve, 100 BPM.
# Uso: .venv/bin/python scripts/musica.py <segundos>  →  public/musica.wav
import sys, wave
import numpy as np

SR, BPM = 44100, 100
dur = float(sys.argv[1]) if len(sys.argv) > 1 else 60
n = int(SR * (dur + 1))
beat = 60 / BPM
rng = np.random.default_rng(7)
L, R = np.zeros(n), np.zeros(n)

def hz(m): return 440 * 2 ** ((m - 69) / 12)
def put(sig, t, pan=0.5, g=1.0):
    i = int(t * SR); sig = sig[: max(0, n - i)]
    L[i:i + len(sig)] += sig * g * (1 - pan); R[i:i + len(sig)] += sig * g * pan
def lowpass(x, a):
    y = np.empty_like(x); acc = 0.0
    for k in range(len(x)): acc += a * (x[k] - acc); y[k] = acc
    return y

# Am – F – C – G (um compasso de 4 tempos cada)
ACORDES = [(57, [57, 60, 64, 67]), (53, [53, 57, 60, 64]), (48, [55, 60, 64, 67]), (55, [55, 59, 62, 67])]
compasso = 4 * beat
total_c = int(dur / compasso) + 2

for c in range(total_c):
    t0 = c * compasso
    raiz, notas = ACORDES[c % 4]
    # Pad: harmônicos suaves, levemente desafinados
    tt = np.arange(int(compasso * SR * 1.05)) / SR
    env = np.minimum(1, tt / 0.6) * np.minimum(1, (compasso * 1.05 - tt) / 0.5)
    pad = sum(np.sin(2 * np.pi * hz(m + 12) * (1 + d) * tt) * a for m in notas for d, a in ((0, .5), (.004, .3), (-.004, .3)))
    pad += 0.15 * sum(np.sin(2 * np.pi * hz(m + 12) * 2 * tt) for m in notas)
    put(pad * env * 0.035, t0, 0.5)
    # Baixo: tempos 1 e 3, com a nota da raiz
    for b in (0, 2, 2.5):
        tb = np.arange(int(beat * 0.9 * SR)) / SR
        put(np.sin(2 * np.pi * hz(raiz - 12) * tb) * np.exp(-tb * 3) * 0.32, t0 + b * beat)
    # Arpejo em colcheias (Karplus-Strong), entra no 2º compasso
    if c >= 1:
        seq = [notas[i] + 24 for i in (0, 1, 2, 3, 2, 1, 2, 3)]
        for k, m in enumerate(seq):
            p = int(SR / hz(m)); buf = rng.uniform(-1, 1, p); out = np.empty(int(SR * 0.5))
            for j in range(len(out)):
                out[j] = buf[j % p]; buf[j % p] = 0.5 * (buf[j % p] + buf[(j + 1) % p]) * 0.996
            put(out * 0.06, t0 + k * beat / 2, 0.35 if k % 2 else 0.65)
    # Batida: entra no 3º compasso
    if c >= 2:
        for b in range(4):
            tk = np.arange(int(0.35 * SR)) / SR
            kick = np.sin(2 * np.pi * (45 * tk + 60 * (1 - np.exp(-tk * 30)) / 30)) * np.exp(-tk * 9)
            put(kick * 0.5, t0 + b * beat)
            if b in (1, 3):
                tc = np.arange(int(0.2 * SR)) / SR
                put(np.diff(rng.uniform(-1, 1, len(tc) + 1)) * np.exp(-tc * 22) * 0.10, t0 + b * beat)
            for h in (0.5,):
                th = np.arange(int(0.06 * SR)) / SR
                put(np.diff(rng.uniform(-1, 1, len(th) + 1)) * np.exp(-th * 60) * 0.05, t0 + (b + h) * beat, 0.6)

mix = np.stack([L, R], 1)[: int(SR * dur)]
tt = np.arange(len(mix)) / SR
mix *= (np.minimum(1, tt / 1.5) * np.clip((dur - tt) / 3, 0, 1))[:, None]
mix /= np.abs(mix).max() / 0.85
with wave.open("public/musica.wav", "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype("<i2").tobytes())
print("public/musica.wav", round(dur, 1), "s")
