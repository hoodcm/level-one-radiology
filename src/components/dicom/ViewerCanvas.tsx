import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ProgressiveImageLoader } from './ProgressiveImageLoader';
import { ImagePreloader } from './ImagePreloader';

interface ViewerCanvasProps {
  imageUrl: string;
  zoom: number;
  pan: { x: number; y: number };
  windowWidth: number;
  windowCenter: number;
  brightness: number;
  contrast: number;
  activeTool: 'pan' | 'zoom' | 'windowing';
  onZoomChange: (zoom: number) => void;
  onPanChange: (pan: { x: number; y: number }) => void;
  onWindowingChange: (width: number, center: number) => void;
}

export function ViewerCanvas({
  imageUrl,
  zoom,
  pan,
  windowWidth,
  windowCenter,
  brightness,
  contrast,
  activeTool,
  onZoomChange,
  onPanChange,
  onWindowingChange,
}: ViewerCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageData, setImageData] = useState<HTMLImageElement | null>(null);
  const [currentQuality, setCurrentQuality] = useState<'low' | 'medium' | 'high'>('low');

  // Progressive image loading
  const handleProgressiveImageLoad = (loadedImage: HTMLImageElement, quality: string) => {
    setImageData(loadedImage);
    setCurrentQuality(quality as 'low' | 'medium' | 'high');
    console.log(`Progressive load complete: ${quality} quality`);
  };

  const handleProgressiveImageError = (error: Error) => {
    console.error('Progressive image load error:', error);
  };

  // Generate progressive resolutions
  const generateProgressiveResolutions = (url: string) => {
    return [
      { url: url, quality: 'low' as const, size: 1 },
      { url: url, quality: 'medium' as const, size: 2 },
      { url: url, quality: 'high' as const, size: 3 }
    ];
  };

  // Render canvas
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !imageData) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply transformations
    ctx.save();
    ctx.translate(canvas.width / 2 + pan.x, canvas.height / 2 + pan.y);
    ctx.scale(zoom, zoom);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Apply image filters for windowing, brightness, and contrast
    ctx.filter = `brightness(${100 + brightness}%) contrast(${100 + contrast}%)`;

    // Draw image centered
    ctx.drawImage(
      imageData,
      -imageData.width / 2,
      -imageData.height / 2,
      imageData.width,
      imageData.height
    );

    ctx.restore();
  }, [imageData, zoom, pan, windowWidth, windowCenter, brightness, contrast]);

  // Update canvas size
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      renderCanvas();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [renderCanvas]);

  // Render when dependencies change
  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    if (activeTool === 'pan') {
      onPanChange({
        x: pan.x + deltaX,
        y: pan.y + deltaY,
      });
    } else if (activeTool === 'windowing') {
      const sensitivity = 2;
      const newWidth = Math.max(1, windowWidth + deltaX * sensitivity);
      const newCenter = windowCenter + deltaY * sensitivity;
      onWindowingChange(newWidth, newCenter);
    }

    setDragStart({ x: e.clientX, y: e.clientY });
  }, [isDragging, activeTool, dragStart, pan, windowWidth, windowCenter]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    if (activeTool === 'zoom' || e.ctrlKey) {
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.max(0.1, Math.min(10, zoom * zoomFactor));
      onZoomChange(newZoom);
    }
  };

  const getCursor = () => {
    switch (activeTool) {
      case 'pan': return isDragging ? 'grabbing' : 'grab';
      case 'zoom': return 'zoom-in';
      case 'windowing': return 'crosshair';
      default: return 'default';
    }
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-full bg-black relative overflow-hidden"
      style={{ cursor: getCursor() }}
    >
      {/* Progressive image loading */}
      <ProgressiveImageLoader
        resolutions={generateProgressiveResolutions(imageUrl)}
        onImageLoad={handleProgressiveImageLoad}
        onError={handleProgressiveImageError}
        priority={true}
      />
      
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />
      
      {/* Image info overlay */}
      <div className="absolute top-4 left-4 text-white text-sm bg-black/50 px-2 py-1 rounded">
        Zoom: {(zoom * 100).toFixed(0)}% | Quality: {currentQuality}
      </div>
      
      <div className="absolute top-4 right-4 text-white text-sm bg-black/50 px-2 py-1 rounded">
        W: {windowWidth.toFixed(0)} | C: {windowCenter.toFixed(0)}
      </div>

      {/* Tool indicator */}
      <div className="absolute bottom-4 left-4 text-white text-xs bg-black/50 px-2 py-1 rounded">
        Tool: {activeTool.charAt(0).toUpperCase() + activeTool.slice(1)}
      </div>
    </div>
  );
}