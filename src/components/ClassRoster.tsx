import React from 'react';

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
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
      <div className="px-6 py-5 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Class Roster</h3>
      </div>
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
