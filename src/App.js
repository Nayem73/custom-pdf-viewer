import React from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import Canvas from './Canvas';

function App() {
  return (
    <div className="App">
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
        <div style={{ height: '750px' }}>
          <Viewer fileUrl="23_Nayem_Mehedi.pdf" />
        </div>
      </Worker>
      <Canvas />
    </div>
  );
}

export default App;
