import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@mui/material';
import pencilIcon from './asset/pencil.png';
import eraserIcon from './asset/eraser.png';

const Canvas = ({ viewerRef, zoom }) => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState(null);
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const eraserSize = 20;

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    context.strokeStyle = 'black';
    context.lineWidth = 2;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.imageSmoothingEnabled = true;

    contextRef.current = context;
    redrawPaths(context, paths);
  }, [paths]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = contextRef.current;

    canvas.style.transform = `scale(${zoom})`;
    canvas.style.transformOrigin = 'top left';

    redrawPaths(context, paths);
  }, [zoom]);

  const startDrawing = (e) => {
    if (mode === null) return;

    const { offsetX, offsetY } = e.nativeEvent;
    const scaledX = offsetX * window.devicePixelRatio / zoom;
    const scaledY = offsetY * window.devicePixelRatio / zoom;

    const context = contextRef.current;
    context.beginPath();
    context.moveTo(scaledX, scaledY);

    setIsDrawing(true);
    setCurrentPath([{ x: scaledX, y: scaledY }]);
  };

  const draw = (e) => {
    if (!isDrawing || mode === null) return;

    const { offsetX, offsetY } = e.nativeEvent;
    const scaledX = offsetX * window.devicePixelRatio / zoom;
    const scaledY = offsetY * window.devicePixelRatio / zoom;

    const context = contextRef.current;

    if (mode === 'eraser') {
      removeLineAtPoint(scaledX, scaledY);
    } else {
      context.globalCompositeOperation = 'source-over';
      context.lineWidth = 2;
      context.strokeStyle = 'red';

      context.lineTo(scaledX, scaledY);
      context.stroke();

      setCurrentPath([...currentPath, { x: scaledX, y: scaledY }]);
    }
  };

  const stopDrawing = () => {
    if (mode === null) return;

    const context = contextRef.current;
    context.closePath();
    setIsDrawing(false);

    if (mode === 'pencil') {
      setPaths([...paths, currentPath]);
    }

    setCurrentPath([]);
  };

  const removeLineAtPoint = (x, y) => {
    const radius = eraserSize / 2;
    const newPaths = paths.reduce((acc, path) => {
      if (Array.isArray(path)) {
        let splitPath = [];
        let currentSegment = [];

        path.forEach((point, index) => {
          if (index === 0) {
            currentSegment.push(point);
          } else {
            const prevPoint = path[index - 1];
            if (isPointNearLine(prevPoint, point, x, y, radius)) {
              if (currentSegment.length > 0) {
                splitPath.push(currentSegment);
                currentSegment = [];
              }
            } else {
              currentSegment.push(point);
            }
          }
        });

        if (currentSegment.length > 0) {
          splitPath.push(currentSegment);
        }

        acc.push(...splitPath.filter(segment => segment.length > 1));
      } else {
        acc.push(path);
      }
      return acc;
    }, []);

    setPaths(newPaths);
    const context = contextRef.current;
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    redrawPaths(context, newPaths);
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
      if (Array.isArray(path)) {
        context.beginPath();
        context.lineWidth = 2.5;
        context.strokeStyle = 'red';
        path.forEach((point, index) => {
          if (index === 0) {
            context.moveTo(point.x, point.y);
          } else {
            context.lineTo(point.x, point.y);
          }
        });
        context.stroke();
      }
    });
  };

  const getCursorStyle = () => {
    const iconSize = 26;
    const hotspotX = iconSize / 2 - 9;
    const hotspotY = iconSize;

    if (mode === 'eraser') return `url(${eraserIcon}) ${hotspotX} ${hotspotY}, auto`;
    if (mode === 'pencil') return `url(${pencilIcon}) ${hotspotX} ${hotspotY}, auto`;
    return 'auto';
  };

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', zIndex: 10, pointerEvents: 'auto' }}>
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
      </div>
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 5,
          cursor: getCursorStyle(),
          pointerEvents: mode ? 'auto' : 'none',
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
