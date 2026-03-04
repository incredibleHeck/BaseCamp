import React, { useState } from 'react';
import { Upload, FileSpreadsheet, Loader2, CheckCircle2 } from 'lucide-react';

type Status = 'On Track' | 'Monitor' | 'Critical Gap';

interface Student {
  id: string;
  name: string;
  target: string;
  literacyStatus: Status;
  numeracyStatus: Status;
}

const mockData: Student[] = [
  {
    id: '1',
    name: 'Kwame Mensah',
    target: 'JHS 1',
    literacyStatus: 'On Track',
    numeracyStatus: 'Critical Gap',
  },
  {
    id: '2',
    name: 'Ama Osei',
    target: 'JHS 1',
    literacyStatus: 'Monitor',
    numeracyStatus: 'On Track',
  },
  {
    id: '3',
    name: 'Kojo Appiah',
    target: 'JHS 1',
    literacyStatus: 'Critical Gap',
    numeracyStatus: 'Monitor',
  },
  {
    id: '4',
    name: 'Abena Yeboah',
    target: 'JHS 1',
    literacyStatus: 'On Track',
    numeracyStatus: 'On Track',
  },
];

function StatusBadge({ status }: { status: Status }) {
  let colorClass = '';
  switch (status) {
    case 'On Track':
      colorClass = 'bg-green-100 text-green-800';
      break;
    case 'Monitor':
      colorClass = 'bg-yellow-100 text-yellow-800';
      break;
    case 'Critical Gap':
      colorClass = 'bg-red-100 text-red-800';
      break;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {status}
    </span>
  );
}

export function ClassRoster() {
  const [showImportArea, setShowImportArea] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  const handleSimulateUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setShowImportArea(false);
      setImportSuccess(true);
      // Reset success message after 5 seconds
      setTimeout(() => setImportSuccess(false), 5000);
    }, 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
      <div className="px-6 py-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-gray-800">Class Roster</h3>
        <button 
          onClick={() => {
            setShowImportArea(!showImportArea);
            setImportSuccess(false);
          }}
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
        >
          <Upload size={16} />
          Import Roster (CSV/Excel)
        </button>
      </div>

      {importSuccess && (
        <div className="bg-green-50 border-b border-green-100 px-6 py-3 flex items-center gap-2 text-green-700 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={18} />
          <span className="text-sm font-medium">Successfully imported 65 students from District Database.</span>
        </div>
      )}

      {showImportArea && (
        <div className="bg-gray-50 border-b border-gray-200 p-6 animate-in fade-in slide-in-from-top-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-center bg-white">
            {isUploading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-900 font-medium">Parsing 65 students...</p>
                <p className="text-sm text-gray-500 mt-1">Generating longitudinal profiles</p>
              </div>
            ) : (
              <>
                <div className="bg-blue-50 p-3 rounded-full mb-4">
                  <FileSpreadsheet className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="text-gray-900 font-medium mb-2">Import Class Roster</h4>
                <p className="text-gray-500 text-sm max-w-md mb-6">
                  Drag and drop your terminal report CSV here to automatically generate longitudinal profiles.
                </p>
                <button 
                  onClick={handleSimulateUpload}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors shadow-sm"
                >
                  Simulate Upload
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transition Target
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Literacy Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Numeracy Status
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockData.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {student.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.target}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={student.literacyStatus} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={student.numeracyStatus} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 transition-colors">
                    View Profile
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
