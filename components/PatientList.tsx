import React from 'react';
import { Search, User } from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';

const PatientList = () => {
  // Sample patient data for demonstration
  const patients = [
    { id: 1, name: 'John Smith', dob: '1985-05-12', mrn: 'MRN12345', lastVisit: '2023-04-15' },
    { id: 2, name: 'Sarah Johnson', dob: '1976-11-23', mrn: 'MRN23456', lastVisit: '2023-05-02' },
    { id: 3, name: 'Michael Brown', dob: '1992-08-30', mrn: 'MRN34567', lastVisit: '2023-05-10' },
    { id: 4, name: 'Emily Davis', dob: '1988-03-17', mrn: 'MRN45678', lastVisit: '2023-04-28' },
    { id: 5, name: 'Robert Wilson', dob: '1965-12-05', mrn: 'MRN56789', lastVisit: '2023-05-05' },
  ];

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patient List</h1>
          <p className="text-muted-foreground">Manage and view patient records</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/patients/register">
              <User className="mr-2 h-4 w-4" />
              Add Patient
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Search and filter section */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="text" 
            placeholder="Search patients..." 
            className="pl-8"
          />
        </div>
      </div>
      
      {/* Patient table */}
      <Card>
        <CardHeader className="px-6 py-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-semibold">Patients</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Date of Birth</TableHead>
                  <TableHead>MRN</TableHead>
                  <TableHead>Last Visit</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">{patient.name}</TableCell>
                    <TableCell>{patient.dob}</TableCell>
                    <TableCell>{patient.mrn}</TableCell>
                    <TableCell>{patient.lastVisit}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-primary">View</Button>
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-primary">Edit</Button>
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-destructive">Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-medium">1</span> to <span className="font-medium">5</span> of <span className="font-medium">5</span> results
            </div>
            
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm" disabled>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientList;
