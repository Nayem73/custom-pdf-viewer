import React, { useRef, useState, useEffect } from 'react';

const Canvas = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawings, setDrawings] = useState([]); // To store the drawings

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Adjust the canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    context.strokeStyle = 'black';
    context.lineWidth = 2;
    context.lineCap = 'round';

    const getMousePos = (canvas, evt) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top,
      };
    };

    const startDrawing = (e) => {
      setIsDrawing(true);
      const pos = getMousePos(canvas, e);
      context.beginPath();
      context.moveTo(pos.x, pos.y);
      setDrawings((prevDrawings) => [
        ...prevDrawings,
        { x: pos.x, y: pos.y, isStartingPoint: true },
      ]);
    };

    const draw = (e) => {
      if (!isDrawing) return;
      const pos = getMousePos(canvas, e);
      context.lineTo(pos.x, pos.y);
      context.stroke();
      setDrawings((prevDrawings) => [
        ...prevDrawings,
        { x: pos.x, y: pos.y, isStartingPoint: false },
      ]);
    };

    const stopDrawing = () => {
      setIsDrawing(false);
      context.closePath();
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseout', stopDrawing);
    };
  }, [isDrawing]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Clear the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Redraw all stored drawings
    context.beginPath();
    drawings.forEach((point, index) => {
      if (point.isStartingPoint) {
        context.moveTo(point.x, point.y);
      } else {
        context.lineTo(point.x, point.y);
      }
    });
    context.stroke();
    context.closePath();
  }, [drawings]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
    />
  );
};

export default Canvas;
