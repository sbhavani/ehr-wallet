
import { StudyViewer } from "@/components/pacs/StudyViewer";

const PACSViewer = () => {
  return (
    <div className="space-y-6 h-[calc(100vh-8rem)]">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">PACS Viewer</h1>
        <p className="text-muted-foreground">View and analyze diagnostic imaging studies</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 h-[calc(100%-5rem)]">
        <StudyViewer />
      </div>
    </div>
  );
};

export default PACSViewer;
