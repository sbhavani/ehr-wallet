
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

// In a real app, you would fetch these from your PACS system
const mockStudyImages = [
  "/placeholder.svg",
  "/placeholder.svg",
  "/placeholder.svg",
  "/placeholder.svg",
];

const mockStudyData = {
  patientName: "John Smith",
  patientId: "PAT-7890",
  studyId: "STU-12345",
  modality: "CT",
  bodyPart: "CHEST",
  date: "2025-05-10",
  slices: 120,
  referring: "Dr. Reynolds",
};

export const StudyViewer = () => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [windowLevel, setWindowLevel] = useState(40);
  const [windowWidth, setWindowWidth] = useState(400);
  const [zoom, setZoom] = useState(100);
  const [layout, setLayout] = useState<"1x1" | "2x2">("1x1");
  
  const viewportRef = useRef<HTMLDivElement>(null);
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{mockStudyData.patientName}</h2>
          <p className="text-sm text-gray-500">
            {mockStudyData.patientId} • {mockStudyData.studyId} • 
            {mockStudyData.modality} {mockStudyData.bodyPart} • 
            {mockStudyData.date}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Report</Button>
          <Button variant="outline" size="sm">Share</Button>
          <Button variant="outline" size="sm">Export</Button>
        </div>
      </div>
      
      <div className="flex gap-4 h-[calc(100vh-250px)]">
        {/* Thumbnail sidebar */}
        <div className="w-24 bg-gray-100 rounded-lg p-2 overflow-y-auto">
          {mockStudyImages.map((img, index) => (
            <div
              key={index}
              className={cn(
                "mb-2 rounded border-2 cursor-pointer hover:opacity-80 transition-opacity",
                selectedImageIndex === index 
                  ? "border-medical-blue" 
                  : "border-transparent"
              )}
              onClick={() => setSelectedImageIndex(index)}
            >
              <img
                src={img}
                alt={`Image ${index + 1}`}
                className="w-full h-auto rounded"
              />
              <p className="text-xs text-center mt-1">{index + 1}</p>
            </div>
          ))}
        </div>
        
        {/* Main viewport */}
        <div className="flex-1 bg-black rounded-lg relative overflow-hidden" ref={viewportRef}>
          <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
            {selectedImageIndex + 1} / {mockStudyImages.length}
          </div>
          
          <div className="absolute top-2 right-2 flex gap-1">
            <Button variant="ghost" size="icon" className="w-8 h-8 bg-black bg-opacity-50 text-white">
              <span className="text-lg">+</span>
            </Button>
            <Button variant="ghost" size="icon" className="w-8 h-8 bg-black bg-opacity-50 text-white">
              <span className="text-lg">−</span>
            </Button>
          </div>
          
          <div className="h-full flex items-center justify-center">
            <img 
              src={mockStudyImages[selectedImageIndex]} 
              alt={`Study image ${selectedImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              style={{ 
                filter: `contrast(${windowLevel / 40})`,
                transform: `scale(${zoom / 100})`
              }}
            />
          </div>
          
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-full text-sm">
            W: {windowWidth} • L: {windowLevel} • {zoom}%
          </div>
        </div>
      </div>
      
      <div className="mt-4 bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Window Width</label>
            <Slider
              defaultValue={[windowWidth]}
              max={4000}
              step={10}
              onValueChange={(value) => setWindowWidth(value[0])}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0</span>
              <span>4000</span>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Window Level</label>
            <Slider
              defaultValue={[windowLevel]}
              max={4000}
              step={10}
              onValueChange={(value) => setWindowLevel(value[0])}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0</span>
              <span>4000</span>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Zoom</label>
            <Slider
              defaultValue={[zoom]}
              min={50}
              max={400}
              step={10}
              onValueChange={(value) => setZoom(value[0])}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>50%</span>
              <span>400%</span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between mt-4">
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Reset</Button>
            <Select defaultValue={layout} onValueChange={(value: "1x1" | "2x2") => setLayout(value)}>
              <SelectTrigger className="w-24 h-8">
                <SelectValue placeholder="Layout" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1x1">1×1</SelectItem>
                <SelectItem value="2x2">2×2</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Measure</Button>
            <Button variant="outline" size="sm">Annotate</Button>
            <Select defaultValue="bone">
              <SelectTrigger className="w-32 h-8">
                <SelectValue placeholder="Window Preset" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bone">Bone</SelectItem>
                <SelectItem value="lung">Lung</SelectItem>
                <SelectItem value="brain">Brain</SelectItem>
                <SelectItem value="abdomen">Abdomen</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};
