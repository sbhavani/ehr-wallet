import React from 'react';
import { Search } from 'lucide-react';

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
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Patient List</h1>
        
        <div className="flex w-full md:w-auto space-x-2">
          <div className="relative flex-grow md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search patients..."
              className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
            />
          </div>
          
          <button
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 whitespace-nowrap"
            onClick={() => window.location.href = '/patients/register'}
          >
            Add Patient
          </button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  DOB
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  MRN
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last Visit
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {patients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{patient.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">{patient.dob}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">{patient.mrn}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">{patient.lastVisit}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-primary hover:text-primary/80 mr-3">View</button>
                    <button className="text-primary hover:text-primary/80 mr-3">Edit</button>
                    <button className="text-red-600 hover:text-red-800">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing <span className="font-medium">1</span> to <span className="font-medium">5</span> of <span className="font-medium">5</span> results
          </div>
          
          <div className="flex space-x-2">
            <button className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-md text-sm" disabled>
              Previous
            </button>
            <button className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-md text-sm" disabled>
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientList;
