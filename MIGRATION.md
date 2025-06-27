# Migrazione da useScanState a useScanStore

## Panoramica

Il nuovo sistema di gestione dei file utilizza Zustand per fornire una soluzione più performante e scalabile rispetto al precedente hook `useScanState` basato su React state.

## Vantaggi del nuovo sistema

### 🚀 Performance
- **Stato centralizzato**: Evita re-render inutili nei componenti che non utilizzano tutti i dati
- **Selettori ottimizzati**: Permette di sottoscrivere solo ai dati necessari
- **Gestione memoria**: Automatic cleanup delle Object URLs per prevenire memory leaks

### 🛡️ Affidabilità
- **Validazione file**: Controllo tipo, dimensione e duplicati
- **Error handling**: Gestione centralizzata degli errori
- **Progress tracking**: Monitoraggio del progresso di upload e processing
- **Persistenza**: Opzionale per lo stato dell'applicazione

### 🎯 Funzionalità avanzate
- **Drag & Drop ottimizzato**: Hook dedicato per drag and drop
- **File utilities**: Statistiche, validazione, gestione batch
- **TypeScript**: Tipizzazione completa per migliore DX

## Come migrare

### Opzione 1: Migrazione graduale (Consigliata)

Il vecchio hook `useScanState` è ancora disponibile e usa internamente il nuovo store:

```typescript
// Nessuna modifica necessaria - compatibilità mantenuta
const [state, actions] = useScanState();
```

### Opzione 2: Migrazione completa

Per componenti nuovi o per migliorare le performance:

```typescript
// Prima
import { useScanState } from '../hooks/useScanState';

function MyComponent() {
  const [state, actions] = useScanState();
  
  return (
    <div>
      {state.imageFiles.length} files
      <button onClick={() => actions.clearAll()}>Clear</button>
    </div>
  );
}

// Dopo - usando il nuovo store
import { useScanStore, useScanFiles, useScanStatus } from '../lib/store/useScanStore';

function MyComponent() {
  const files = useScanFiles(); // Solo i file
  const { clearAllFiles } = useScanStore(); // Solo le azioni necessarie
  
  return (
    <div>
      {files.length} files
      <button onClick={clearAllFiles}>Clear</button>
    </div>
  );
}

// Oppure usando selettori specifici per performance ottimali
function MyComponent() {
  const totalFiles = useScanStore(state => state.files.length);
  const clearAllFiles = useScanStore(state => state.clearAllFiles);
  
  return (
    <div>
      {totalFiles} files
      <button onClick={clearAllFiles}>Clear</button>
    </div>
  );
}
```

## Nuove funzionalità disponibili

### Upload con validazione avanzata

```typescript
import { useFileUpload } from '../hooks/useFileUpload';

function FileUploadComponent() {
  const { 
    uploadFiles, 
    handleFileInput, 
    getFileStats,
    canUpload 
  } = useFileUpload({
    maxFileSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 10,
    onError: (error) => console.error('Upload error:', error),
    onSuccess: (files) => console.log('Uploaded:', files.length, 'files')
  });

  const stats = getFileStats();

  return (
    <div>
      <input 
        type="file" 
        multiple 
        onChange={handleFileInput}
        disabled={!canUpload}
      />
      <p>{stats.count}/{stats.maxCount} files ({stats.totalSizeMB}MB)</p>
    </div>
  );
}
```

### Drag & Drop ottimizzato

```typescript
import { useDragAndDrop } from '../hooks/useFileUpload';

function DropZone() {
  const {
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
  } = useDragAndDrop();

  const isDragging = useScanStore(state => state.isDragging);

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={isDragging ? 'drag-active' : ''}
    >
      Drop your files here
    </div>
  );
}
```

### Progress tracking e statistiche

```typescript
import { useScanStore, useScanStats } from '../lib/store/useScanStore';

function ProgressComponent() {
  const { processingProgress, isUploading, error } = useScanStore(state => ({
    processingProgress: state.processingProgress,
    isUploading: state.isUploading,
    error: state.error
  }));
  
  const stats = useScanStats();

  return (
    <div>
      {isUploading && <p>Uploading...</p>}
      {processingProgress && <progress value={processingProgress} max={100} />}
      {error && <p className="error">{error}</p>}
      <p>Processed: {stats.processedFiles}/{stats.totalFiles}</p>
    </div>
  );
}
```

## API del nuovo store

### Stato
```typescript
interface ScanState {
  files: ScanFile[];           // File con metadata
  currentPreviewIndex: number; // Indice corrente
  processingStatus: 'idle' | 'processing' | 'success' | 'error';
  processingProgress?: number; // 0-100
  isDragging: boolean;         // Stato drag & drop
  isUploading: boolean;        // Stato upload
  error?: string;              // Ultimo errore
}
```

### Azioni principali
```typescript
// Gestione file
addFiles(files: File[]): Promise<void>
removeFile(id: string): void
moveFile(fromIndex: number, toIndex: number): void
clearAllFiles(): void

// Navigation
setCurrentPreviewIndex(index: number): void
goToNextPreview(): void
goToPreviousPreview(): void

// Status
setProcessingStatus(status): void
setProcessingProgress(progress: number): void
setError(error?: string): void

// Utilities
getFileById(id: string): ScanFile | undefined
getTotalFileSize(): number
getProcessedFilesCount(): number
```

### Selettori ottimizzati
```typescript
// Usa questi per performance migliori
const files = useScanFiles();
const currentPreview = useScanCurrentPreview();
const status = useScanStatus();
const stats = useScanStats();
```

## Migrazione step-by-step

1. **Testa la compatibilità**: Il codice esistente dovrebbe funzionare senza modifiche
2. **Identifica componenti pesanti**: Cerca componenti che si ri-renderizzano spesso
3. **Applica selettori**: Usa i selettori ottimizzati per i componenti identificati
4. **Aggiungi nuove funzionalità**: Implementa drag & drop, validation, progress tracking
5. **Rimuovi codice deprecato**: Quando tutti i componenti sono migrati

## Troubleshooting

### Il componente si ri-renderizza troppo spesso
**Soluzione**: Usa selettori specifici invece di tutto lo store
```typescript
// ❌ Causa re-render per ogni cambiamento
const store = useScanStore();

// ✅ Solo quando cambiano i file
const files = useScanFiles();
```

### Memory leak con le immagini
**Soluzione**: Il nuovo store gestisce automaticamente la cleanup delle Object URLs

### Errori di validazione
**Soluzione**: Usa `useFileUpload` con opzioni personalizzate per la validazione

### Stato non persistente
**Soluzione**: Configura la persistenza nel store se necessario
```typescript
// In useScanStore.ts, modifica le opzioni di persist
partialize: (state) => ({
  // Aggiungi i campi da persistere
  files: state.files, // Solo se necessario
  processingStatus: state.processingStatus,
}),
```
