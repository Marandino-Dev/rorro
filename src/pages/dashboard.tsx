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

import { Log, SlackUser } from 'types';
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
    hour: 'numeric',
    minute: 'numeric',
  };
  return date.toLocaleDateString(undefined, options);
};

interface TableProps<T> {
  title: string;
  data: T[];
  columns: (keyof T)[];
  loading: boolean;
  onRowClick?: (item: T) => void;
  formatCell?: (key: keyof T, value: T[keyof T]) => React.ReactNode;
}

function GenericTable<T>({ title, data, columns, loading, onRowClick, formatCell }: TableProps<T>) {

  // SORTING
  const [sortColumn, setSortColumn] = useState<keyof T | null>('on_duty' as keyof T);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    setSortColumn('on_duty' as keyof T);
    setSortDirection('desc');
  }, []);

  const handleSort = (column: keyof T) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortColumn) return data;
    return [...data].sort((a, b) => {
      if (a[sortColumn] < b[sortColumn]) return sortDirection === 'asc' ? -1 : 1;
      if (a[sortColumn] > b[sortColumn]) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortColumn, sortDirection]);

  const tableHeaders = columns.map(column => (
    <TableHeaderCell
      className='hover:text-secondary py-5 cursor-pointer capitalize'
      key={String(column) + '-key'}
      onClick={() => handleSort(column)}
    >
      {String(column).replace('_', ' ')}
      {sortColumn === column && (
        <span className='ml-2'>
          {sortDirection === 'asc' ? '↑' : '↓'}
        </span>
      )}
    </TableHeaderCell>
  ));

  return (
    <div className='p-4 md:p-10 rounded-2xl'>
      <h1 className='hover:text-secondary text-2xl font-bold'>
        {title}
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

              {sortedData.map((item, index) => (
                <TableRow
                  key={index}
                  onClick={() => onRowClick && onRowClick(item)}
                  className='bg-light-bg px-4 py-2 text-base text-black text-left border-b border-gray-400 cursor-pointer'
                >
                  {columns.map((keyName, i) => (
                    <TableCell key={String(keyName) + i}>
                      {formatCell ? formatCell(keyName, item[keyName]) : String(item[keyName])}
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

function UserTables(params: { organizationName: string, rotationName: string }) {
  const { organizationName, rotationName } = params;
  const [users, setUsers] = useState<SlackUser[]>([]);
  const [userColumns, setUserColumns] = useState<(keyof SlackUser)[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedUser, setSelectedUser] = useState<SlackUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const fetchUserData = async () => {
    const BASE_API_URL = window.location.origin + '/api/v1' || 'http://localhost:3000/api/v1';

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

  return (
    <>
      <GenericTable<SlackUser>
        title="Team Members"
        data={users}
        columns={userColumns}
        loading={loading}
        onRowClick={handleUpdateClick}
      />
      {isModalOpen && (
        <Modal
          user={selectedUser}
          onClose={handleCloseModal}
          organizationName={organizationName}
          rotationName={rotationName}
        />
      )}
    </>
  );
}

function LogsTable(params: { organizationName: string, rotationName: string }) {
  const { organizationName, rotationName } = params;
  const [logs, setLogs] = useState<Log[]>([]);
  const [logColumns, setLogColumns] = useState<(keyof Log)[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);

  const fetchLogsData = async () => {
    const BASE_API_URL = window.location.origin + '/api/v1' || 'http://localhost:3000/api/v1';

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

  const formatCell = (key: keyof Log, value: Log[keyof Log]) => {
    if (key === 'date') {
      return formatDate(value as number);
    }
    return String(value);
  };

  return (
    <GenericTable<Log>
      title="Logs Data"
      data={logs}
      columns={logColumns}
      loading={logsLoading}
      formatCell={formatCell}
    />
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
      <UserTables organizationName={organization_id} rotationName={rotation_id} />
      <LogsTable organizationName={organization_id} rotationName={rotation_id} />
    </>
  );
}
