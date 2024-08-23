import React, { useState, useEffect } from "react";
import {
  // Card, we will be using this the moment we implement a proper dashboard
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@tremor/react";

import { SlackUser } from 'types'

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
    className={`px-4 py-2 rounded-full font-semibold border-2 ${available
      ? "border-green-500 text-gray-300 bg-transparent hover:bg-green-500 hover:text-white"
      : "border-red-500 text-gray-300 bg-transparent hover:bg-red-500 hover:text-white"
      } transition-colors duration-200`}
  >
    {available ? "Available" : "Unavailable"}
  </button>
);

// TableHero
export function TableHero() {
  const [data, setData] = useState<SlackUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortColumn, setSortColumn] = useState<string | null>("on_holiday");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const fetchData = async () => {
    const BASE_API_URL = 'http://localhost:3000/api/v1'
    try {
      setLoading(true);
      const response = await fetch(
        BASE_API_URL + "/marandino_workspace/rotation"
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const result: ApiResponse = await response.json();

      // Transform the data
      const users: SlackUser[] = result.users.rows.map((row) => ({
        slack_id: row[0] as string,
        full_name: row[1] as string,
        on_holiday: row[2] as boolean,
        on_duty: row[3] as boolean,
        count: row[4] as number,
        on_backup: row[5] as boolean,
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
    handleSort("on_duty");
  }, []);

  const handleSort = (column: keyof SlackUser) => {
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
                  onClick={() => handleSort("full_name")}
                >
                  Full Name{" "}
                  {sortColumn === "full_name" &&
                    (sortDirection === "asc" ? "↑" : "↓")}
                </TableHeaderCell>
                <TableHeaderCell
                  className="text-gray-300 py-5 border-b border-gray-300 cursor-pointer"
                  onClick={() => handleSort("slack_id")}
                >
                  Slack ID{" "}
                  {sortColumn === "slack_id" &&
                    (sortDirection === "asc" ? "↑" : "↓")}
                </TableHeaderCell>
                <TableHeaderCell
                  className="text-gray-300 py-5 border-b border-gray-300 cursor-pointer"
                  onClick={() => handleSort("on_duty")}
                >
                  On Duty{" "}
                  {sortColumn === "on_duty" &&
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
                  onClick={() => handleSort("on_backup")}
                >
                  on_backup{" "}
                  {sortColumn === "on_backup" &&
                    (sortDirection === "asc" ? "↑" : "↓")}
                </TableHeaderCell>
                <TableHeaderCell
                  className="text-gray-300 py-5 border-b border-gray-300 cursor-pointer"
                  onClick={() => handleSort("on_holiday")}
                >
                  on_holiday{" "}
                  {sortColumn === "on_holiday" &&
                    (sortDirection === "asc" ? "↑" : "↓")}
                </TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((item) => (
                <TableRow
                  key={item.slack_id}
                  className="text-gray-300 hover:bg-gray-200 hover:bg-opacity-50 transition-colors duration-200 border-b border-gray-300"
                >
                  <TableCell className="bg-gray-600 px-4 py-2 text-sm">
                    {item.full_name}
                  </TableCell>
                  <TableCell className="px-4 py-2 text-sm">
                    {item.slack_id}
                  </TableCell>
                  <TableCell className="bg-gray-600 px-4 py-2 text-sm text-center">
                    {item.on_duty ? "True" : "False"}
                  </TableCell>
                  <TableCell className="px-4 py-2 text-sm">
                    {item.count}
                  </TableCell>
                  <TableCell className="bg-gray-600 px-4 py-2 text-sm">
                    {item.on_backup}
                  </TableCell>
                  <TableCell className="bg-gray-600 px-4 py-2 text-sm">
                    <AvailabilityButton available={!item.on_holiday} />
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
