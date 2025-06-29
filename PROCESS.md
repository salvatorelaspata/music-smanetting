# Processo di Elaborazione e Manipolazione dello Spartito

Questo documento descrive l'intero ciclo di vita di uno spartito musicale all'interno del sistema, dal caricamento iniziale fino all'analisi, modifica e persistenza.

## Architettura Generale

L'architettura si basa su tre componenti principali che lavorano in sinergia:

1.  **Frontend (Next.js):** L'interfaccia utente con cui l'utente interagisce per caricare, visualizzare, modificare e analizzare gli spartiti.
2.  **Backend (`processing` - Flask):** Un server Python che gestisce la logica di business, il processamento delle immagini (OpenCV) e funge da intermediario per i servizi di storage.
3.  **Servizi di Storage:**
    *   **MongoDB:** Utilizzato come database primario per memorizzare i metadati, le analisi, le annotazioni e lo stato degli spartiti.
    *   **MinIO (S3):** Utilizzato come object storage per persistere i file degli spartiti (immagini, PDF).

---

## Flusso di Elaborazione Dettagliato

Ecco i passaggi sequenziali che avvengono quando un utente carica un nuovo spartito.

### 1. Caricamento dal Frontend

-   **Azione Utente:** L'utente naviga sulla pagina `/scan` e seleziona uno o più file (immagini o PDF) tramite il componente di upload.
-   **Gestione Locale:** Lo store Zustand (`useScanStore`) gestisce temporaneamente i file selezionati e le loro anteprime in locale nel browser.
-   **Invio al Backend:** Quando l'utente clicca su "Processa", il frontend invia il file al backend tramite una richiesta `POST` all'endpoint `/upload`.

### 2. Ricezione e Persistenza nel Backend

-   **Endpoint `/upload`:** Il server Flask riceve il file.
-   **Salvataggio Temporaneo:** Il file viene salvato temporaneamente nella cartella `uploads/` del servizio `processing`.
-   **Upload su MinIO (S3):**
    -   Il backend si connette a MinIO utilizzando le credenziali fornite (`S3_ENDPOINT_URL`, `S3_ACCESS_KEY_ID`, etc.).
    -   Il file viene caricato nel bucket predefinito (`sheetmusic`).
    -   Il file temporaneo nella cartella `uploads/` viene eliminato.
-   **Generazione URL Pubblico:** Il backend costruisce l'URL pubblico per accedere al file su MinIO (es. `http://localhost:9000/sheetmusic/....`). Questo è l'URL che verrà utilizzato dal frontend.

### 3. Creazione Metadati su MongoDB

-   Subito dopo l'upload su MinIO, il backend crea un nuovo documento nella collection `sheet_music` di MongoDB.
-   Questo documento iniziale contiene:
    -   Un `_id` univoco.
    -   Il nome del file.
    -   Le date `createdAt` e `updatedAt`.
    -   Lo `status` impostato su `"scanned"`.
    -   Un array `pages` contenente un primo oggetto con l'URL pubblico del file appena caricato su MinIO.

### 4. Processamento dell'Immagine (OpenCV)

-   Il backend avvia il processo di analisi dell'immagine (o delle immagini estratte dal PDF):
    1.  **Conversione in Scala di Grigi:** L'immagine viene convertita per semplificare l'analisi.
    2.  **Rimozione Rumore (Denoising):** Vengono applicati filtri per pulire l'immagine.
    3.  **Binarizzazione (Otsu):** L'immagine viene convertita in bianco e nero per isolare gli elementi musicali.
    4.  **Rilevamento Pentagrammi:** Vengono identificate le linee orizzontali dei pentagrammi.
    5.  **Rilevamento Simboli:** Vengono riconosciuti chiavi, indicazioni di tempo e altre primitive musicali.

### 5. Aggiornamento dei Risultati su MongoDB

-   Al termine del processamento, il backend aggiorna il documento MongoDB creato al punto 3.
-   Il campo `analysis` viene popolato con i risultati ottenuti (tonalità, tempo, numero di battute, etc.).
-   Lo `status` del documento viene aggiornato a `"analyzed"`.

### 6. Visualizzazione e Manipolazione sul Frontend

-   **Recupero Dati:** Quando l'utente naviga nelle pagine `History`, `Editor` o `Analysis`, il frontend utilizza le funzioni API (`lib/api.ts`) per interrogare il backend.
-   **Chiamata API:** Il backend riceve la richiesta (es. `GET /api/sheetmusic/<id>`), interroga MongoDB e restituisce i dati dello spartito in formato JSON.
-   **Visualizzazione:** Il frontend riceve i dati, incluso l'URL pubblico dell'immagine su MinIO, e li utilizza per renderizzare i componenti. L'immagine dello spartito viene caricata direttamente da MinIO.
-   **Modifiche (Annotazioni):**
    -   Quando un utente aggiunge un'annotazione nell'editor, il frontend invia una richiesta `PUT` a `/api/sheetmusic/<id>` con i nuovi dati.
    -   Il backend aggiorna il documento corrispondente in MongoDB, aggiungendo l'annotazione all'array `annotations` della pagina corretta.

---

## Architettura dei Dati

La separazione tra metadati e file binari è una scelta architetturale strategica:

-   **MongoDB (Metadati):**
    -   **Contenuto:** Informazioni strutturate, leggere e facilmente indicizzabili (JSON).
    -   **Vantaggi:** Query veloci, flessibilità dello schema, facilità di aggiornamento per campi specifici (es. aggiungere un'annotazione senza modificare l'intero spartito).

-   **MinIO/S3 (File Binari):**
    -   **Contenuto:** File di grandi dimensioni (immagini, PDF).
    -   **Vantaggi:** Ottimizzato per lo storage e la distribuzione di file statici, scalabilità, gestione efficiente della banda.

Questa architettura garantisce che il database rimanga snello e performante, delegando lo storage di file pesanti a un servizio specializzato.
