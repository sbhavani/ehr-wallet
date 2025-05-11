import { useState } from 'react';
import Head from 'next/head';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { FileText, Download, Filter } from 'lucide-react';

// Mock data for demonstration
const reports = [
  { 
    id: '1', 
    name: 'Monthly Patient Statistics', 
    type: 'Statistical', 
    date: '2025-05-01', 
    status: 'Completed'
  },
  { 
    id: '2', 
    name: 'Quarterly Revenue Analysis', 
    type: 'Financial', 
    date: '2025-04-15', 
    status: 'Completed'
  },
  { 
    id: '3', 
    name: 'Equipment Utilization Report', 
    type: 'Operational', 
    date: '2025-05-05', 
    status: 'Pending'
  },
  { 
    id: '4', 
    name: 'Staff Performance Review', 
    type: 'HR', 
    date: '2025-04-28', 
    status: 'Completed'
  },
  { 
    id: '5', 
    name: 'Patient Satisfaction Survey', 
    type: 'Feedback', 
    date: '2025-05-08', 
    status: 'Processing'
  },
];

export default function Reports() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  
  // Filter reports based on search query and filters
  const filteredReports = reports.filter(report => {
    // Search query filter
    const matchesSearch = report.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          report.type.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Type filter
    const matchesType = filterType === 'all' || report.type === filterType;
    
    // Date filter
    let matchesDate = true;
    if (startDate && endDate) {
      const reportDate = new Date(report.date);
      matchesDate = reportDate >= startDate && reportDate <= endDate;
    }
    
    return matchesSearch && matchesType && matchesDate;
  });

  return (
    <>
      <Head>
        <title>Reports | RadGlobal RIS</title>
        <meta name="description" content="Reports and analytics for RadGlobal RIS" />
      </Head>
      
      <MainLayout>
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Reports</h1>
              <p className="text-muted-foreground">View and generate reports for your imaging center</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button>
                <FileText className="mr-2 h-4 w-4" />
                Generate New Report
              </Button>
            </div>
          </div>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Report Filters</CardTitle>
              <CardDescription>Filter reports by type, date range, and more</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Input
                    placeholder="Search reports..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Report Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Statistical">Statistical</SelectItem>
                      <SelectItem value="Financial">Financial</SelectItem>
                      <SelectItem value="Operational">Operational</SelectItem>
                      <SelectItem value="HR">HR</SelectItem>
                      <SelectItem value="Feedback">Feedback</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${!startDate && "text-muted-foreground"}`}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : <span>Start Date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${!endDate && "text-muted-foreground"}`}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : <span>End Date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Available Reports</CardTitle>
              <CardDescription>
                {filteredReports.length} reports found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.length > 0 ? (
                    filteredReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">{report.name}</TableCell>
                        <TableCell>{report.type}</TableCell>
                        <TableCell>{new Date(report.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            report.status === 'Completed' 
                              ? 'bg-green-100 text-green-800' 
                              : report.status === 'Processing' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {report.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                            <span className="sr-only">Download</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                        No reports found matching your filters
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    </>
  );
}
