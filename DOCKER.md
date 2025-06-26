# Music Scanner - Docker Setup

Questa guida spiega come utilizzare Docker per eseguire l'applicazione Music Scanner che include sia il frontend (Next.js) che il processing backend (Python Flask).

## 🐳 Prerequisiti

- [Docker](https://docs.docker.com/get-docker/) (versione 20.10 o superiore)
- [Docker Compose](https://docs.docker.com/compose/install/) (versione 2.0 o superiore)

## 🚀 Avvio Rapido

### Produzione

```bash
# Build delle immagini
./docker-run.sh build

# Avvio in modalità produzione
./docker-run.sh up
```

### Sviluppo

```bash
# Avvio in modalità sviluppo (con hot reload)
./docker-run.sh dev
```

## 📋 Comandi Disponibili

Utilizza lo script `docker-run.sh` per gestire facilmente l'applicazione:

```bash
./docker-run.sh [COMANDO]
```

### Comandi Principali

- **`build`** - Costruisce tutte le immagini Docker
- **`up`** - Avvia tutti i servizi in modalità produzione
- **`dev`** - Avvia tutti i servizi in modalità sviluppo
- **`down`** - Ferma tutti i servizi
- **`restart`** - Riavvia tutti i servizi

### Comandi per Debugging

- **`logs`** - Mostra i log di tutti i servizi
- **`logs-frontend`** - Mostra i log solo del frontend
- **`logs-processing`** - Mostra i log solo del processing
- **`status`** - Mostra lo stato di tutti i container
- **`shell-frontend`** - Apre una shell nel container del frontend
- **`shell-processing`** - Apre una shell nel container del processing

### Comandi di Manutenzione

- **`clean`** - Rimuove tutti i container, network e volumi
- **`help`** - Mostra l'help dei comandi

## 🌐 Accesso ai Servizi

Una volta avviati i servizi, puoi accedere a:

- **Frontend**: http://localhost:3000
- **Processing API**: http://localhost:5001

## 📁 Struttura Docker

```
music-smanetting/
├── docker-compose.yml          # Configurazione produzione
├── docker-compose.dev.yml      # Configurazione sviluppo
├── docker-run.sh              # Script di gestione
├── frontend/
│   ├── Dockerfile              # Immagine Next.js
│   └── .dockerignore
├── processing/
│   ├── Dockerfile              # Immagine Python Flask
│   └── .dockerignore
└── DOCKER.md                   # Questa guida
```

## 🔧 Configurazione

### Variabili d'Ambiente

#### Frontend
- `NODE_ENV`: Modalità di esecuzione (development/production)
- `NEXT_PUBLIC_API_URL`: URL dell'API di processing (default: http://localhost:5001)

#### Processing
- `FLASK_ENV`: Modalità Flask (development/production)
- `FLASK_APP`: Nome dell'applicazione Flask (server.py)
- `PORT`: Porta su cui eseguire il server (default: 5001)

### Volumi Persistenti

I dati vengono salvati in volumi Docker per persistere tra i riavvii:

- `processing_uploads`: File caricati dall'utente
- `processing_output`: Risultati dell'elaborazione

## 🐞 Troubleshooting

### Problemi Comuni

#### Porta già in uso
```bash
# Ferma tutti i servizi
./docker-run.sh down

# Verifica che non ci siano altri servizi in esecuzione
lsof -i :3000
lsof -i :5001
```

#### Immagini non aggiornate
```bash
# Ricostruisci le immagini senza cache
./docker-run.sh build
```

#### Container che non si avviano
```bash
# Controlla i log per errori
./docker-run.sh logs

# Controlla lo stato dei container
./docker-run.sh status
```

#### Spazio su disco
```bash
# Pulisci tutto (attenzione: rimuove anche i dati!)
./docker-run.sh clean

# Oppure pulisci solo le immagini inutilizzate
docker image prune -f
```

### Debug del Frontend

```bash
# Accedi al container del frontend
./docker-run.sh shell-frontend

# Controlla i log specifici del frontend
./docker-run.sh logs-frontend
```

### Debug del Processing

```bash
# Accedi al container del processing
./docker-run.sh shell-processing

# Controlla i log specifici del processing
./docker-run.sh logs-processing
```

## 🔄 Aggiornamenti

Per aggiornare l'applicazione dopo modifiche al codice:

### Modalità Sviluppo
Le modifiche vengono ricaricate automaticamente grazie ai volumi montati.

### Modalità Produzione
```bash
# Ferma i servizi
./docker-run.sh down

# Ricostruisci le immagini
./docker-run.sh build

# Riavvia i servizi
./docker-run.sh up
```

## 📊 Monitoraggio

### Utilizzo Risorse
```bash
# Mostra l'utilizzo di CPU e memoria
docker stats

# Mostra lo spazio utilizzato
docker system df
```

### Health Checks
I container includono health check automatici per verificare il corretto funzionamento dei servizi.

## 🛡️ Sicurezza

- I container eseguono con utenti non-root
- Le porte sono esposte solo su localhost
- I file sensibili sono esclusi tramite `.dockerignore`
- Le variabili d'ambiente sono gestite tramite Docker Compose

## 📚 Sviluppo

Per contribuire allo sviluppo:

1. Utilizza la modalità sviluppo: `./docker-run.sh dev`
2. I file sorgente sono montati come volumi per il hot reload
3. I log sono disponibili in tempo reale
4. Le modifiche al codice sono immediatamente visibili

## 🆘 Supporto

Se riscontri problemi:

1. Controlla i log: `./docker-run.sh logs`
2. Verifica lo stato: `./docker-run.sh status`
3. Prova a ricostruire: `./docker-run.sh clean && ./docker-run.sh build`
4. Consulta questo README per soluzioni comuni
