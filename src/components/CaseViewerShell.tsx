import React, { useState, Suspense } from 'react';
import { LightStackViewer } from './light/LightStackViewer';
import { Dialog, DialogContent } from './ui/dialog';

// Dynamically import the full DICOM viewer
const FullDicomViewer = React.lazy(() => import('./heavy/FullDicomViewer'));

interface CaseViewerShellProps {
  manifest: {
    baseUrl: string;
    slices: number;
  };
  studyId?: string;
}

export function CaseViewerShell({ manifest, studyId }: CaseViewerShellProps) {
  const [showFull, setShowFull] = useState(false);

  const handleOpenFullViewer = () => {
    setShowFull(true);
  };

  const handleCloseFull = () => {
    setShowFull(false);
  };


  return (
    <>
      {/* Light Stack Viewer - Default */}
      <LightStackViewer 
        manifest={manifest}
        onOpenFullViewer={handleOpenFullViewer}
      />

      {/* Full DICOM Viewer Modal */}
      <Dialog open={showFull} onOpenChange={setShowFull}>
        <DialogContent className="max-w-full max-h-full w-screen h-screen p-0 bg-black border-0">
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