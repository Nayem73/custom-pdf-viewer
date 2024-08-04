import React, { useState, useEffect, useRef } from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import Canvas from './Canvas';

function App() {
  const viewerRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [showCanvas, setShowCanvas] = useState(true);

  const handleZoom = (newZoom) => {
    setZoom(newZoom);
  };

  const resetView = () => {
    setShowCanvas(false);
    setTimeout(() => {
      setShowCanvas(true);
    }, 0); // Triggers a re-render to clear the canvas
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        resetView();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="App" style={{ position: 'relative', height: '100vh' }}>
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
        <div style={{ height: '100%', width: '100%', overflow: 'auto' }} ref={viewerRef}>
          <Viewer fileUrl="23_Nayem_Mehedi.pdf" onZoom={handleZoom} />
        </div>
      </Worker>
      {showCanvas && <Canvas viewerRef={viewerRef} zoom={zoom} />}
    </div>
  );
}

export default App;
