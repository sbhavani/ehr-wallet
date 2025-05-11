import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { format, addDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Clock } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MainLayout } from "@/components/layout/MainLayout";
import Head from "next/head";

const examFormSchema = z.object({
  patientId: z.string().min(1, { message: "Patient ID is required" }),
  patientName: z.string().min(1, { message: "Patient name is required" }),
  examDate: z.date({ required_error: "Exam date is required" }),
  examTime: z.string().min(1, { message: "Exam time is required" }),
  modality: z.string().min(1, { message: "Modality is required" }),
  procedureType: z.string().min(1, { message: "Procedure type is required" }),
  bodyPart: z.string().min(1, { message: "Body part is required" }),
  referringPhysician: z.string().min(1, { message: "Referring physician is required" }),
  radiologist: z.string().optional(),
  priority: z.string().default("routine"),
  notes: z.string().optional(),
  contrast: z.boolean().default(false),
  insuranceVerified: z.boolean().default(false),
});

type ExamFormValues = z.infer<typeof examFormSchema>;

const ScheduleExamContent = () => {
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([
    "08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM", 
    "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
    "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM"
  ]);
  
  // Mock patient data - in a real app, this would come from an API
  const patients = [
    { id: "P001", name: "John Smith" },
    { id: "P002", name: "Sarah Johnson" },
    { id: "P003", name: "Michael Brown" },
    { id: "P004", name: "Emily Davis" },
    { id: "P005", name: "Robert Wilson" },
  ];
  
  // Mock physicians data
  const physicians = [
    { id: "DR001", name: "Dr. Elizabeth Chen" },
    { id: "DR002", name: "Dr. James Wilson" },
    { id: "DR003", name: "Dr. Maria Rodriguez" },
    { id: "DR004", name: "Dr. David Kim" },
  ];
  
  // Mock radiologists data
  const radiologists = [
    { id: "RAD001", name: "Dr. Thomas Johnson" },
    { id: "RAD002", name: "Dr. Sarah Lee" },
    { id: "RAD003", name: "Dr. Robert Garcia" },
  ];

  const defaultValues: Partial<ExamFormValues> = {
    patientId: "",
    patientName: "",
    examDate: addDays(new Date(), 1),
    examTime: "",
    modality: "",
    procedureType: "",
    bodyPart: "",
    referringPhysician: "",
    radiologist: "",
    priority: "routine",
    notes: "",
    contrast: false,
    insuranceVerified: false,
  };

  const form = useForm<ExamFormValues>({
    resolver: zodResolver(examFormSchema),
    defaultValues,
  });

  // Handle patient selection
  const handlePatientSelect = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      form.setValue("patientId", patient.id);
      form.setValue("patientName", patient.name);
      setSelectedPatient(patient.id);
    }
  };

  // Handle date selection to update available time slots
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      form.setValue("examDate", date);
      // In a real app, you would fetch available time slots for this date from your API
      // For now, we'll just simulate some random availability
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      if (isWeekend) {
        setAvailableTimeSlots(["09:00 AM", "10:00 AM", "11:00 AM"]);
      } else {
        setAvailableTimeSlots([
          "08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM", 
          "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
          "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
          "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM"
        ]);
      }
    }
  };

  const onSubmit = (data: ExamFormValues) => {
    console.log("Exam scheduled:", data);
    toast({
      title: "Exam scheduled successfully",
      description: `${data.patientName}'s ${data.modality} exam has been scheduled for ${format(data.examDate, "PPP")} at ${data.examTime}.`,
    });
    // In a real app, you would send this data to your API here
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedule Exam</h1>
          <p className="text-muted-foreground">Create a new imaging appointment</p>
        </div>
      </div>

      <Tabs defaultValue="new" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="new">New Exam</TabsTrigger>
          <TabsTrigger value="search">Find Patient</TabsTrigger>
        </TabsList>
        
        <TabsContent value="search" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Search for Patient</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Input placeholder="Search by name, ID, or DOB" className="flex-1" />
                  <Button>Search</Button>
                </div>
                
                <div className="border rounded-md">
                  <div className="grid grid-cols-3 font-medium p-3 border-b bg-muted/50">
                    <div>Patient ID</div>
                    <div>Name</div>
                    <div>Action</div>
                  </div>
                  <div className="divide-y">
                    {patients.map((patient) => (
                      <div key={patient.id} className="grid grid-cols-3 p-3 items-center">
                        <div>{patient.id}</div>
                        <div>{patient.name}</div>
                        <div>
                          <Button 
                            size="sm" 
                            onClick={() => handlePatientSelect(patient.id)}
                          >
                            Select
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="new" className="mt-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Patient Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="patientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Patient ID</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter patient ID" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="patientName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Patient Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter patient name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Exam Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="examDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Exam Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={(date) => {
                                    field.onChange(date);
                                    handleDateSelect(date);
                                  }}
                                  disabled={(date) =>
                                    date < new Date() || date > addDays(new Date(), 60)
                                  }
                                  initialFocus
                                  className={cn("p-3 pointer-events-auto")}
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="examTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Exam Time</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select time slot" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {availableTimeSlots.map((timeSlot) => (
                                  <SelectItem key={timeSlot} value={timeSlot}>
                                    {timeSlot}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="modality"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Modality</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select modality" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="xray">X-Ray</SelectItem>
                                <SelectItem value="ct">CT Scan</SelectItem>
                                <SelectItem value="mri">MRI</SelectItem>
                                <SelectItem value="ultrasound">Ultrasound</SelectItem>
                                <SelectItem value="mammography">Mammography</SelectItem>
                                <SelectItem value="dexa">DEXA Scan</SelectItem>
                                <SelectItem value="pet">PET Scan</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bodyPart"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Body Part</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select body part" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="head">Head</SelectItem>
                                <SelectItem value="neck">Neck</SelectItem>
                                <SelectItem value="chest">Chest</SelectItem>
                                <SelectItem value="abdomen">Abdomen</SelectItem>
                                <SelectItem value="pelvis">Pelvis</SelectItem>
                                <SelectItem value="spine">Spine</SelectItem>
                                <SelectItem value="upper_extremity">Upper Extremity</SelectItem>
                                <SelectItem value="lower_extremity">Lower Extremity</SelectItem>
                                <SelectItem value="whole_body">Whole Body</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="procedureType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Procedure Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select procedure type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="diagnostic">Diagnostic</SelectItem>
                                <SelectItem value="screening">Screening</SelectItem>
                                <SelectItem value="interventional">Interventional</SelectItem>
                                <SelectItem value="follow_up">Follow-up</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="referringPhysician"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Referring Physician</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select referring physician" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {physicians.map((physician) => (
                                  <SelectItem key={physician.id} value={physician.id}>
                                    {physician.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="radiologist"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Radiologist (Optional)</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select radiologist" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {radiologists.map((radiologist) => (
                                  <SelectItem key={radiologist.id} value={radiologist.id}>
                                    {radiologist.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>Leave empty for auto-assignment</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priority</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="routine">Routine</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                                <SelectItem value="stat">STAT</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Additional instructions or notes for the exam"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>Optional</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="contrast"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-4 w-4 mt-1"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Contrast Required</FormLabel>
                            <FormDescription>
                              Check if contrast material is needed for this exam
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="insuranceVerified"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-4 w-4 mt-1"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Insurance Verified</FormLabel>
                            <FormDescription>
                              Check if insurance coverage has been verified for this procedure
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Separator />

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline">Cancel</Button>
                <Button type="submit" className="bg-medical-blue hover:bg-medical-blue/90">Schedule Exam</Button>
              </div>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const ScheduleExam = () => {
  return (
    <>
      <Head>
        <title>Schedule Exam - RadGlobal RIS</title>
        <meta name="description" content="Schedule a new imaging exam for a patient" />
      </Head>
      <MainLayout>
        <ScheduleExamContent />
      </MainLayout>
    </>
  );
};

export default ScheduleExam;
