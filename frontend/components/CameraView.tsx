import React, { RefObject } from 'react';
import './CameraView.css';

interface CameraViewProps {
  videoRef: RefObject<HTMLVideoElement>;
  canvasRef: RefObject<HTMLCanvasElement>;
  sheetDetected: boolean;
}

const CameraView: React.FC<CameraViewProps> = ({ videoRef, canvasRef, sheetDetected }) => {
  return (
    <div className={`camera-container ${sheetDetected ? 'sheet-detected' : ''}`}>
      <video ref={videoRef} autoPlay playsInline className="video" />
      <canvas ref={canvasRef} className="canvas" />

      {/* Guide overlay when no sheet is detected */}
      {!sheetDetected && (
        <div className="guide-overlay">
          <div className="guide-box">
            <div className="corner top-left"></div>
            <div className="corner top-right"></div>
            <div className="corner bottom-left"></div>
            <div className="corner bottom-right"></div>
            <div className="guide-text">Inquadra lo spartito</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraView;