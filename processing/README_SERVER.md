# 🎼 Music Sheet Processing Web Server

Un web server Flask per l'elaborazione automatica di spartiti musicali con riconoscimento di pentagrammi, chiavi, segni di tempo e primitive musicali.

## ✨ Caratteristiche

- **Elaborazione PDF e Immagini**: Supporta file PDF e immagini (PNG, JPG, JPEG, GIF, BMP, TIFF)
- **Riconoscimento Automatico**: Rileva automaticamente pentagrammi, chiavi, segni di tempo e note
- **API RESTful**: Interfaccia HTTP per integrazione con altre applicazioni
- **Interfaccia Web**: Client HTML intuitivo per l'upload e visualizzazione risultati
- **Gestione Lavori**: Tracciamento dei processamenti con download risultati
- **Drag & Drop**: Interfaccia utente moderna con supporto trascinamento file

## 🚀 Avvio Rapido

### Prerequisiti
- Python 3.7+
- pip

### Installazione e Avvio

```bash
# Clona il repository e vai nella directory processing
cd processing

# Avvia il server (installa automaticamente le dipendenze)
./start_server.sh
```

Il server sarà disponibile su `http://localhost:5001`

### Utilizzo dell'Interfaccia Web

1. Apri `client.html` nel browser
2. Trascina un file PDF o immagine di spartito musicale
3. Clicca "Elabora Spartito"
4. Visualizza i risultati e scarica i file elaborati

## 📡 API Endpoints

### Upload e Processamento
```http
POST /upload
Content-Type: multipart/form-data

Parameters:
- file: File PDF o immagine da processare
```

### Ottenere Risultati
```http
GET /process/{job_id}?include_images=true
```

### Lista Lavori
```http
GET /jobs
```

### Download Risultati
```http
GET /jobs/{job_id}/download
```

### Eliminare Lavoro
```http
DELETE /jobs/{job_id}/delete
```

### Stato Server
```http
GET /health
```

## 🎯 Funzionalità di Elaborazione

Il server mantiene tutte le funzionalità dell'elaboratore originale:

1. **Pre-elaborazione**:
   - Conversione PDF in immagini
   - Rimozione del rumore
   - Binarizzazione con soglia di Otsu

2. **Rilevamento Strutturale**:
   - Individuazione linee del pentagramma
   - Calcolo spaziatura e spessore linee
   - Creazione oggetti pentagramma

3. **Riconoscimento Musicale**:
   - Rilevamento chiavi musicali
   - Identificazione segni di tempo
   - Riconoscimento primitive musicali (note, pause, etc.)

4. **Output**:
   - Immagini elaborate per ogni fase
   - Visualizzazione pentagrammi rilevati
   - Annotazioni su chiavi e primitive

## 📁 Struttura Output

Per ogni file elaborato viene creata una directory con:

```
output/
├── {job_id}/
│   ├── metadata.json          # Metadati del lavoro
│   ├── {filename}_pages/       # Pagine estratte da PDF
│   └── {filename}/            # Risultati elaborazione
│       ├── original.jpg       # Immagine originale
│       ├── denoised.jpg      # Immagine pulita
│       ├── binarized.jpg     # Immagine binarizzata
│       ├── detected_staffs.jpg # Pentagrammi rilevati
│       └── staff_*_primitives.jpg # Primitive per pentagramma
```

## 🛠️ Configurazione

### Variabili di Ambiente
- `UPLOAD_FOLDER`: Directory per file caricati (default: `uploads`)
- `OUTPUT_FOLDER`: Directory per risultati (default: `output`)
- `MAX_FILE_SIZE`: Dimensione massima file in bytes (default: 16MB)

### Personalizzazione
Modifica le configurazioni in `server.py`:

```python
MAX_FILE_SIZE = 16 * 1024 * 1024  # 16MB
ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff', 'tif'}
```

## 🧪 Test dell'API

### Usando curl
```bash
# Upload file
curl -X POST -F "file=@spartito.pdf" http://localhost:5001/upload

# Ottenere risultati
curl http://localhost:5001/process/{job_id}

# Lista lavori
curl http://localhost:5001/jobs

# Download risultati
curl -O http://localhost:5001/jobs/{job_id}/download
```

### Usando Python
```python
import requests

# Upload file
with open('spartito.pdf', 'rb') as f:
    response = requests.post('http://localhost:5001/upload', files={'file': f})
    result = response.json()
    job_id = result['job_id']

# Ottenere risultati
response = requests.get(f'http://localhost:5001/process/{job_id}')
results = response.json()
```

## 📦 Dipendenze

Le dipendenze principali includono:
- Flask: Web framework
- OpenCV: Elaborazione immagini
- PyMuPDF: Gestione PDF
- NumPy: Operazioni numeriche
- Matplotlib: Visualizzazione
- Pillow: Manipolazione immagini

Vedi `requirements.txt` per l'elenco completo.

## 🔧 Sviluppo

### Struttura del Codice
```
processing/
├── server.py              # Web server Flask
├── main.py               # Logica di elaborazione originale
├── client.html           # Interfaccia web
├── start_server.sh       # Script di avvio
├── requirements.txt      # Dipendenze Python
└── src/                  # Moduli di elaborazione
    ├── pdf_utils.py      # Gestione PDF
    ├── staffline_detection.py  # Rilevamento pentagrammi
    ├── detection.py      # Riconoscimento musicale
    └── ...
```

### Aggiungere Nuove Funzionalità

1. Implementa la logica in `src/`
2. Integra nel processamento in `main.py`
3. Esponi via API in `server.py`
4. Aggiorna l'interfaccia in `client.html`

## 🐛 Risoluzione Problemi

### Server non si avvia
- Verifica che Python 3.7+ sia installato
- Controlla che tutte le dipendenze siano installate
- Verifica che le porte 5001 non sia già in uso

### Errori di elaborazione
- Controlla che il file sia un PDF o immagine valida
- Verifica che il file non sia corrotto
- Controlla i log del server per errori dettagliati

### Problemi di memoria
- Riduci la dimensione delle immagini
- Processa una pagina alla volta per PDF grandi
- Aumenta la memoria disponibile

## 📄 Licenza

Questo progetto è rilasciato sotto licenza MIT. Vedi il file LICENSE per i dettagli.

## 🤝 Contribuire

1. Fork del repository
2. Crea un branch per la tua feature
3. Commit delle modifiche
4. Push al branch
5. Crea una Pull Request

## 📞 Supporto

Per problemi o domande:
- Crea un issue su GitHub
- Controlla la documentazione API
- Verifica i log del server per errori dettagliati
