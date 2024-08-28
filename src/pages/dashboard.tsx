import React, { useEffect, useState } from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@tremor/react';

import { SlackUser } from 'types';
import { Log } from 'types';

// Availability Button

// const AvailabilityButton: React.FC<{ available: boolean }> = ({
//   available,
// }) => (
//   <button
//     className={`px-4 py-2 rounded-full font-semibold border-2 ${available
//       ? "border-green-500 text-gray-300 bg-transparent hover:bg-green-500 hover:text-white"
//       : "border-red-500 text-gray-300 bg-transparent hover:bg-red-500 hover:text-white"
//     } transition-colors duration-200`}
//   >
//     {available ? "Available" : "Unavailable"}
//   </button>
// );

// TableHero
export function TableHero() {
  const [users, setUsers] = useState<SlackUser[]>([]);
  const [userColumns, setUserColumns] = useState<(keyof SlackUser)[]>([]);
  const [loading, setLoading] = useState(true);
  // const [sortColumn, setSortColumn] = useState<string | null>("on_holiday");
  // const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const tableHeaders = userColumns.map(column => (
    <TableHeaderCell
      className="hover:text-secondary py-5 cursor-pointer capitalize"
      key={column + '-key'}
    >
      {column.replace('_', ' ')}
      {/*

      These sort columns will be the visual cue in case we are currently sorting by this column

      {sortColumn === "full_name" &&

      (sortDirection === "asc" ? "↑" : "↓")}

      */}
    </TableHeaderCell>
  ));

  const fetchUserData = async () => {
    const BASE_API_URL = 'http://localhost:3000/api/v1';
    try {
      setLoading(true);
      const response = await fetch(
        `${BASE_API_URL}/marandino_workspace/rotation/users`
      );
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const { rows: users, columns }: { rows: SlackUser[], columns: (keyof SlackUser)[] } = await response.json();
      setUsers(users);
      setUserColumns(columns);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <div className="p-4 md:p-10 rounded-2xl my-12">
      <h1 className="hover:text-secondary text-4xl md:text-5xl font-bold md:mb-4">
        Team Members
      </h1>
      {loading ? (
        <p className="text-gray-300">Loading...</p>
      ) : (
        <div className="overflow-auto">
          <Table className="text-lg border-separate border-spacing-0 rounded">
            <TableHead>
              <TableRow className="bg-dark-bg">
                {tableHeaders}
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow
                  key={user.slack_id}
                  className="bg-light-bg px-4 py-2 text-base text-black text-left border-b border-gray-400"
                >
                  {userColumns.map((keyName, i) => (
                    <TableCell key={keyName + i}>
                      {user[keyName].toString()}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// TableLogs
export function TableLogs() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [logColumns, setLogColumns] = useState<(keyof Log)[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);

  const tableHeaders = logColumns.map(column => (
    <TableHeaderCell
      className="hover:text-secondary py-5 cursor-pointer capitalize"
      key={column + '-log-key'}
    >
      {column.replace('_', ' ')}
    </TableHeaderCell>
  ));

  const fetchLogsData = async () => {
    const BASE_API_URL = 'http://localhost:3000/api/v1';
    try {
      setLogsLoading(true);
      const response = await fetch(
        `${BASE_API_URL}/marandino_workspace/new_test_rotation/logs`
      );
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const { rows: logs, columns }: { rows: Log[], columns: (keyof Log)[] } = await response.json();
      setLogs(logs);
      setLogColumns(columns);
    } catch (error) {
      console.error('Error fetching logs data:', error);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogsData();
  }, []);

  return (
    <div className="p-4 md:p-10 rounded-2xl my-12">
      <h1 className="hover:text-secondary text-4xl md:text-5xl font-bold md:mb-4">
        Logs Data
      </h1>
      {logsLoading ? (
        <p className="text-gray-300">Loading...</p>
      ) : (
        <div className="overflow-auto">
          <Table className="text-lg border-separate border-spacing-0 rounded">
            <TableHead>
              <TableRow className="bg-dark-bg">
                {tableHeaders}
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log) => (
                <TableRow
                  key={log.description}
                  className="bg-light-bg px-4 py-2 text-base text-black text-left border-b border-gray-400"
                >
                  {logColumns.map((keyName, i) => (
                    <TableCell key={keyName + i}>
                      {log[keyName].toString()}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  return (
    <div>
      <TableHero />
      <TableLogs />
    </div>
  );
}
