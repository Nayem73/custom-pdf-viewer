import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@mui/material';
import pencilIcon from './asset/pencil.png';
import eraserIcon from './asset/eraser.png';

const Canvas = () => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState(null); // Default mode is null

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
    if (mode === null) return; // Do nothing if no mode is selected

    const { offsetX, offsetY } = e.nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || mode === null) return; // Do nothing if not drawing or no mode is selected

    const { offsetX, offsetY } = e.nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);

    if (mode === 'eraser') {
      contextRef.current.globalCompositeOperation = 'destination-out';
      contextRef.current.lineWidth = 10; // Eraser size
    } else {
      contextRef.current.globalCompositeOperation = 'source-over';
      contextRef.current.lineWidth = 1; // Pencil size
      contextRef.current.strokeStyle = 'red'; // Pencil color
    }

    contextRef.current.stroke();
  };

  const stopDrawing = () => {
    if (mode === null) return; // Do nothing if no mode is selected

    contextRef.current.closePath();
    setIsDrawing(false);
  };

  const getCursorStyle = () => {
    // Set the hotspot to the tip of the pencil or eraser icon
    const iconSize = 26; // Size of the icon
    const hotspotX = iconSize / 2 - 9; // Adjust this value if necessary
    const hotspotY = iconSize; // Set hotspot to the bottom of the icon

    if (mode === 'eraser') return `url(${eraserIcon}) ${hotspotX} ${hotspotY}, auto`;
    if (mode === 'pencil') return `url(${pencilIcon}) ${hotspotX} ${hotspotY}, auto`;
    return 'auto'; // Default cursor
  };

  return (
    <div>
      <div style={{ position: 'absolute', zIndex: 10 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setMode('pencil')}
        >
          Pencil
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => setMode('eraser')}
        >
          Eraser
        </Button>
        {/* Add your PDF Viewer button here */}
      </div>
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 1,
          cursor: getCursorStyle(),
        }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
      />
    </div>
  );
};

export default Canvas;
