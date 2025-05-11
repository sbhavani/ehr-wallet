import { useState } from "react";
import { Calendar, Clock, Filter, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import { MainLayout } from "@/components/layout/MainLayout";
import Head from "next/head";
import Link from "next/link";

// Types for our appointment data
type AppointmentStatus = "scheduled" | "in-progress" | "completed" | "cancelled" | "no-show";

type Appointment = {
  id: string;
  patientId: string;
  patientName: string;
  time: string;
  date: string;
  modality: string;
  bodyPart: string;
  doctor: string;
  status: AppointmentStatus;
  priority: "routine" | "urgent" | "stat";
  duration: number; // in minutes
};

// Mock data for appointments
const generateMockAppointments = (date: Date): Appointment[] => {
  const dateStr = format(date, "yyyy-MM-dd");
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  const count = isWeekend ? 5 : 12;
  
  const appointments: Appointment[] = [];
  const modalities = ["CT", "MRI", "X-Ray", "Ultrasound", "Mammography"];
  const bodyParts = ["Head", "Chest", "Abdomen", "Spine", "Upper Extremity", "Lower Extremity"];
  const doctors = ["Dr. Johnson", "Dr. Smith", "Dr. Chen", "Dr. Patel", "Dr. Garcia"];
  const statuses: AppointmentStatus[] = ["scheduled", "in-progress", "completed", "cancelled", "no-show"];
  const priorities = ["routine", "urgent", "stat"];
  
  // Generate appointments for morning and afternoon
  for (let i = 0; i < count; i++) {
    const hour = 8 + Math.floor(i / 2) + (i >= 8 ? 1 : 0); // Skip lunch hour
    const minute = i % 2 === 0 ? "00" : "30";
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour > 12 ? hour - 12 : hour;
    
    appointments.push({
      id: `APT-${dateStr}-${i + 1}`,
      patientId: `PAT-${1000 + i}`,
      patientName: `Patient ${i + 1}`,
      time: `${hour12}:${minute} ${ampm}`,
      date: dateStr,
      modality: modalities[i % modalities.length],
      bodyPart: bodyParts[i % bodyParts.length],
      doctor: doctors[i % doctors.length],
      status: i < count - 3 ? statuses[i % 3] : statuses[i % statuses.length],
      priority: priorities[i % priorities.length] as "routine" | "urgent" | "stat",
      duration: 30
    });
  }
  
  return appointments;
};

const SchedulingContent = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [currentView, setCurrentView] = useState<"day" | "week" | "month">("day");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterModality, setFilterModality] = useState<string | undefined>();
  
  // Generate dates for the week view
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDates = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  // Generate mock appointments for the selected date
  const dayAppointments = generateMockAppointments(currentDate);
  
  // Generate appointments for the week
  const weekAppointments = weekDates.flatMap(date => generateMockAppointments(date));
  
  // Filter appointments based on search and filters
  const filterAppointments = (appointments: Appointment[]) => {
    return appointments.filter(apt => {
      const matchesSearch = searchQuery === "" || 
        apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.doctor.toLowerCase().includes(searchQuery.toLowerCase());
        
      const matchesModality = !filterModality || apt.modality.toLowerCase() === filterModality.toLowerCase();
      
      return matchesSearch && matchesModality;
    });
  };
  
  const filteredDayAppointments = filterAppointments(dayAppointments);
  const filteredWeekAppointments = filterAppointments(weekAppointments);
  
  // Navigation functions
  const goToPreviousDay = () => setCurrentDate(subDays(currentDate, 1));
  const goToNextDay = () => setCurrentDate(addDays(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());
  const goToPreviousWeek = () => setCurrentDate(subDays(currentDate, 7));
  const goToNextWeek = () => setCurrentDate(addDays(currentDate, 7));
  
  // Status badge styles
  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>;
      case "in-progress":
        return <Badge className="bg-green-100 text-green-800">In Progress</Badge>;
      case "completed":
        return <Badge className="bg-secondary text-secondary-foreground">Completed</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      case "no-show":
        return <Badge className="bg-amber-100 text-amber-800">No Show</Badge>;
      default:
        return null;
    }
  };
  
  // Priority badge styles
  const getPriorityBadge = (priority: "routine" | "urgent" | "stat") => {
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
    <div className="space-y-8 pb-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight">Scheduling</h1>
          <p className="text-muted-foreground">View and manage all appointments</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button asChild className="font-semibold px-6 py-2 text-base shadow-md" aria-label="Schedule new exam">
            <Link href="/ScheduleExam">
              <Calendar className="mr-2 h-5 w-5" /> 
              Schedule New Exam
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Filters and search (sticky on scroll) */}
      <div className="flex flex-col sm:flex-row gap-4 sticky top-0 z-20 bg-background/90 backdrop-blur-md py-2 border-b border-border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search patients, doctors..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterModality} onValueChange={setFilterModality}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by modality" aria-label="Filter by modality" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={undefined}>All Modalities</SelectItem>
              <SelectItem value="CT">CT</SelectItem>
              <SelectItem value="MRI">MRI</SelectItem>
              <SelectItem value="X-Ray">X-Ray</SelectItem>
              <SelectItem value="Ultrasound">Ultrasound</SelectItem>
              <SelectItem value="Mammography">Mammography</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* View selector and date navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sticky top-20 z-10 bg-background/90 backdrop-blur-md py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>Today</Button>
          <Button variant="outline" size="icon" onClick={currentView === "day" ? goToPreviousDay : goToPreviousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={currentView === "day" ? goToNextDay : goToNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="text-lg font-semibold">
            {currentView === "day" ? (
              format(currentDate, "MMMM d, yyyy")
            ) : (
              `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`
            )}
          </div>
        </div>
        
        <Tabs 
          value={currentView} 
          onValueChange={(value) => setCurrentView(value as "day" | "week" | "month")}
          className="w-full"
        >
          <TabsList className="bg-muted p-1 rounded-lg">
            <TabsTrigger value="day">Day</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
          </TabsList>
          
          {/* Day View */}
          <TabsContent value="day" className="mt-6">
            <Card className="shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  {format(currentDate, "EEEE, MMMM d")}
                  {isToday(currentDate) && <Badge className="ml-2">Today</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredDayAppointments.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground text-lg">
                    No appointments found for this day
                  </div>
                ) : (
                  <div className="space-y-5">
                    {filteredDayAppointments.map((appointment) => (
                      <div 
                        key={appointment.id} 
                        className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors shadow-sm"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-center w-20">
                            <p className="text-base font-semibold">{appointment.time}</p>
                            <p className="text-xs text-muted-foreground">{appointment.duration}min</p>
                          </div>
                          <div>
                            <p className="font-semibold text-lg">{appointment.patientName}</p>
                            <p className="text-sm text-muted-foreground">
                              {appointment.modality} - {appointment.bodyPart} - {appointment.doctor}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-row md:flex-col items-end gap-2 mt-2 md:mt-0">
                          {getStatusBadge(appointment.status)}
                          {appointment.priority !== "routine" && getPriorityBadge(appointment.priority)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Week View */}
          <TabsContent value="week" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 overflow-x-auto">
              {weekDates.map((date) => {
                const dateAppointments = filteredWeekAppointments.filter(
                  apt => apt.date === format(date, "yyyy-MM-dd")
                );
                return (
                  <Card key={format(date, "yyyy-MM-dd")}
                    className={cn(
                      isToday(date) ? "border-2 border-primary shadow-lg bg-primary/5" : "shadow-sm"
                    )}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <span>{format(date, "EEE, MMM d")}</span>
                        {isToday(date) && <Badge className="ml-2">Today</Badge>}
                        <span className="ml-auto text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          {dateAppointments.length} appt{dateAppointments.length !== 1 ? 's' : ''}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="max-h-[400px] overflow-y-auto">
                      {dateAppointments.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground text-base">
                          No appointments
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {dateAppointments.map((appointment) => (
                            <div 
                              key={appointment.id} 
                              className="p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors text-base"
                            >
                              <div className="flex justify-between items-center">
                                <p className="font-semibold">{appointment.time}</p>
                                {appointment.priority !== "routine" && getPriorityBadge(appointment.priority)}
                              </div>
                              <p className="font-semibold mt-1">{appointment.patientName}</p>
                              <p className="text-xs text-muted-foreground">
                                {appointment.modality} - {appointment.bodyPart}
                              </p>
                              <div className="mt-1">
                                {getStatusBadge(appointment.status)}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const Scheduling = () => {
  return (
    <>
      <Head>
        <title>Scheduling - RadGlobal RIS</title>
        <meta name="description" content="View and manage all scheduled appointments" />
      </Head>
      <MainLayout>
        <SchedulingContent />
      </MainLayout>
    </>
  );
};

export default Scheduling;
