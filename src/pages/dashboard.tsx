import React, { useEffect, useState } from 'react';
import Modal from './api/components/modal';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

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

const formatDate = (dateMillis: unknown): string => {
  // Convert dateMillis to number if it's a string
  const millis = typeof dateMillis === 'string' ? parseInt(dateMillis, 10) : dateMillis;

  // Check if millis is a valid number
  if (typeof millis !== 'number' || isNaN(millis) || millis <= 0) {
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
  sortBy: keyof T;
}

function GenericTable<T>({ title, data, columns, loading, onRowClick, sortBy }: TableProps<T>) {

  // SORTING
  const [sortColumn, setSortColumn] = useState<keyof T>(sortBy as keyof T);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const rowsPerPage = 10;

  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState(1);

  const [sortedData, setSortedData] = useState<T[]>([]);
  const [paginatedData, setPaginatedData] = useState<T[]>([]);

  const handleSortingButton = (newColumn: keyof T) => {
    if (sortColumn === newColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(newColumn);
      setSortDirection('desc');
    }
    handleSorting(sortDirection, newColumn);
    handlePageLoad(1);
  };

  // PAGINATION LOGIC
  const handlePageLoad = (newPage: number) => {
    let newPaginatedData = sortedData.slice(
      (newPage - 1) * rowsPerPage,
      newPage * rowsPerPage
    );

    if (newPaginatedData.length < rowsPerPage) {
      // create some empty elements to fill the table so it doesn't snap into place
      const emptyRows = rowsPerPage - newPaginatedData.length;
      const emptyArray = new Array(emptyRows).fill({} as T);
      newPaginatedData = [...newPaginatedData, ...emptyArray];
    }

    setPaginatedData(newPaginatedData);
    setCurrentPage(newPage);

  };

  const handleSorting = (newSortDirection: 'asc' | 'desc', newSortColumn: keyof T) => {

    // FIXME: this needs a HUGE refactor. All this sorting business should be handled in the backend.
    setSortedData(data.sort((a, b) => {
      const aValue = a[newSortColumn];
      const bValue = b[newSortColumn];

      // compare strings case insensitive, also handles string timestamps in millis...
      if (typeof aValue === 'string' && typeof bValue === 'string' && isNaN(Number(aValue))) {
        const comparison = aValue.localeCompare(bValue, undefined, { sensitivity: 'base' });
        // sort them alphabetically although "later" is "higher" in the alphabet
        return newSortDirection === 'desc' ? comparison : -comparison;
      }

      // handle all the other types
      if (aValue < bValue) return newSortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return newSortDirection === 'asc' ? 1 : -1;

      // If tied, compare the next column (desc)
      const nextColumnIndex = columns.indexOf(newSortColumn) + 1;
      const nextColumn = columns[nextColumnIndex];
      if (nextColumnIndex <= columns.length) {
        if(a[nextColumn] > b[nextColumn]) {
          return -1;
        }
      }
      // this is very ugly code, but it will set the on_holiday at the bottom.

      const nextNextColumnIndex = nextColumnIndex + 1;
      const nextNextColumn = columns[nextNextColumnIndex];

      if(nextNextColumnIndex <= columns.length) {
        if(a[nextNextColumn] < b[nextNextColumn]) {
          return -1;
        }
      }

      return 0;

    }));

  };

  useEffect(() => {
    if (!data) return;
    handleSorting(sortDirection, sortColumn);
    setTotalPages(Math.ceil(sortedData.length / rowsPerPage));
    handlePageLoad(1); // initialize it with the first page
  }, [data, sortDirection, sortedData, sortColumn, rowsPerPage]);

  const tableHeaders = columns.map(column => (
    <TableHeaderCell
      className='hover:text-secondary py-5 cursor-pointer capitalize text-center'
      key={String(column) + '-key'}
      onClick={() => handleSortingButton(column)}
    >
      {String(column).replace('_', ' ')}
      <span className='ml-2 text-secondary'>
        {sortColumn === column && (
          sortDirection === 'asc' ? '↑' : '↓'
        )}
      </span>
    </TableHeaderCell>
  ));
  return (
    <div className='p-4 md:p-10'>
      <h1 className='hover:text-secondary text-2xl font-bold'>
        {title}
      </h1>

      <Table>
        {loading ? (
          <>
            <TableHead>
              <TableRow className='bg-dark-bg'>
                <TableHeaderCell className='hover:text-secondary py-5 cursor-pointer capitalize'>
                  <Skeleton style={{ opacity: 0.2 }} />
                </TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>

              {Array.from({ length: rowsPerPage }, (_, index) => (

                <TableRow
                  key={index}
                  className={'px-4 py-2 dark:text-black border-b border-gray-400 cursor-pointer bg-white'}
                >
                  <TableCell className="py-2 px-4">
                    <Skeleton />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </>
        ) : (
          <>
            <TableHead>
              <TableRow className='bg-dark-bg'>
                {tableHeaders}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((item, index) => {
                return (
                  <TableRow
                    key={index}
                    onClick={() => onRowClick && onRowClick(item)}
                    className={`px-4 py-2 dark:text-black border-b border-gray-400 cursor-pointer
										${(item as { on_backup?: boolean }).on_backup ? 'bg-yellow-200' : (item as { on_holiday?: boolean }).on_holiday ? 'bg-red-200' : (item as { on_duty?: boolean }).on_duty ? 'bg-green-200' : 'bg-white'} `}
                  >
                    {columns.map((keyName: keyof T, i) => {

                      if (item[keyName] === undefined) {
                        return <TableCell className="py-2 px-4 text-center" key={String(keyName) + i}>-</TableCell>;
                      }

                      let cellContent = String(item[keyName]); // stringify the value if not undefined

                      if (keyName === 'date') {
                        cellContent = formatDate(item[keyName]); // handle dates
                      }
                      return (
                        <TableCell
                          className="py-2 px-4 text-center text-clip truncate max-w-[60ch]"
                          key={String(keyName) + i}
                        >
                          {cellContent}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );

              }
              )}
            </TableBody>
          </>
        )}
      </Table>
      {/* PAGINATION */}
      <div className="flex justify-end items-center mt-4 space-x-4">
        <button
          onClick={() => handlePageLoad((currentPage - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-dark-bg text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors font-medium"
        >
            Previous
        </button>

        {/* PAGE NUMBER */}
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => handlePageLoad(index + 1)}
            className={`px-3 py-1 text rounded-lg font-medium ${index + 1 === currentPage
              ? 'bg-gray-800 text-white'
              : 'bg-light-bg border border-gray-300 hover:bg-gray-100'}`
            }
          >
            {index + 1}
          </button>
        ))}

        <button
          onClick={() => handlePageLoad(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-dark-bg text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors font-medium"
        >
            Next
        </button>
      </div>
    </div>
  );

}

function UsersTable(params: { organizationName: string, rotationName: string }) {
  const { organizationName, rotationName } = params;
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<SlackUser[]>([]);
  const [userColumns, setUserColumns] = useState<(keyof SlackUser)[]>([]);

  const [selectedUser, setSelectedUser] = useState<SlackUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const BASE_API_URL = window.location.origin + '/api/v1';
      const response = await fetch(
        `${BASE_API_URL}/${organizationName}/${rotationName}/users`
      );
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const { rows: users, columns }: { rows: SlackUser[], columns: (keyof SlackUser)[] } = await response.json();
      setUsers(users);
      setUserColumns(columns);
    };

    fetchUserData().then(() => setLoading(false));
  }, [organizationName, rotationName]);

  const handleUpdateClick = (user: SlackUser) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  if (loading) {
    return <GenericTable<SlackUser>
      title="Team Members"
      sortBy='on_duty'
      data={[]}
      columns={[]}
      loading={true}
    />;
  }

  return (
    <>
      <GenericTable<SlackUser>
        title="Team Members"
        sortBy='on_duty'
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

  useEffect(() => {

    const fetchLogsData = async () => {
      const BASE_API_URL = window.location.origin + '/api/v1';

      const response = await fetch(
        `${BASE_API_URL}/${organizationName}/${rotationName}/logs`
      );

      const { rows: logs, columns }: { rows: Log[], columns: (keyof Log)[] } = await response.json();
      setLogs(logs);
      setLogColumns(columns);
    };

    fetchLogsData().then(() => setLogsLoading(false));
  }, [organizationName, rotationName]);

  if (logsLoading) {
    return <GenericTable<Log>
      title="Logs Data"
      sortBy='date'
      data={[]}
      columns={[]}
      loading={true}
    />;
  }

  return (
    <GenericTable<Log>
      title="Logs Data"
      sortBy='date'
      data={logs}
      columns={logColumns}
      loading={logsLoading}
    />
  );
}

export default function Dashboard() {
  const params = useSearchParams();

  const organization_id = params?.get('organization_id');
  const rotation_id = params?.get('rotation_id');

  if (!organization_id || !rotation_id) {
    return <div className='h-screen w-screen flex items-center justify-center' />;
  }

  return (
    <>
      <UsersTable organizationName={organization_id} rotationName={rotation_id} />
      <LogsTable organizationName={organization_id} rotationName={rotation_id} />
    </>
  );
}
