import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@tremor/react';

// Database
const initialData = [
  {
    name: 'Chiyen Venegas',
    slackId: 'NKCRKENUI',
    onDuty: 'True',
    count: '1',
    lastTime: 'July 22 2024',
    availability: true,
  },
  {
    name: 'Deyner Cruz',
    slackId: 'I90JY7H4G',
    onDuty: 'False',
    count: '3',
    lastTime: 'April 22 2024',
    availability: false,
  },
  {
    name: 'Kedwin Araya',
    slackId: '69RJHDQN3',
    onDuty: 'False',
    count: '7',
    lastTime: 'January 22 2024',
    availability: false,
  },
  {
    name: 'Celeste Vargas',
    slackId: 'IZ319BL01',
    onDuty: 'True',
    count: '2',
    lastTime: 'August 15 2024',
    availability: true,
  },
  {
    name: 'Bolivar Mora (Sir Cachiflin)',
    slackId: '8FBV6JXA6',
    onDuty: 'False',
    count: '1',
    lastTime: 'June 22 2024',
    availability: false,
  },
  {
    name: 'Ian Xiaomi Monopatin',
    slackId: 'ZLRSRUKFK',
    onDuty: 'True',
    count: '0',
    lastTime: 'August 22 2024',
    availability: true,
  },
  
];

// Availability Button
const AvailabilityButton: React.FC<{ available: boolean }> = ({ available }) => (
  <button
    className={`px-4 py-2 rounded-full font-semibold ${
      available
        ? 'bg-green-500 hover:bg-green-600 text-white'
        : 'bg-red-500 hover:bg-red-600 text-white'
    } transition-colors duration-200`}
  >
    {available ? 'Available' : 'Unavailable'}
  </button>
);

// TableHero
export function TableHero() {
  const [data, setData] = useState(initialData);
  const [sortColumn, setSortColumn] = useState<string | null>('availability');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Sort data by the default column on component mount
  useEffect(() => {
    handleSort('availability');
  }, []);

  const handleSort = (column: string) => {
    const newSortDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(newSortDirection);

    const sortedData = [...initialData].sort((a, b) => {
      const aValue = a[column as keyof typeof a];
      const bValue = b[column as keyof typeof b];

      if (column === 'lastTime') {
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          const aDate = new Date(aValue);
          const bDate = new Date(bValue);
          if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
            return newSortDirection === 'desc'
              ? aDate.getTime() - bDate.getTime()
              : bDate.getTime() - aDate.getTime();
          }
        }
        return 0;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return newSortDirection === 'desc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return newSortDirection === 'desc'
          ? aValue - bValue
          : bValue - aValue;
      }
      if (column === 'availability') {
        const aBool = aValue === true ? 1 : 0;
        const bBool = bValue === true ? 1 : 0;
        return newSortDirection === 'desc' ? aBool - bBool : bBool - aBool;
      }

      return 0; // If types are different or undefined, no sorting
    });

    setData(sortedData);
  };
  return (
    <div className="p-4 md:p-10 rounded-2xl bg-white">
      <Card className="bg-gray-200 bg-opacity-50 overflow-hidden">
        <h1 className="text-orange-900 text-5xl font-semibold mb-2 mt-2 px-10">
          Team Members
        </h1>
        <div className="overflow-hidden">
          <Table className="text-white text-sm my-4 mx-8 border-separate border-spacing-0">
            <TableHead>
              <TableRow className="bg-orange-900 bg-opacity-60">
                <TableHeaderCell
                  className="text-white py-5 border-b border-gray-300 cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  Name {sortColumn === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHeaderCell>
                <TableHeaderCell
                  className="text-white py-5 border-b border-gray-300 cursor-pointer"
                  onClick={() => handleSort('slackId')}
                >
                  Slack ID {sortColumn === 'slackId' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHeaderCell>
                <TableHeaderCell
                  className="text-white py-5 border-b border-gray-300 cursor-pointer"
                  onClick={() => handleSort('onDuty')}
                >
                  On Duty {sortColumn === 'onDuty' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHeaderCell>
                <TableHeaderCell
                  className="text-white py-5 border-b border-gray-300 cursor-pointer"
                  onClick={() => handleSort('count')}
                >
                  Count {sortColumn === 'count' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHeaderCell>
                <TableHeaderCell
                  className="text-white py-5 border-b border-gray-300 cursor-pointer"
                  onClick={() => handleSort('lastTime')}
                >
                  Last Time As Current {sortColumn === 'lastTime' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHeaderCell>
                <TableHeaderCell
                  className="text-white py-5 border-b border-gray-300 cursor-pointer"
                  onClick={() => handleSort('availability')}
                >
                  Availability {sortColumn === 'availability' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.name} className="text-black hover:bg-gray-200 hover:bg-opacity-50 transition-colors duration-200 border-b border-gray-300">
                  <TableCell className='bg-gray-200 px-4 py-2 text-sm'>{item.name}</TableCell>
                  <TableCell className='px-4 py-2 text-sm'>{item.slackId}</TableCell>
                  <TableCell className='bg-gray-200 px-4 py-2 text-sm text-center'>{item.onDuty}</TableCell>
                  <TableCell className='px-4 py-2 text-sm'>{item.count}</TableCell>
                  <TableCell className='px-4 py-2 text-sm'>{item.lastTime}</TableCell>
                  <TableCell className='bg-white px-4 py-2 text-sm'>
                    <AvailabilityButton available={item.availability} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

export default TableHero;
