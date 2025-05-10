
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Search, Filter, FileSearch, MoreHorizontal } from "lucide-react";

type Study = {
  id: string;
  patientName: string;
  patientId: string;
  modality: string;
  studyDate: string;
  status: "pending" | "completed" | "scheduled";
  priority: "routine" | "urgent" | "stat";
  referringPhysician: string;
  description: string;
};

const mockStudies: Study[] = [
  {
    id: "STU-12345",
    patientName: "John Smith",
    patientId: "PAT-7890",
    modality: "CT",
    studyDate: "2025-05-10",
    status: "pending",
    priority: "routine",
    referringPhysician: "Dr. Reynolds",
    description: "Chest CT with contrast"
  },
  {
    id: "STU-12346",
    patientName: "Emma Johnson",
    patientId: "PAT-7891",
    modality: "MRI",
    studyDate: "2025-05-09",
    status: "completed",
    priority: "routine",
    referringPhysician: "Dr. Chen",
    description: "Brain MRI"
  },
  {
    id: "STU-12347",
    patientName: "Robert Davis",
    patientId: "PAT-7892",
    modality: "X-Ray",
    studyDate: "2025-05-10",
    status: "scheduled",
    priority: "urgent",
    referringPhysician: "Dr. Garcia",
    description: "Chest X-Ray, PA and Lateral"
  },
  {
    id: "STU-12348",
    patientName: "Sarah Wilson",
    patientId: "PAT-7893",
    modality: "Ultrasound",
    studyDate: "2025-05-11",
    status: "pending",
    priority: "stat",
    referringPhysician: "Dr. Patel",
    description: "Abdominal Ultrasound"
  },
  {
    id: "STU-12349",
    patientName: "Michael Brown",
    patientId: "PAT-7894",
    modality: "CT",
    studyDate: "2025-05-09",
    status: "completed",
    priority: "urgent",
    referringPhysician: "Dr. Jones",
    description: "Head CT without contrast"
  },
  {
    id: "STU-12350",
    patientName: "Lisa Taylor",
    patientId: "PAT-7895",
    modality: "MRI",
    studyDate: "2025-05-08",
    status: "completed",
    priority: "routine",
    referringPhysician: "Dr. Lee",
    description: "Lumbar Spine MRI"
  },
  {
    id: "STU-12351",
    patientName: "David Wilson",
    patientId: "PAT-7896",
    modality: "CT",
    studyDate: "2025-05-10",
    status: "pending",
    priority: "stat",
    referringPhysician: "Dr. Martinez",
    description: "Abdominal CT with contrast"
  }
];

const StudyWorklist = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [studies] = useState<Study[]>(mockStudies);
  const [statusFilter, setStatusFilter] = useState<Study["status"] | "all">("all");
  
  // Filter studies by search query and status
  const filteredStudies = studies.filter(study => {
    const matchesSearch = 
      study.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      study.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      study.id.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === "all" || study.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Status badge styles
  const getStatusBadge = (status: Study["status"]) => {
    switch (status) {
      case "completed":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      case "pending":
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">Pending</Badge>;
      case "scheduled":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Scheduled</Badge>;
      default:
        return null;
    }
  };

  // Priority badge styles
  const getPriorityBadge = (priority: Study["priority"]) => {
    switch (priority) {
      case "stat":
        return <Badge className="bg-red-600">STAT</Badge>;
      case "urgent":
        return <Badge className="bg-amber-500">Urgent</Badge>;
      case "routine":
        return <Badge className="bg-green-600">Routine</Badge>;
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Study Worklist</h1>
          <p className="text-muted-foreground">Manage and view imaging studies</p>
        </div>
        
        <Button>
          <FileSearch className="mr-2 h-4 w-4" />
          New Study
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="w-full sm:w-auto relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search studies..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                {statusFilter === "all" ? "All Status" : 
                  statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                All Status
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                Pending
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("scheduled")}>
                Scheduled
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("completed")}>
                Completed
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm">Export</Button>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Study ID</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Modality</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Referring MD</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudies.length > 0 ? (
              filteredStudies.map((study) => (
                <TableRow key={study.id}>
                  <TableCell className="font-medium">{study.id}</TableCell>
                  <TableCell>
                    {study.patientName}
                    <div className="text-xs text-gray-500">{study.patientId}</div>
                  </TableCell>
                  <TableCell>{study.description}</TableCell>
                  <TableCell>{study.modality}</TableCell>
                  <TableCell>{study.studyDate}</TableCell>
                  <TableCell>{getStatusBadge(study.status)}</TableCell>
                  <TableCell>{getPriorityBadge(study.priority)}</TableCell>
                  <TableCell>{study.referringPhysician}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Study</DropdownMenuItem>
                        <DropdownMenuItem>Create Report</DropdownMenuItem>
                        <DropdownMenuItem>Edit Details</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Cancel Study</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No studies found matching your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default StudyWorklist;
