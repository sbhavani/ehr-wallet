
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type Study = {
  id: string;
  patientName: string;
  patientId: string;
  modality: string;
  studyDate: string;
  status: "pending" | "completed" | "scheduled";
  priority: "routine" | "urgent" | "stat";
  referringPhysician: string;
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
    referringPhysician: "Dr. Reynolds"
  },
  {
    id: "STU-12346",
    patientName: "Emma Johnson",
    patientId: "PAT-7891",
    modality: "MRI",
    studyDate: "2025-05-09",
    status: "completed",
    priority: "routine",
    referringPhysician: "Dr. Chen"
  },
  {
    id: "STU-12347",
    patientName: "Robert Davis",
    patientId: "PAT-7892",
    modality: "X-Ray",
    studyDate: "2025-05-10",
    status: "scheduled",
    priority: "urgent",
    referringPhysician: "Dr. Garcia"
  },
  {
    id: "STU-12348",
    patientName: "Sarah Wilson",
    patientId: "PAT-7893",
    modality: "Ultrasound",
    studyDate: "2025-05-11",
    status: "pending",
    priority: "stat",
    referringPhysician: "Dr. Patel"
  },
  {
    id: "STU-12349",
    patientName: "Michael Brown",
    patientId: "PAT-7894",
    modality: "CT",
    studyDate: "2025-05-09",
    status: "completed",
    priority: "urgent",
    referringPhysician: "Dr. Jones"
  }
];

export const StudiesTable = () => {
  const [studies] = useState<Study[]>(mockStudies);

  // Status badge styles
  const getStatusBadge = (status: Study["status"]) => {
    switch (status) {
      case "completed":
        return <Badge variant="outline" className="bg-secondary text-secondary-foreground border-border">Completed</Badge>;
      case "pending":
        return <Badge variant="outline" className="bg-muted text-muted-foreground border-border">Pending</Badge>;
      case "scheduled":
        return <Badge variant="outline" className="bg-accent text-accent-foreground border-border">Scheduled</Badge>;
      default:
        return null;
    }
  };

  // Priority badge styles
  const getPriorityBadge = (priority: Study["priority"]) => {
    switch (priority) {
      case "stat":
        return <Badge className="bg-destructive text-destructive-foreground">STAT</Badge>;
      case "urgent":
        return <Badge className="bg-primary text-primary-foreground">Urgent</Badge>;
      case "routine":
        return <Badge className="bg-secondary text-secondary-foreground">Routine</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">Patient</TableHead>
            <TableHead>Study ID</TableHead>
            <TableHead>Modality</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Referring MD</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {studies.map((study) => (
            <TableRow key={study.id}>
              <TableCell className="font-medium">
                {study.patientName}
                <div className="text-xs text-muted-foreground">{study.patientId}</div>
              </TableCell>
              <TableCell>{study.id}</TableCell>
              <TableCell>{study.modality}</TableCell>
              <TableCell>{study.studyDate}</TableCell>
              <TableCell>{getStatusBadge(study.status)}</TableCell>
              <TableCell>{getPriorityBadge(study.priority)}</TableCell>
              <TableCell>{study.referringPhysician}</TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm" className="mr-2">View</Button>
                <Button variant="outline" size="sm">Report</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
