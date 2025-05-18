import React from 'react';
import './Controls.css';

interface ControlsProps {
  streaming: boolean;
  capturedImage: string | null;
  onStartCamera: () => void;
  onCaptureImage: () => void;
  onProcessImage: () => void;
}

const Controls: React.FC<ControlsProps> = ({ streaming, capturedImage, onStartCamera, onCaptureImage, onProcessImage }) => {
  return (
    <div className="controls">
      <button
        className="btn start-btn"
        onClick={onStartCamera}
        disabled={streaming}
      >
        <i className="icon camera-icon"></i>
        Avvia Fotocamera
      </button>

      <button
        className="btn capture-btn"
        onClick={onCaptureImage}
        disabled={!streaming}
      >
        <i className="icon capture-icon"></i>
        Cattura Spartito
      </button>

      <button
        className="btn process-btn"
        onClick={onProcessImage}
        disabled={!capturedImage}
      >
        <i className="icon process-icon"></i>
        Elabora Immagine
      </button>
    </div>
  );
};

export default Controls;