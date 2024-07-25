import React, { useRef, useState, useEffect } from 'react';

const Canvas = () => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [paths, setPaths] = useState([]); // To store the drawings

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.strokeStyle = 'black';
    context.lineWidth = 2;
    context.lineCap = 'round';

    contextRef.current = context;
  }, []);

  const startDrawing = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    const newPath = { x: offsetX, y: offsetY, isStartingPoint: true };
    setPaths((prevPaths) => [...prevPaths, newPath]);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;

    const { offsetX, offsetY } = e.nativeEvent;
    const newPath = { x: offsetX, y: offsetY, isStartingPoint: false };

    setPaths((prevPaths) => {
      const updatedPaths = [...prevPaths, newPath];
      redrawPaths(updatedPaths);
      return updatedPaths;
    });
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const redrawPaths = (paths) => {
    const canvas = canvasRef.current;
    const context = contextRef.current;

    context.clearRect(0, 0, canvas.width, canvas.height);

    context.beginPath();
    paths.forEach((point) => {
      if (point.isStartingPoint) {
        context.moveTo(point.x, point.y);
      } else {
        context.lineTo(point.x, point.y);
      }
      context.stroke();
    });
    context.closePath();
  };

  return (
    <canvas
      ref={canvasRef}
      width={window.innerWidth}
      height={window.innerHeight}
      style={{ position: 'absolute', top: 0, left: 0 }}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseOut={stopDrawing}
    />
  );
};

export default Canvas;
