@echo off
REM Script per avviare il Music Sheet Processing Server su Windows

echo 🎼 Music Sheet Processing Server
echo ================================

REM Controlla se Python è installato
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python non è installato. Installa Python per continuare.
    pause
    exit /b 1
)

echo ✅ Python trovato
python --version

REM Crea un ambiente virtuale se non esiste
if not exist "venv" (
    echo 📦 Creazione ambiente virtuale...
    python -m venv venv
)

REM Attiva l'ambiente virtuale
echo 🔧 Attivazione ambiente virtuale...
call venv\Scripts\activate.bat

REM Installa le dipendenze
echo 📚 Installazione dipendenze...
pip install -r requirements.txt

REM Crea le directory necessarie
if not exist "uploads" mkdir uploads
if not exist "output" mkdir output

echo.
echo 🚀 Avvio del server...
echo 📡 Il server sarà disponibile su: http://localhost:5001
echo 🌐 Apri client.html nel browser per l'interfaccia web
echo.
echo Per fermare il server, premi Ctrl+C
echo.

REM Avvia il server
python server.py

pause
