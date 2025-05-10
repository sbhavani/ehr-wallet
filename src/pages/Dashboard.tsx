
import { Calendar, User, FileSearch } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { StudiesTable } from "@/components/dashboard/StudiesTable";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back to RadiologyAI</p>
        </div>
        
        <div className="flex gap-2">
          <Button>
            <User className="mr-2 h-4 w-4" />
            New Patient
          </Button>
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" /> 
            Schedule Exam
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          title="Total Patients" 
          value="1,285" 
          trend={{ value: "+12%", positive: true }}
          icon={<User className="h-6 w-6" />} 
        />
        <StatCard 
          title="Studies Today" 
          value="24" 
          trend={{ value: "+4", positive: true }}
          icon={<FileSearch className="h-6 w-6" />} 
        />
        <StatCard 
          title="Pending Reports" 
          value="8" 
          trend={{ value: "-3", positive: true }}
          icon={<FileSearch className="h-6 w-6" />} 
        />
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Studies</h2>
          <Button variant="outline" size="sm">View All</Button>
        </div>
        <StudiesTable />
      </div>
      
      <Separator className="my-6" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Today's Schedule</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                <div>
                  <p className="font-medium">Patient {i}</p>
                  <p className="text-sm text-gray-500">CT Scan - Dr. Johnson</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{10 + i}:00 AM</p>
                  <div className="text-xs mt-1 px-2 py-1 rounded bg-blue-100 text-blue-800">Scheduled</div>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full mt-2">View Full Schedule</Button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Study Completion</h2>
          <div className="h-64 flex items-center justify-center bg-gray-100 rounded-lg">
            <p className="text-gray-500">Chart will be displayed here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
