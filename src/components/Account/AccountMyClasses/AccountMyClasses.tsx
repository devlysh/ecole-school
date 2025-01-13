"use client";

import React, { useEffect, useState } from "react";
import { fetchBookedClasses } from "src/app/api/v1/booked-classes/request";
import GenericTable from "src/components/GenericTable";

interface ClassItem extends Record<string, unknown> {
  date: string;
  time: string;
}

const AccountMyClasses = () => {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const data = await fetchBookedClasses();
        setClasses(data);
      } catch (error) {
        console.error("Failed to fetch classes", error);
      } finally {
        setLoading(false);
      }
    };
    loadClasses();
  }, []);

  const paginatedClasses = classes.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const columns = [
    {
      name: "Class Date",
      uid: "date",
      key: "date",
      render: (item: Record<string, unknown>) => (
        <span>{item.date as string}</span>
      ),
    },
    {
      name: "Class Time",
      uid: "time",
      key: "time",
      render: (item: Record<string, unknown>) => (
        <span>{item.time as string}</span>
      ),
    },
    {
      name: "Join",
      uid: "join",
      key: "join",
      render: () => <button>Join</button>,
    },
    {
      name: "Actions",
      uid: "actions",
      key: "actions",
      render: () => <button>...</button>,
    },
  ];

  const initialVisibleColumns = ["date", "time", "join", "actions"];

  return (
    <div>
      <h1>My Classes</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <GenericTable
            columns={columns}
            list={paginatedClasses}
            initialVisibleColumns={initialVisibleColumns}
          />
          <div>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>Page {currentPage}</span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage * pageSize >= classes.length}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AccountMyClasses;
