# Scan Page Refactor

La pagina di scansione è stata refactorizzata per migliorare la manutenibilità e la separazione delle responsabilità.

## Struttura dei file

### Componenti (`/components/scan/`)
- **FileUpload.tsx**: Gestisce l'upload dei file tramite drag & drop e file picker
- **CameraCapture.tsx**: Gestisce la cattura da camera con rilevamento documenti
- **ImagePreview.tsx**: Mostra l'anteprima delle immagini con controlli di navigazione e gestione
- **OpenCVStatus.tsx**: Visualizza lo stato di inizializzazione di OpenCV
- **index.ts**: Barrel export per semplificare gli import

### Hooks (`/hooks/`)
- **useScanState.ts**: Gestisce lo stato locale della pagina di scansione
- **useOpenCV.ts**: Gestisce l'inizializzazione di OpenCV
- **useImageProcessing.ts**: Gestisce l'elaborazione e il salvataggio delle immagini

### Pagina principale (`/app/scan/page.tsx`)
La pagina principale ora è molto più pulita e focalizzata sulla logica di orchestrazione dei componenti.

## Vantaggi del refactor

1. **Separazione delle responsabilità**: Ogni componente ha una responsabilità specifica
2. **Riusabilità**: I componenti possono essere riutilizzati in altre parti dell'applicazione
3. **Testabilità**: I componenti più piccoli sono più facili da testare
4. **Manutenibilità**: Il codice è più facile da leggere e modificare
5. **Performance**: Solo i componenti necessari vengono ri-renderizzati
6. **Hooks personalizzati**: La logica di stato è incapsulata in hooks riutilizzabili

## Come utilizzare

I componenti sono progettati per essere utilizzati insieme nella pagina di scansione, ma possono anche essere utilizzati singolarmente se necessario.

```tsx
import { FileUpload, CameraCapture, ImagePreview, OpenCVStatus } from "@/components/scan";
import { useScanState, useOpenCV, useImageProcessing } from "@/hooks";

// Utilizzo nella pagina principale
const [state, actions] = useScanState();
const { isOpenCVReady } = useOpenCV();
const { processImages } = useImageProcessing();
```

## Pattern utilizzati

- **Custom Hooks**: Per la gestione dello stato e della logica
- **Compound Components**: I componenti lavorano insieme ma mantengono la loro indipendenza
- **Props Interface**: Ogni componente ha una interfaccia ben definita
- **Barrel Exports**: Per semplificare gli import
- **Single Responsibility**: Ogni modulo ha una responsabilità specifica
