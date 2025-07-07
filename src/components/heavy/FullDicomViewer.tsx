import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface FullDicomViewerProps {
  studyId: string;
  onClose?: () => void;
}

export default function FullDicomViewer({ studyId, onClose }: FullDicomViewerProps) {
  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between text-white">
          <h2 className="text-xl font-semibold">Advanced DICOM Viewer</h2>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-gray-700"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-4">Full viewer for study: {studyId}</h3>
          <p className="text-gray-400">OHIF/Cornerstone integration will be implemented here</p>
        </div>
      </div>
    </div>
  );
}