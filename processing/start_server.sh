#!/bin/bash

# Script per avviare il Music Sheet Processing Server

echo "🎼 Music Sheet Processing Server"
echo "================================"

# Controlla se Python è installato
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 non è installato. Installa Python 3 per continuare."
    exit 1
fi

# Controlla se pip è installato
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 non è installato. Installa pip per continuare."
    exit 1
fi

echo "✅ Python 3 trovato: $(python3 --version)"

# Crea un ambiente virtuale se non esiste
if [ ! -d "venv" ]; then
    echo "📦 Creazione ambiente virtuale..."
    python3 -m venv venv
fi

# Attiva l'ambiente virtuale
echo "🔧 Attivazione ambiente virtuale..."
source venv/bin/activate

# Installa le dipendenze
echo "📚 Installazione dipendenze..."
pip install -r requirements.txt

# Crea le directory necessarie
mkdir -p uploads
mkdir -p output

echo ""
echo "🚀 Avvio del server..."
echo "📡 Il server sarà disponibile su: http://localhost:5001"
echo "🌐 Apri client.html nel browser per l'interfaccia web"
echo ""
echo "Per fermare il server, premi Ctrl+C"
echo ""

# Avvia il server
python server.py
