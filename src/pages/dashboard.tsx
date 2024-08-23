import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@tremor/react";

// Database
interface User {
  slackid: string;
  fullname: string;
  holiday: boolean;
  onduty: boolean;
  count: number;
  backup: boolean;
}

interface ApiResponse {
  users: {
    columns: string[];
    rows: (string | number | boolean)[][];
  };
}

// Availability Button
const AvailabilityButton: React.FC<{ available: boolean }> = ({
  available,
}) => (
  <button
    className={`px-4 py-2 rounded-full font-semibold border-2 ${
      available
        ? "border-green-500 text-gray-300 bg-transparent hover:bg-green-500 hover:text-white"
        : "border-red-500 text-gray-300 bg-transparent hover:bg-red-500 hover:text-white"
    } transition-colors duration-200`}
  >
    {available ? "Available" : "Unavailable"}
  </button>
);

// TableHero
export function TableHero() {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortColumn, setSortColumn] = useState<string | null>("holiday");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://development-rorro.vercel.app/api/v1/marandino_workspace/pinga"
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const result: ApiResponse = await response.json();

      // Transform the data
      const users: User[] = result.users.rows.map((row) => ({
        slackid: row[0] as string,
        fullname: row[1] as string,
        holiday: row[2] as boolean,
        onduty: row[3] as boolean,
        count: row[4] as number,
        backup: row[5] as boolean,
      }));

      setData(users);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  // Sort data by the default column on component mount
  useEffect(() => {
    handleSort("holiday");
  }, []);

  const handleSort = (column: keyof User) => {
    const newSortDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(newSortDirection);
  
    const sortedData = [...data].sort((a, b) => {
      const aValue = a[column];
      const bValue = b[column];
  
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return newSortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
  
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return newSortDirection === 'asc'
          ? aValue - bValue
          : bValue - aValue;
      }
  
      if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
        return newSortDirection === 'asc'
          ? (aValue ? 1 : 0) - (bValue ? 1 : 0)
          : (bValue ? 1 : 0) - (aValue ? 1 : 0);
      }
  
      return 0;
    });
  
    setData(sortedData);
  };

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
                <TableHeaderCell
                  className="text-gray-300 py-5 border-b border-gray-300 cursor-pointer"
                  onClick={() => handleSort("fullname")}
                >
                  Full Name{" "}
                  {sortColumn === "fullname" &&
                    (sortDirection === "asc" ? "↑" : "↓")}
                </TableHeaderCell>
                <TableHeaderCell
                  className="text-gray-300 py-5 border-b border-gray-300 cursor-pointer"
                  onClick={() => handleSort("slackid")}
                >
                  Slack ID{" "}
                  {sortColumn === "slackid" &&
                    (sortDirection === "asc" ? "↑" : "↓")}
                </TableHeaderCell>
                <TableHeaderCell
                  className="text-gray-300 py-5 border-b border-gray-300 cursor-pointer"
                  onClick={() => handleSort("onduty")}
                >
                  On Duty{" "}
                  {sortColumn === "onduty" &&
                    (sortDirection === "asc" ? "↑" : "↓")}
                </TableHeaderCell>
                <TableHeaderCell
                  className="text-gray-300 py-5 border-b border-gray-300 cursor-pointer"
                  onClick={() => handleSort("count")}
                >
                  Count{" "}
                  {sortColumn === "count" &&
                    (sortDirection === "asc" ? "↑" : "↓")}
                </TableHeaderCell>
                <TableHeaderCell
                  className="text-gray-300 py-5 border-b border-gray-300 cursor-pointer"
                  onClick={() => handleSort("backup")}
                >
                  Backup{" "}
                  {sortColumn === "backup" &&
                    (sortDirection === "asc" ? "↑" : "↓")}
                </TableHeaderCell>
                <TableHeaderCell
                  className="text-gray-300 py-5 border-b border-gray-300 cursor-pointer"
                  onClick={() => handleSort("holiday")}
                >
                  Holiday{" "}
                  {sortColumn === "holiday" &&
                    (sortDirection === "asc" ? "↑" : "↓")}
                </TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((item) => (
                <TableRow
                  key={item.slackid}
                  className="text-gray-300 hover:bg-gray-200 hover:bg-opacity-50 transition-colors duration-200 border-b border-gray-300"
                >
                  <TableCell className="bg-gray-600 px-4 py-2 text-sm">
                    {item.fullname}
                  </TableCell>
                  <TableCell className="px-4 py-2 text-sm">
                    {item.slackid}
                  </TableCell>
                  <TableCell className="bg-gray-600 px-4 py-2 text-sm text-center">
                    {item.onduty ? "True" : "False"}
                  </TableCell>
                  <TableCell className="px-4 py-2 text-sm">
                    {item.count}
                  </TableCell>
                  <TableCell className="bg-gray-600 px-4 py-2 text-sm">
                    {item.backup}
                  </TableCell>
                  <TableCell className="bg-gray-600 px-4 py-2 text-sm">
                    <AvailabilityButton available={!item.holiday} />
                  </TableCell>
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
