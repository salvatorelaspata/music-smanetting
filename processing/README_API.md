# Music Sheet Processing Server

Un server Flask per il processamento automatico di spartiti musicali con interfaccia web integrata.

## 🚀 Caratteristiche

- **Processamento Automatico**: Analisi di spartiti in formato PDF e immagini
- **Interfaccia Web**: Demo integrata per caricare e processare file
- **API RESTful**: Endpoint completi per integrazione con altri sistemi
- **Rilevamento Intelligente**: 
  - Pentagrammi e linee musicali
  - Chiavi e indicazioni di tempo
  - Note e primitive musicali
- **Formato Multipli**: Supporto per PDF, JPG, PNG, GIF, BMP, TIFF

## 🛠️ Installazione

### Prerequisiti
```bash
# Installa le dipendenze Python
pip install -r requirements.txt

# Assicurati di avere OpenCV installato
pip install opencv-python
```

### Avvio del Server
```bash
# Avvia il server (default porta 5001)
python server.py

# Oppure specificando una porta diversa
PORT=5002 python server.py
```

## 🌐 Utilizzo

### Interfaccia Web Demo
Una volta avviato il server, puoi accedere alla demo web:

- **Demo Completa**: http://localhost:5001/demo
- **Home Page**: http://localhost:5001/ (serve demo se richiesta da browser)
- **Documentazione API**: http://localhost:5001/api/docs

### API Endpoints

#### Informazioni Server
```bash
# Stato del server
curl http://localhost:5001/health

# Informazioni API
curl -H "Accept: application/json" http://localhost:5001/
```

#### Processamento File
```bash
# Carica e processa un file
curl -X POST -F "file=@spartito.pdf" http://localhost:5001/upload

# Ottieni risultati (con immagini)
curl "http://localhost:5001/process/{job_id}?include_images=true"

# Lista tutti i lavori
curl http://localhost:5001/jobs

# Scarica risultati come ZIP
curl -O http://localhost:5001/jobs/{job_id}/download

# Elimina un lavoro
curl -X DELETE http://localhost:5001/jobs/{job_id}/delete
```

## 📊 Processo di Elaborazione

Il server esegue i seguenti passaggi automaticamente:

1. **Preparazione**: Conversione PDF in immagini (se necessario)
2. **Pre-processing**: Conversione in scala di grigi e rimozione rumore
3. **Binarizzazione**: Sogliatura ottimale con algoritmo di Otsu
4. **Rilevamento Pentagrammi**: Identificazione linee e strutture musicali
5. **Analisi Simboli**: Riconoscimento chiavi, tempi e primitive musicali
6. **Output**: Generazione immagini elaborate e metadati JSON

## 📁 Struttura Output

Per ogni processamento viene creata una cartella con:

```
output/{job_id}/
├── metadata.json              # Metadati del processamento
├── {filename}/
│   ├── original.jpg          # Immagine originale
│   ├── denoised.jpg         # Dopo rimozione rumore
│   ├── binarized.jpg        # Immagine binarizzata
│   ├── detected_staffs.jpg  # Pentagrammi rilevati
│   └── staff_N_primitives.jpg # Primitive musicali
```

## 🎨 Interfaccia Web

La demo web include:

- **Drag & Drop**: Carica file trascinandoli nell'area
- **Visualizzazione Real-time**: Mostra lo stato del processamento
- **Anteprima Risultati**: Visualizza immagini elaborate
- **Gestione Lavori**: Lista e gestione dei processamenti precedenti
- **Download ZIP**: Scarica tutti i risultati in un archivio

## ⚙️ Configurazione

### Variabili d'Ambiente
```bash
export FLASK_ENV=development  # Per modalità debug
export PORT=5001             # Porta del server
```

### Configurazione Server
```python
# Configurazioni nel server.py
MAX_FILE_SIZE = 16 * 1024 * 1024  # 16MB
ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff', 'tif'}
```

## 🔧 Docker

### Build e Run
```bash
# Build dell'immagine
docker build -t music-processor .

# Run del container
docker run -p 5001:5001 music-processor

# Run con volume per persistenza
docker run -p 5001:5001 -v ./output:/app/output music-processor
```

### Docker Compose
```bash
# Avvia con docker-compose
docker-compose up -d

# Per sviluppo
docker-compose -f docker-compose.dev.yml up
```

## 📚 Esempi di Utilizzo

### JavaScript (Frontend)
```javascript
// Carica file
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('/upload', {
    method: 'POST',
    body: formData
});

const result = await response.json();
console.log('Job ID:', result.job_id);
```

### Python (Client)
```python
import requests

# Carica file
with open('spartito.pdf', 'rb') as f:
    files = {'file': f}
    response = requests.post('http://localhost:5001/upload', files=files)
    
job_id = response.json()['job_id']

# Ottieni risultati
results = requests.get(f'http://localhost:5001/process/{job_id}')
print(results.json())
```

### cURL (CLI)
```bash
# Processamento completo
JOB_ID=$(curl -s -X POST -F "file=@spartito.pdf" http://localhost:5001/upload | jq -r .job_id)
echo "Job ID: $JOB_ID"

# Attendi e scarica risultati
curl -O "http://localhost:5001/jobs/$JOB_ID/download"
```

## 🐛 Debugging

### Log del Server
```bash
# Il server mostra informazioni dettagliate durante il processamento
python server.py
```

### Verifica File Output
```bash
# Controlla cartelle output
ls -la output/
ls -la uploads/

# Verifica un processamento specifico
ls -la output/{job_id}/
```

### Health Check
```bash
# Verifica stato server
curl http://localhost:5001/health | jq
```

## 🤝 Contribuire

1. Fork del repository
2. Crea un branch per la feature (`git checkout -b feature/nuova-funzionalita`)
3. Commit delle modifiche (`git commit -am 'Aggiunge nuova funzionalità'`)
4. Push del branch (`git push origin feature/nuova-funzionalita`)
5. Crea una Pull Request

## 📄 Licenza

Questo progetto è rilasciato sotto licenza MIT. Vedi il file `LICENSE` per dettagli.

## 🙋‍♂️ Supporto

Per problemi o domande:
- Apri un issue su GitHub
- Consulta la documentazione API: http://localhost:5001/api/docs
- Prova la demo web: http://localhost:5001/demo
