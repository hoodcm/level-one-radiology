
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

interface LightStackViewerProps {
  manifest: {
    baseUrl: string;
    slices: number;
  };
  onOpenFullViewer?: () => void;
  interactive?: boolean;
  fullScreen?: boolean;
}

export function LightStackViewer({ manifest, onOpenFullViewer, interactive = true, fullScreen = false }: LightStackViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentSlice, setCurrentSlice] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  
  // Touch handling state
  const [isDragging, setIsDragging] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastPinchDistance, setLastPinchDistance] = useState(0);
  
  // Image loading state
  const [loadedImages, setLoadedImages] = useState<Map<number, HTMLImageElement>>(new Map());
  const [currentImage, setCurrentImage] = useState<HTMLImageElement | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);

  // Generate image URLs from manifest
  const getSliceUrl = (sliceIndex: number) => {
    const sliceNumber = sliceIndex + 1;
    
    // Check if baseUrl is external (contains http)
    if (manifest.baseUrl.includes('http')) {
      // External URL (like Unsplash) - append slice as query parameter
      return `${manifest.baseUrl}?w=800&h=600&fit=crop&auto=format&q=80&slice=${sliceNumber}`;
    } else {
      // Local file path - generate proper filename
      const paddedNumber = sliceNumber.toString().padStart(3, '0');
      return `${manifest.baseUrl}-${paddedNumber}.jpg`;
    }
  };

  // Preload images
  useEffect(() => {
    const preloadImage = (sliceIndex: number) => {
      if (loadedImages.has(sliceIndex) || sliceIndex < 0 || sliceIndex >= manifest.slices) return;
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setLoadedImages(prev => new Map(prev).set(sliceIndex, img));
        if (sliceIndex === currentSlice) {
          setCurrentImage(img);
          setImageLoadError(false);
        }
      };
      img.onerror = (error) => {
        console.error(`Failed to load image for slice ${sliceIndex}:`, error);
        console.log(`Attempted URL: ${getSliceUrl(sliceIndex)}`);
        if (sliceIndex === currentSlice) {
          setImageLoadError(true);
        }
      };
      img.src = getSliceUrl(sliceIndex);
    };

    // Preload current and adjacent slices
    preloadImage(currentSlice);
    if (currentSlice > 0) preloadImage(currentSlice - 1);
    if (currentSlice < manifest.slices - 1) preloadImage(currentSlice + 1);
  }, [currentSlice, manifest.slices, manifest.baseUrl, loadedImages]);

  // Update current image when slice changes
  useEffect(() => {
    const img = loadedImages.get(currentSlice);
    if (img) {
      setCurrentImage(img);
      setImageLoadError(false);
    }
  }, [currentSlice, loadedImages]);

  // Canvas rendering
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear canvas with black background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (imageLoadError) {
      // Show error message
      ctx.fillStyle = '#ffffff';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Failed to load image', canvas.width / 2, canvas.height / 2);
      ctx.fillText(`Slice ${currentSlice + 1}/${manifest.slices}`, canvas.width / 2, canvas.height / 2 + 25);
      return;
    }

    if (!currentImage) return;

    // Calculate scaling to fit image in viewport while maintaining aspect ratio
    const canvasAspect = canvas.width / canvas.height;
    const imageAspect = currentImage.width / currentImage.height;
    
    let baseScale;
    if (imageAspect > canvasAspect) {
      // Image is wider - fit to width
      baseScale = canvas.width / currentImage.width;
    } else {
      // Image is taller - fit to height
      baseScale = canvas.height / currentImage.height;
    }

    // Apply transformations
    ctx.save();
    ctx.translate(canvas.width / 2 + pan.x, canvas.height / 2 + pan.y);
    ctx.scale(zoom * baseScale, zoom * baseScale);

    // Draw image centered
    ctx.drawImage(
      currentImage,
      -currentImage.width / 2,
      -currentImage.height / 2,
      currentImage.width,
      currentImage.height
    );

    ctx.restore();
  }, [currentImage, zoom, pan, imageLoadError, currentSlice, manifest.slices]);

  // Setup canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      renderCanvas();
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [renderCanvas]);

  // Render when dependencies change
  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Touch event utilities
  const getTouchDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getTouchCenter = (touches: React.TouchList) => {
    if (touches.length < 2) return { x: 0, y: 0 };
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2,
    };
  };

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    
    if (e.touches.length === 1) {
      // Single touch - prepare for pan or slice navigation
      const touch = e.touches[0];
      setDragStart({ x: touch.clientX, y: touch.clientY });
      setIsDragging(true);
      setIsZooming(false);
    } else if (e.touches.length === 2) {
      // Two touches - pinch zoom
      const distance = getTouchDistance(e.touches);
      const center = getTouchCenter(e.touches);
      
      setLastPinchDistance(distance);
      setDragStart(center);
      setIsDragging(false);
      setIsZooming(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    
    if (e.touches.length === 1 && isDragging) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - dragStart.x;
      const deltaY = touch.clientY - dragStart.y;
      
      // Vertical gesture for slice navigation (when not zoomed)
      if (zoom <= 1.1 && Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 20) {
        const sensitivity = 100;
        if (deltaY > sensitivity && currentSlice > 0) {
          setCurrentSlice(prev => prev - 1);
          setDragStart({ x: touch.clientX, y: touch.clientY });
        } else if (deltaY < -sensitivity && currentSlice < manifest.slices - 1) {
          setCurrentSlice(prev => prev + 1);
          setDragStart({ x: touch.clientX, y: touch.clientY });
        }
      } else {
        // Pan when zoomed
        setPan(prev => ({
          x: prev.x + deltaX * 0.8,
          y: prev.y + deltaY * 0.8,
        }));
        setDragStart({ x: touch.clientX, y: touch.clientY });
      }
    } else if (e.touches.length === 2 && isZooming) {
      const distance = getTouchDistance(e.touches);
      
      if (lastPinchDistance > 0) {
        // Pinch to zoom
        const scale = distance / lastPinchDistance;
        const newZoom = Math.max(0.5, Math.min(5, zoom * scale));
        setZoom(newZoom);
      }
      
      setLastPinchDistance(distance);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setIsZooming(false);
    setLastPinchDistance(0);
  };

  // Double tap to reset
  const handleDoubleClick = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const containerStyle = fullScreen 
    ? { position: 'fixed' as const, inset: 0, width: '100vw', height: '100vh' }
    : { aspectRatio: '4/3', minHeight: '300px' };

  return (
    <div className={`w-full bg-black relative ${fullScreen ? 'fixed inset-0' : ''}`} style={containerStyle}>
      {/* Canvas container */}
      <div 
        ref={containerRef}
        className="w-full h-full relative overflow-hidden"
        onTouchStart={interactive ? handleTouchStart : undefined}
        onTouchMove={interactive ? handleTouchMove : undefined}
        onTouchEnd={interactive ? handleTouchEnd : undefined}
        onDoubleClick={interactive ? handleDoubleClick : undefined}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full touch-none"
          style={{ touchAction: 'none' }}
        />
        
        {/* Slice counter */}
        <div className="absolute top-4 left-4 text-white text-xs bg-black/50 px-3 py-2 rounded opacity-90 pointer-events-none">
          {currentSlice + 1}/{manifest.slices}
        </div>
        
        {/* Zoom indicator */}
        <div className="absolute top-4 right-4 text-white text-xs bg-black/50 px-3 py-2 rounded opacity-90 pointer-events-none">
          {(zoom * 100).toFixed(0)}%
        </div>
        
        {/* Loading/Error indicator */}
        {!currentImage && !imageLoadError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
              <p>Loading slice {currentSlice + 1}...</p>
            </div>
          </div>
        )}

        {/* Full Viewer button */}
        {onOpenFullViewer && (
          <Button
            onClick={onOpenFullViewer}
            className="absolute bottom-4 right-4 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
            size="sm"
          >
            <Eye className="w-4 h-4 mr-2" />
            Full Viewer
          </Button>
        )}
      </div>
    </div>
  );
}
