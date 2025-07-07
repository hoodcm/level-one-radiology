
import React from 'react';
import { ViewerCanvas } from './ViewerCanvas';
import { ViewerControls } from './ViewerControls';
import { ViewerSidebar } from './ViewerSidebar';
import { ImageNavigator } from './ImageNavigator';
import { ImagePreloader } from './ImagePreloader';

interface DicomMainViewerProps {
  dicomData: {
    patientName: string;
    studyDate: string;
    modality: string;
    bodyPart: string;
    images: Array<{ id: number; url: string; name?: string }>;
  };
  currentImageIndex: number;
  zoom: number;
  pan: { x: number; y: number };
  windowWidth: number;
  windowCenter: number;
  brightness: number;
  contrast: number;
  activeTool: 'pan' | 'zoom' | 'windowing';
  showSidebar: boolean;
  onZoomChange: (zoom: number) => void;
  onPanChange: (pan: { x: number; y: number }) => void;
  onWindowingChange: (width: number, center: number) => void;
  onWindowWidthChange: (width: number) => void;
  onWindowCenterChange: (center: number) => void;
  onBrightnessChange: (brightness: number) => void;
  onContrastChange: (contrast: number) => void;
  onImageChange: (index: number) => void;
  onSidebarClose: () => void;
  onPresetApply: (width: number, center: number) => void;
}

export function DicomMainViewer({
  dicomData,
  currentImageIndex,
  zoom,
  pan,
  windowWidth,
  windowCenter,
  brightness,
  contrast,
  activeTool,
  showSidebar,
  onZoomChange,
  onPanChange,
  onWindowingChange,
  onWindowWidthChange,
  onWindowCenterChange,
  onBrightnessChange,
  onContrastChange,
  onImageChange,
  onSidebarClose,
  onPresetApply,
}: DicomMainViewerProps) {
  const handlePreloadComplete = (preloadedImages: any[]) => {
    console.log(`Preloaded ${preloadedImages.length} images for better performance`);
  };

  return (
    <div className="flex-1 flex bg-black">
      {/* Image preloader for performance */}
      <ImagePreloader
        images={dicomData.images}
        currentIndex={currentImageIndex}
        preloadRange={3}
        onPreloadComplete={handlePreloadComplete}
      />
      
      {/* Canvas area */}
      <div className="flex-1 relative">
        <ViewerCanvas
          imageUrl={dicomData.images[currentImageIndex].url}
          zoom={zoom}
          pan={pan}
          windowWidth={windowWidth}
          windowCenter={windowCenter}
          brightness={brightness}
          contrast={contrast}
          activeTool={activeTool}
          onZoomChange={onZoomChange}
          onPanChange={onPanChange}
          onWindowingChange={onWindowingChange}
        />
        
        {/* Controls overlay */}
        <ViewerControls
          zoom={zoom}
          windowWidth={windowWidth}
          windowCenter={windowCenter}
          brightness={brightness}
          contrast={contrast}
          onZoomChange={onZoomChange}
          onWindowWidthChange={onWindowWidthChange}
          onWindowCenterChange={onWindowCenterChange}
          onBrightnessChange={onBrightnessChange}
          onContrastChange={onContrastChange}
        />

        {/* Image navigation */}
        <ImageNavigator
          currentImageIndex={currentImageIndex}
          totalImages={dicomData.images.length}
          onImageChange={onImageChange}
          images={dicomData.images}
        />
      </div>

      {/* Sidebar */}
      {showSidebar && (
        <ViewerSidebar
          patientData={dicomData}
          currentImageIndex={currentImageIndex}
          onClose={onSidebarClose}
          onImageSelect={onImageChange}
          onPresetApply={onPresetApply}
        />
      )}
    </div>
  );
}
