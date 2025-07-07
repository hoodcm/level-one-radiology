
import React, { useState, Suspense } from 'react';
import { LightStackViewer } from './light/LightStackViewer';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { useMobile } from '@/hooks/use-mobile';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

// Dynamically import the full DICOM viewer
const FullDicomViewer = React.lazy(() => import('./heavy/FullDicomViewer'));

interface CaseViewerShellProps {
  manifest: {
    baseUrl: string;
    slices: number;
  };
  studyId?: string;
  children?: React.ReactNode;
}

export function CaseViewerShell({ manifest, studyId, children }: CaseViewerShellProps) {
  const [showFull, setShowFull] = useState(false);
  const [showMobileViewer, setShowMobileViewer] = useState(false);
  const isMobile = useMobile();

  const handleOpenFullViewer = () => {
    setShowFull(true);
  };

  const handleCloseFull = () => {
    setShowFull(false);
  };

  const handleCloseMobileViewer = () => {
    setShowMobileViewer(false);
  };

  if (isMobile) {
    // Mobile Layout
    return (
      <>
        <div className="w-full">
          {/* Thumbnail preview */}
          <div className="w-full max-h-48 overflow-hidden rounded-lg border border-border">
            <LightStackViewer 
              manifest={manifest}
              interactive={false}
            />
          </div>
          
          {/* View button */}
          <Button
            className="mt-3 w-full bg-primary text-primary-foreground font-semibold py-2 rounded-xl hover:bg-primary/90"
            onClick={() => setShowMobileViewer(true)}
          >
            View
          </Button>
          
          {/* Content below */}
          {children}
        </div>

        {/* Mobile full-screen viewer modal */}
        {showMobileViewer && (
          <div className="fixed inset-0 bg-black z-50">
            <button 
              className="absolute top-4 right-4 text-white text-2xl z-10" 
              onClick={handleCloseMobileViewer}
            >
              ✕
            </button>
            <LightStackViewer 
              manifest={manifest}
              interactive={true}
              fullScreen={true}
            />
          </div>
        )}

        {/* Full DICOM Viewer Modal */}
        <Dialog open={showFull} onOpenChange={setShowFull}>
          <DialogContent className="max-w-full max-h-full w-screen h-screen p-0 bg-black border-0">
            <VisuallyHidden>
              <DialogTitle>Advanced DICOM Viewer</DialogTitle>
              <DialogDescription>
                Full-featured medical imaging viewer with advanced tools and measurements
              </DialogDescription>
            </VisuallyHidden>
            <Suspense 
              fallback={
                <div className="flex items-center justify-center w-full h-full bg-black text-white">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-lg">Loading Full Viewer...</p>
                    <p className="text-sm text-white/70 mt-2">Initializing advanced DICOM tools</p>
                  </div>
                </div>
              }
            >
              <FullDicomViewer 
                studyId={studyId || 'unknown'}
                onClose={handleCloseFull}
              />
            </Suspense>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Desktop Layout
  return (
    <>
      <div className="flex flex-row gap-8">
        <div className="w-[35%] sticky top-20">
          <LightStackViewer 
            manifest={manifest}
            onOpenFullViewer={handleOpenFullViewer}
            interactive={true}
          />
        </div>
        <div className="w-[65%]">
          {children}
        </div>
      </div>

      {/* Full DICOM Viewer Modal */}
      <Dialog open={showFull} onOpenChange={setShowFull}>
        <DialogContent className="max-w-full max-h-full w-screen h-screen p-0 bg-black border-0">
          <VisuallyHidden>
            <DialogTitle>Advanced DICOM Viewer</DialogTitle>
            <DialogDescription>
              Full-featured medical imaging viewer with advanced tools and measurements
            </DialogDescription>
          </VisuallyHidden>
          <Suspense 
            fallback={
              <div className="flex items-center justify-center w-full h-full bg-black text-white">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-lg">Loading Full Viewer...</p>
                  <p className="text-sm text-white/70 mt-2">Initializing advanced DICOM tools</p>
                </div>
              </div>
            }
          >
            <FullDicomViewer 
              studyId={studyId || 'unknown'}
              onClose={handleCloseFull}
            />
          </Suspense>
        </DialogContent>
      </Dialog>
    </>
  );
}
