import React, { useState, useEffect } from 'react';
import {
  // Card, we will be using this the moment we implement a proper dashboard
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@tremor/react';

import { SlackUser } from 'types';

// Availability Button
// const AvailabilityButton: React.FC<{ available: boolean }> = ({
//   available,
// }) => (
//   <button
//     className={`px-4 py-2 rounded-full font-semibold border-2 ${available
//       ? "border-green-500 text-gray-300 bg-transparent hover:bg-green-500 hover:text-white"
//       : "border-red-500 text-gray-300 bg-transparent hover:bg-red-500 hover:text-white"
//       } transition-colors duration-200`}
//   >
//     {available ? "Available" : "Unavailable"}
//   </button>
// );


// TableHero
export function TableHero() {
  const [users, setUsers] = useState<SlackUser[]>([]);
  const [userColumns, setUserColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  // const [sortColumn, setSortColumn] = useState<string | null>("on_holiday");
  // const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");


  const tableHeaders = userColumns.map(column =>
    <TableHeaderCell
      className="text-gray-300 py-5 border-b border-gray-300 cursor-pointer capitalize"
      key={column + '-key'}
    >
      {column.replace('_', ' ')}
      {/*
          These sort columns will be the visual cue in case we are currently sorting by this column
          {sortColumn === "full_name" &&
          (sortDirection === "asc" ? "↑" : "↓")}
      */}
    </TableHeaderCell>
  );

  const fetchData = async () => {
    const BASE_API_URL = 'http://localhost:3000/api/v1';
    try {
      setLoading(true);
      const response = await fetch(
        BASE_API_URL + '/marandino_workspace/rotation'
      );
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const { rows: users, columns }: { rows: SlackUser[], columns: string[] } = await response.json();
      // Transform the data

      setUsers(users);
      setUserColumns(columns);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-4 md:p-10 rounded-2xl bg-gray-900">
      <h1 className="text-gray-300 text-5xl font-semibold mb-2 mt-2 px-10">
        Team Members
      </h1>
      {loading ? (
        <p className="text-gray-300">Loading...</p>
      ) : (
        <div className="overflow-hidden">
          <Table className="text-gray-300 text-sm my-4 mx-8 border-separate border-spacing-0">
            <TableHead>
              <TableRow className="bg-gray-700">
                {tableHeaders}
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow
                  key={user.slack_id}
                  className="text-gray-300 hover:bg-gray-200 hover:bg-opacity-50 transition-colors duration-200 border-b border-gray-300"
                >
                  {
                    (Object.keys(user) as Array<keyof SlackUser>).map((keyName, i) =>
                      <TableCell key={keyName + i} className="bg-gray-600 px-4 py-2 text-sm">
                        {user[keyName].toString()}
                      </TableCell>
                    )
                  }
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

export default TableHero;
