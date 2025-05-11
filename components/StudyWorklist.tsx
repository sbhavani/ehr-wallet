import React from 'react';
import { Search, Filter } from 'lucide-react';

const StudyWorklist = () => {
  // Sample study data for demonstration
  const studies = [
    { 
      id: 1, 
      patientName: 'John Smith', 
      accessionNumber: 'ACC123456', 
      modality: 'CT', 
      studyDate: '2023-05-10', 
      status: 'Completed',
      priority: 'Routine'
    },
    { 
      id: 2, 
      patientName: 'Sarah Johnson', 
      accessionNumber: 'ACC234567', 
      modality: 'MRI', 
      studyDate: '2023-05-09', 
      status: 'In Progress',
      priority: 'Urgent'
    },
    { 
      id: 3, 
      patientName: 'Michael Brown', 
      accessionNumber: 'ACC345678', 
      modality: 'XR', 
      studyDate: '2023-05-08', 
      status: 'Scheduled',
      priority: 'Routine'
    },
    { 
      id: 4, 
      patientName: 'Emily Davis', 
      accessionNumber: 'ACC456789', 
      modality: 'US', 
      studyDate: '2023-05-07', 
      status: 'Completed',
      priority: 'STAT'
    },
    { 
      id: 5, 
      patientName: 'Robert Wilson', 
      accessionNumber: 'ACC567890', 
      modality: 'CT', 
      studyDate: '2023-05-06', 
      status: 'Completed',
      priority: 'Routine'
    },
  ];

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Study Worklist</h1>
        
        <div className="flex w-full md:w-auto space-x-2">
          <div className="relative flex-grow md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search studies..."
              className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
            />
          </div>
          
          <button
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md flex items-center"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Patient
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Accession #
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Modality
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Priority
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {studies.map((study) => (
                <tr key={study.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{study.patientName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">{study.accessionNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">{study.modality}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">{study.studyDate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${study.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                        study.status === 'In Progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                      {study.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${study.priority === 'STAT' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 
                        study.priority === 'Urgent' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' : 
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                      {study.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      className="text-primary hover:text-primary/80 mr-3"
                      onClick={() => window.location.href = '/viewer'}
                    >
                      View
                    </button>
                    <button className="text-primary hover:text-primary/80 mr-3">Report</button>
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

export default StudyWorklist;
