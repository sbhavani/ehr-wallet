
import { PatientForm } from "@/components/patients/PatientForm";

const PatientRegister = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Patient Registration</h1>
        <p className="text-muted-foreground">Register a new patient in the system</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <PatientForm />
      </div>
    </div>
  );
};

export default PatientRegister;
