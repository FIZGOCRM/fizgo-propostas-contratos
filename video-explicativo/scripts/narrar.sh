#!/bin/bash
# Gera a narração de cada cena e o arquivo com os tempos das frases (src/narracao.json).
# Vozes pt-BR: pt-BR-FranciscaNeural (padrão), pt-BR-AntonioNeural (masculina). Ex.: VOZ=pt-BR-AntonioNeural ./scripts/narrar.sh
cd "$(dirname "$0")/.."
[ -x .venv/bin/edge-tts ] || { python3 -m venv .venv && .venv/bin/pip install -q edge-tts; }
.venv/bin/python scripts/narrar.py
