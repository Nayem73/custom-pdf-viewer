import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@mui/material';
import pencilIcon from './asset/pencil.png';
import eraserIcon from './asset/eraser.png';

const Canvas = () => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState(null); // Default mode is null
  const [lastPoint, setLastPoint] = useState(null);
  const [paths, setPaths] = useState([]); // Store paths for redrawing
  const eraserSize = 20; // Size of the eraser, adjust as needed

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    context.strokeStyle = 'black'; // Default color
    context.lineWidth = 2;
    context.lineCap = 'round'; // Smooth end of lines
    context.lineJoin = 'round'; // Smooth joins between lines
    context.imageSmoothingEnabled = true; // Enable image smoothing

    contextRef.current = context;

    // Redraw all paths when the component mounts
    redrawPaths(context, paths);
  }, [paths]);

  const startDrawing = (e) => {
    if (mode === null) return; // Do nothing if no mode is selected

    const { offsetX, offsetY } = e.nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX * window.devicePixelRatio, offsetY * window.devicePixelRatio);
    setIsDrawing(true);
    setLastPoint({ x: offsetX * window.devicePixelRatio, y: offsetY * window.devicePixelRatio });
  };

  const draw = (e) => {
    if (!isDrawing || mode === null) return; // Do nothing if not drawing or no mode is selected

    const { offsetX, offsetY } = e.nativeEvent;
    const scaledX = offsetX * window.devicePixelRatio;
    const scaledY = offsetY * window.devicePixelRatio;

    if (mode === 'eraser') {
      contextRef.current.globalCompositeOperation = 'destination-out';
      contextRef.current.lineWidth = eraserSize; // Eraser size
      contextRef.current.lineCap = 'round';
      contextRef.current.lineJoin = 'round';
      contextRef.current.arc(scaledX, scaledY, eraserSize / 2, 0, 2 * Math.PI); // Use circle for eraser
      contextRef.current.fill();
    } else {
      contextRef.current.globalCompositeOperation = 'source-over';
      contextRef.current.lineWidth = 2; // Pencil size
      contextRef.current.strokeStyle = 'red'; // Pencil color

      if (lastPoint) {
        contextRef.current.quadraticCurveTo(
          lastPoint.x,
          lastPoint.y,
          (lastPoint.x + scaledX) / 2,
          (lastPoint.y + scaledY) / 2
        );
        contextRef.current.stroke();
        setLastPoint({ x: scaledX, y: scaledY });
      }
    }
  };

  const stopDrawing = () => {
    if (mode === null) return; // Do nothing if no mode is selected

    contextRef.current.closePath();
    setIsDrawing(false);
    setLastPoint(null);

    // Add the current path to the paths array
    const newPath = contextRef.current.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
    setPaths([...paths, newPath]);
  };

  const redrawPaths = (context, paths) => {
    paths.forEach((path) => {
      context.putImageData(path, 0, 0);
    });
  };

  const getCursorStyle = () => {
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
