import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@mui/material';
import pencilIcon from './asset/pencil.png';
import eraserIcon from './asset/eraser.png';

const Canvas = () => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState(null); // Default mode is null
  const [paths, setPaths] = useState([]); // Store paths as arrays of points
  const [currentPath, setCurrentPath] = useState([]); // Store points for the current path
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
    const scaledX = offsetX * window.devicePixelRatio;
    const scaledY = offsetY * window.devicePixelRatio;

    const context = contextRef.current;
    context.beginPath();
    context.moveTo(scaledX, scaledY);

    setIsDrawing(true);
    setCurrentPath([{ x: scaledX, y: scaledY }]);
  };

  const draw = (e) => {
    if (!isDrawing || mode === null) return; // Do nothing if not drawing or no mode is selected

    const { offsetX, offsetY } = e.nativeEvent;
    const scaledX = offsetX * window.devicePixelRatio;
    const scaledY = offsetY * window.devicePixelRatio;

    const context = contextRef.current;

    if (mode === 'eraser') {
      removeLines(scaledX, scaledY);
    } else {
      context.globalCompositeOperation = 'source-over';
      context.lineWidth = 2; // Pencil size
      context.strokeStyle = 'red'; // Pencil color

      context.lineTo(scaledX, scaledY);
      context.stroke();
      
      setCurrentPath([...currentPath, { x: scaledX, y: scaledY }]);
    }
  };

  const stopDrawing = () => {
    if (mode === null) return; // Do nothing if no mode is selected

    const context = contextRef.current;
    context.closePath();
    setIsDrawing(false);

    // Add the current path to the paths array
    if (mode === 'pencil') {
      setPaths([...paths, currentPath]);
    }

    setCurrentPath([]);
  };

  const removeLines = (x, y) => {
    const radius = eraserSize / 2;
    const newPaths = paths.filter(path => !isLineWithinEraser(path, x, y, radius));
    setPaths(newPaths);

    // Redraw all remaining paths
    const context = contextRef.current;
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    redrawPaths(context, newPaths);
  };

  const isLineWithinEraser = (line, x, y, radius) => {
    for (let i = 0; i < line.length - 1; i++) {
      const start = line[i];
      const end = line[i + 1];
      if (isPointNearLine(start, end, x, y, radius)) {
        return true;
      }
    }
    return false;
  };

  const isPointNearLine = (start, end, x, y, radius) => {
    const A = x - start.x;
    const B = y - start.y;
    const C = end.x - start.x;
    const D = end.y - start.y;
    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = -1;
    let ix, iy;

    if (len_sq !== 0) {
      param = dot / len_sq;
    }

    if (param < 0) {
      ix = start.x;
      iy = start.y;
    } else if (param > 1) {
      ix = end.x;
      iy = end.y;
    } else {
      ix = start.x + param * C;
      iy = start.y + param * D;
    }

    const dx = x - ix;
    const dy = y - iy;
    return (dx * dx + dy * dy) <= (radius * radius);
  };

  const redrawPaths = (context, paths) => {
    paths.forEach((path) => {
      context.beginPath();
      path.forEach((point, index) => {
        if (index === 0) {
          context.moveTo(point.x, point.y);
        } else {
          context.lineTo(point.x, point.y);
        }
      });
      context.stroke();
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
