import React, { useState } from 'react';
import { Maximize, Minimize, ZoomIn, ZoomOut, RotateCw, RotateCcw, Layers, Download, Share2 } from 'lucide-react';

const PACSViewer = () => {
  const [fullscreen, setFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotation, setRotation] = useState(0);
  
  // Sample image for demonstration
  const sampleImage = 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80';
  
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 10, 200));
  };
  
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 10, 50));
  };
  
  const handleRotateClockwise = () => {
    setRotation(prev => (prev + 90) % 360);
  };
  
  const handleRotateCounterClockwise = () => {
    setRotation(prev => (prev - 90 + 360) % 360);
  };
  
  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">PACS Viewer</h1>
        
        <div className="flex space-x-2">
          <div className="bg-white dark:bg-gray-800 rounded-md shadow p-2 flex space-x-1">
            <button 
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md" 
              onClick={handleZoomIn}
              aria-label="Zoom in"
            >
              <ZoomIn className="h-5 w-5" />
            </button>
            <button 
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md" 
              onClick={handleZoomOut}
              aria-label="Zoom out"
            >
              <ZoomOut className="h-5 w-5" />
            </button>
            <button 
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md" 
              onClick={handleRotateClockwise}
              aria-label="Rotate clockwise"
            >
              <RotateCw className="h-5 w-5" />
            </button>
            <button 
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md" 
              onClick={handleRotateCounterClockwise}
              aria-label="Rotate counter-clockwise"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
            <button 
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md" 
              onClick={toggleFullscreen}
              aria-label="Toggle fullscreen"
            >
              {fullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </button>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-md shadow p-2 flex space-x-1">
            <button 
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md" 
              aria-label="Series"
            >
              <Layers className="h-5 w-5" />
            </button>
            <button 
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md" 
              aria-label="Download"
            >
              <Download className="h-5 w-5" />
            </button>
            <button 
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md" 
              aria-label="Share"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Study Information</h2>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Patient Name</p>
              <p className="font-medium">John Smith</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Patient ID</p>
              <p className="font-medium">MRN12345</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Accession Number</p>
              <p className="font-medium">ACC123456</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Study Date</p>
              <p className="font-medium">2023-05-10</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Modality</p>
              <p className="font-medium">CT</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Description</p>
              <p className="font-medium">CT Chest without contrast</p>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-md font-semibold mb-2">Series</h3>
            <div className="space-y-2">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600">
                Series 1 - Axial (24 images)
              </div>
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600">
                Series 2 - Coronal (18 images)
              </div>
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600">
                Series 3 - Sagittal (18 images)
              </div>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-3 bg-black rounded-lg shadow flex items-center justify-center" style={{ minHeight: '70vh' }}>
          <div 
            className="relative" 
            style={{ 
              transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
              transition: 'transform 0.3s ease'
            }}
          >
            <img 
              src={sampleImage} 
              alt="Medical scan" 
              className="max-w-full max-h-[65vh]"
            />
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
              {zoomLevel}% | {rotation}°
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PACSViewer;
