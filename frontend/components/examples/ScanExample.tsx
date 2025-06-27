import React from 'react';
import { useScanStore, useScanFiles, useScanStatus, ScanFile } from '../../lib/store/useScanStore';
import { useDragAndDrop } from '../../hooks/useFileUpload';
import Image from 'next/image';

/**
 * Esempio di componente che utilizza il nuovo useScanStore
 * Mostra come migrare da useScanState con performance migliorate
 */
export function ScanExample() {
  // Uso di selettori ottimizzati per evitare re-render inutili
  const files = useScanFiles();
  const status = useScanStatus();
  const {
    removeFile,
    moveFileLeft,
    moveFileRight,
    setCurrentPreviewIndex,
    clearAllFiles,
    reset
  } = useScanStore();

  // Hook per drag & drop ottimizzato
  const {
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleFileInput,
    getFileStats,
    canUpload
  } = useDragAndDrop();

  const stats = getFileStats();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Scan File Manager (Nuovo Sistema)</h2>

      {/* Statistiche */}
      <div className="bg-gray-100 p-4 rounded-lg mb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-semibold">File:</span> {stats.count}/{stats.maxCount}
          </div>
          <div>
            <span className="font-semibold">Dimensione:</span> {stats.totalSizeMB}MB
          </div>
          <div>
            <span className="font-semibold">Processati:</span> {useScanStore.getState().getProcessedFilesCount()}
          </div>
          <div>
            <span className="font-semibold">Slots liberi:</span> {stats.remainingSlots}
          </div>
        </div>
      </div>

      {/* Status e Errori */}
      {status.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {status.error}
        </div>
      )}

      {status.isUploading && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          Caricamento in corso...
        </div>
      )}

      {status.processingProgress !== undefined && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Elaborazione</span>
            <span>{status.processingProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${status.processingProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Drop Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center mb-6 transition-colors
          ${status.isDragging
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
          }
          ${!canUpload ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <div className="space-y-4">
          <div className="text-4xl">📁</div>
          <div>
            <p className="text-lg font-medium">
              {status.isDragging ? 'Rilascia i file qui' : 'Trascina i file qui'}
            </p>
            <p className="text-sm text-gray-500">
              oppure clicca per selezionare
            </p>
          </div>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
            id="file-input"
            disabled={!canUpload}
          />
          <label
            htmlFor="file-input"
            className={`
              inline-block px-4 py-2 rounded-md text-sm font-medium
              ${canUpload
                ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }
            `}
          >
            Seleziona File
          </label>
        </div>
      </div>

      {/* Lista File */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">File caricati ({files.length})</h3>
            <div className="space-x-2">
              <button
                onClick={clearAllFiles}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                Cancella Tutti
              </button>
              <button
                onClick={reset}
                className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Reset Completo
              </button>
            </div>
          </div>

          <div className="grid gap-4">
            {files.map((file: ScanFile, index: number) => (
              <div
                key={file.id}
                className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50"
              >
                {/* Anteprima */}
                <div className="flex-shrink-0">
                  {/* <img
                    src={file.previewUrl}
                    alt={file.file.name}
                    className="w-16 h-16 object-cover rounded cursor-pointer"
                    onClick={() => setCurrentPreviewIndex(index)}
                  /> */}
                  <Image
                    src={file.previewUrl}
                    alt={file.file.name}
                    className="w-16 h-16 object-cover rounded cursor-pointer"
                    onClick={() => setCurrentPreviewIndex(index)}
                  />
                </div>

                {/* Info File */}
                <div className="flex-grow min-w-0">
                  <p className="font-medium truncate">{file.file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.file.size / (1024 * 1024)).toFixed(1)}MB
                  </p>
                  {file.processed && (
                    <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                      Processato
                    </span>
                  )}
                </div>

                {/* Progress */}
                {file.uploadProgress !== undefined && file.uploadProgress < 100 && (
                  <div className="w-20">
                    <div className="text-xs text-center">{file.uploadProgress}%</div>
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div
                        className="bg-blue-600 h-1 rounded-full"
                        style={{ width: `${file.uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Azioni */}
                <div className="flex space-x-1">
                  <button
                    onClick={() => moveFileLeft(index)}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    title="Sposta a sinistra"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => moveFileRight(index)}
                    disabled={index === files.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    title="Sposta a destra"
                  >
                    →
                  </button>
                  <button
                    onClick={() => removeFile(file.id)}
                    className="p-1 text-red-400 hover:text-red-600"
                    title="Rimuovi"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Demo Actions */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold mb-2">Azioni Demo:</h4>
        <div className="space-x-2">
          <button
            onClick={() => useScanStore.getState().setProcessingStatus('processing')}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded"
          >
            Simula Processing
          </button>
          <button
            onClick={() => {
              useScanStore.getState().setProcessingProgress(0);
              const interval = setInterval(() => {
                const current = useScanStore.getState().processingProgress || 0;
                if (current >= 100) {
                  clearInterval(interval);
                  useScanStore.getState().setProcessingStatus('success');
                } else {
                  useScanStore.getState().setProcessingProgress(current + 10);
                }
              }, 200);
            }}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded"
          >
            Simula Progress
          </button>
          <button
            onClick={() => useScanStore.getState().setError('Errore di esempio')}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded"
          >
            Simula Errore
          </button>
          <button
            onClick={() => {
              useScanStore.getState().setError(undefined);
              useScanStore.getState().setProcessingStatus('idle');
              useScanStore.getState().setProcessingProgress(undefined);
            }}
            className="px-3 py-1 text-sm bg-gray-600 text-white rounded"
          >
            Reset Status
          </button>
        </div>
      </div>
    </div>
  );
}
