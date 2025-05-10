
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
import { User, Search, Filter } from "lucide-react";

type Patient = {
  id: string;
  name: string;
  dob: string;
  gender: string;
  phone: string;
  lastVisit: string;
};

const mockPatients: Patient[] = [
  {
    id: "PAT-7890",
    name: "John Smith",
    dob: "1975-05-15",
    gender: "Male",
    phone: "(555) 123-4567",
    lastVisit: "2025-05-01",
  },
  {
    id: "PAT-7891",
    name: "Emma Johnson",
    dob: "1982-09-23",
    gender: "Female",
    phone: "(555) 234-5678",
    lastVisit: "2025-05-03",
  },
  {
    id: "PAT-7892",
    name: "Robert Davis",
    dob: "1968-03-12",
    gender: "Male",
    phone: "(555) 345-6789",
    lastVisit: "2025-05-05",
  },
  {
    id: "PAT-7893",
    name: "Sarah Wilson",
    dob: "1990-07-30",
    gender: "Female",
    phone: "(555) 456-7890",
    lastVisit: "2025-05-07",
  },
  {
    id: "PAT-7894",
    name: "Michael Brown",
    dob: "1956-11-08",
    gender: "Male",
    phone: "(555) 567-8901",
    lastVisit: "2025-05-09",
  },
];

const PatientList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [patients] = useState<Patient[]>(mockPatients);
  
  // Filter patients by search query
  const filteredPatients = patients.filter(
    patient => 
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patient List</h1>
          <p className="text-muted-foreground">View and manage patient records</p>
        </div>
        
        <Button>
          <User className="mr-2 h-4 w-4" />
          New Patient
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="w-full sm:w-auto relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search patients..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm">Export</Button>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Patient ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Date of Birth</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Last Visit</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPatients.length > 0 ? (
              filteredPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{patient.id}</TableCell>
                  <TableCell>{patient.name}</TableCell>
                  <TableCell>{patient.dob}</TableCell>
                  <TableCell>{patient.gender}</TableCell>
                  <TableCell>{patient.phone}</TableCell>
                  <TableCell>{patient.lastVisit}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" className="mr-2">View</Button>
                    <Button variant="outline" size="sm">Edit</Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No patients found matching your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PatientList;
