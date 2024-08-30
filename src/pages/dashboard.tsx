import React, { useEffect, useState } from 'react';
import Modal from './api/components/modal';

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
import { useSearchParams } from 'next/navigation';

const formatDate = (dateMillis: number | string): string => {
  // Convert dateMillis to number if it's a string
  const millis = typeof dateMillis === 'string' ? parseInt(dateMillis, 10) : dateMillis;

  // Check if millis is a valid number
  if (isNaN(millis) || millis <= 0) {
    console.error('Invalid dateMillis value:', dateMillis);
    return 'Invalid Date';
  }

  const date = new Date(millis);
  const options: Intl.DateTimeFormatOptions = {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  };
  return date.toLocaleDateString(undefined, options);
};

export function TableHero(params: { organizationName: string, rotationName: string }) {
  const { organizationName, rotationName } = params;
  const [users, setUsers] = useState<SlackUser[]>([]);
  const [userColumns, setUserColumns] = useState<(keyof SlackUser)[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedUser, setSelectedUser] = useState<SlackUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const tableHeaders = userColumns.map(column => (
    <TableHeaderCell
      className='hover:text-secondary py-5 cursor-pointer capitalize'
      key={column + '-key'}
    >
      {column.replace('_', ' ')}
    </TableHeaderCell>
  ));

  const fetchUserData = async () => {
    const BASE_API_URL = 'http://localhost:3000/api/v1';
    setLoading(true);
    const response = await fetch(
      `${BASE_API_URL}/${organizationName}/${rotationName}/users`
    );
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    setLoading(false);
    const { rows: users, columns }: { rows: SlackUser[], columns: (keyof SlackUser)[] } = await response.json();
    setUsers(users);
    setUserColumns(columns);
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleUpdateClick = (user: SlackUser) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  //

  return (
    <div className='p-4 md:p-10 rounded-2xl my-12'>
      <h1 className='hover:text-secondary text-4xl md:text-5xl font-bold md:mb-4'>
        Team Members
      </h1>
      {loading ? (
        <p className='text-gray-300'>Loading...</p>
      ) : (
        <div className='overflow-auto'>
          <Table className='text-lg border-separate border-spacing-0 rounded'>
            <TableHead>
              <TableRow className='bg-dark-bg'>
                {tableHeaders}
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow
                  key={user.slack_id}
                  onClick={() => handleUpdateClick(user)}
                  className='bg-light-bg px-4 py-2 text-base text-black text-left border-b border-gray-400 cursor-pointer'
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

      {isModalOpen && (
        <Modal
          user={selectedUser}
          onClose={handleCloseModal}
          organizationName={organizationName}
          rotationName={rotationName}
        />
      )}
    </div>
  );
}

// TableLogs
function TableLogs(params: { organizationName: string, rotationName: string }) {

  const { organizationName, rotationName } = params;
  const [logs, setLogs] = useState<Log[]>([]);
  const [logColumns, setLogColumns] = useState<(keyof Log)[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);

  const tableHeaders = logColumns.map(column => (
    <TableHeaderCell
      className='hover:text-secondary py-5 cursor-pointer capitalize'
      key={column + '-log-key'}
    >
      {column.replace('_', ' ')}
    </TableHeaderCell>
  ));

  const fetchLogsData = async () => {
    const BASE_API_URL = 'http://localhost:3000/api/v1';

    try {
      setLogsLoading(true);
      // TODO: add proper pagination
      const response = await fetch(
        `${BASE_API_URL}/${organizationName}/${rotationName}/logs`
      );

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
    <div className='p-4 md:p-10 rounded-2xl my-12'>
      <h1 className='hover:text-secondary text-4xl md:text-5xl font-bold md:mb-4'>
        Logs Data
      </h1>
      {logsLoading ? (
        <p className='text-gray-300'>Loading...</p>
      ) : (
        <div className='overflow-auto'>
          <Table className='text-lg border-separate border-spacing-0 rounded'>
            <TableHead>
              <TableRow className='bg-dark-bg'>
                {tableHeaders}
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log) => (
                <TableRow
                  key={log.date}
                  className='bg-light-bg px-4 py-2 text-base text-black text-left border-b border-gray-400'
                >
                  {logColumns.map((keyName, i) => (
                    <TableCell key={keyName + i}>
                      {keyName === 'date' ? formatDate(log[keyName] as number) : log[keyName].toString()}
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

  const params = useSearchParams();
  if (!params) {
    return <div>No organization or rotation selected</div>;
  }

  const organization_id = params.get('organization_id');
  const rotation_id = params.get('rotation_id');

  if (!organization_id || !rotation_id) {
    return <div>No organization or rotation selected</div>;
  }

  return (
    <>
      <TableHero organizationName={organization_id} rotationName={rotation_id} />
      <TableLogs organizationName={organization_id} rotationName={rotation_id} />
    </>
  );
}
