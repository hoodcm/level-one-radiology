import React, { useState, Suspense } from 'react';
import { LightStackViewer } from './light/LightStackViewer';
import { Dialog, DialogContent } from './ui/dialog';

// Dynamically import the full DICOM viewer
const FullDicomViewer = React.lazy(() => import('./dicom/DicomViewer').then(module => ({ 
  default: module.DicomViewer 
})));

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

  // Mock DICOM data for full viewer - in production this would be fetched based on studyId
  const mockDicomData = {
    patientName: 'Patient Study',
    studyDate: new Date().toISOString().split('T')[0],
    modality: 'CT',
    bodyPart: 'Abdomen',
    images: Array.from({ length: manifest.slices }, (_, i) => ({
      id: i + 1,
      url: `${manifest.baseUrl}/${i + 1}.webp`,
      name: `Slice ${String(i + 1).padStart(3, '0')}`
    }))
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
              dicomData={mockDicomData}
              onClose={handleCloseFull}
            />
          </Suspense>
        </DialogContent>
      </Dialog>
    </>
  );
}