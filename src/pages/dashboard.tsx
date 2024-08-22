import React from 'react';
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
const data = [
  {
    name: 'Viola Amherd',
    slackId: 'Federal Councillor',
    onDuty: 'True',
    count: '1',
    lastTime: 'August 22 2024',
    availability: true,
  },
  {
    name: 'Albert Rösti',
    slackId: 'Federal Councillor',
    onDuty: 'False',
    count: '0',
    lastTime: 'August 22 2024',
    availability: false,
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
                <TableHeaderCell className="text-white py-5 border-b border-gray-300">Name</TableHeaderCell>
                <TableHeaderCell className="text-white py-5 border-b border-gray-300">Slack ID</TableHeaderCell>
                <TableHeaderCell className="text-white py-5 border-b border-gray-300">On Duty</TableHeaderCell>
                <TableHeaderCell className="text-white py-5 border-b border-gray-300">Count</TableHeaderCell>
                <TableHeaderCell className="text-white py-5 border-b border-gray-300">Last Time As Current</TableHeaderCell>
                <TableHeaderCell className="text-white py-5 border-b border-gray-300">Availability</TableHeaderCell>
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
