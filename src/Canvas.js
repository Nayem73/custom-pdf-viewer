import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@mui/material';

const Canvas = () => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState('pencil'); // Default mode is pencil

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    context.strokeStyle = 'black';
    context.lineWidth = 2;
    context.lineCap = 'round';

    contextRef.current = context;
  }, []);

  const startDrawing = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;

    const { offsetX, offsetY } = e.nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();

    if (mode === 'eraser') {
      contextRef.current.globalCompositeOperation = 'destination-out';
      contextRef.current.lineWidth = 10; // Eraser size
    } else {
      contextRef.current.globalCompositeOperation = 'source-over';
      contextRef.current.lineWidth = 2; // Pencil size
    }
  };

  const stopDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  return (
    <div>
      <div style={{ position: 'absolute', zIndex: 10 }}>
        <Button variant="contained" color="primary" onClick={() => setMode('pencil')}>
          Pencil
        </Button>
        <Button variant="contained" color="secondary" onClick={() => setMode('eraser')}>
          Eraser
        </Button>
      </div>
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
      />
    </div>
  );
};

export default Canvas;
