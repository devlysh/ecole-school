"use client";

import React, { useEffect, useMemo, useState } from "react";
import GenericTable from "@/components/GenericTable";
import { Button } from "@nextui-org/react";
import { toast } from "react-toastify";
import logger from "@/lib/logger";
import { getStudentsRequest } from "@/app/api/v1/students/request";

interface Student extends Record<string, unknown> {
  id: string;
  name: string;
  email: string;
  language: string;
  plan: string;
  subscriptionStatus: string;
}

const AccountStudents: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    const fetchStudentsData = async () => {
      try {
        const response = await getStudentsRequest();
        const studentList = (response.data || response).map(
          (student: Student) => ({
            ...student,
            id: student.email,
          })
        );
        setStudents(studentList);
      } catch (err: unknown) {
        toast.error("Error fetching students");
        logger.error(err, "Error fetching students");
      }
    };

    fetchStudentsData();
  }, []);

  const columns = useMemo(
    () => [
      {
        name: "Name",
        uid: "name",
        sortable: true,
        render: (student: Student) => <span>{student.name}</span>,
      },
      {
        name: "Language",
        uid: "language",
        sortable: true,
        render: (student: Student) => <span>{student.language}</span>,
      },
      {
        name: "Email",
        uid: "email",
        sortable: true,
        render: (student: Student) => <span>{student.email}</span>,
      },
      {
        name: "Class History",
        uid: "classhistory",
        render: (student: Student) => (
          <Button
            size="sm"
            onClick={() =>
              toast.info(`Mocked: Open Class History for ${student.name}`)
            }
          >
            Class History
          </Button>
        ),
      },
      {
        name: "Plan",
        uid: "plan",
        sortable: true,
        render: (student: Student) => <span>{student.plan}</span>,
      },
      {
        name: "Subscription Status",
        uid: "subscriptionStatus",
        sortable: true,
        render: (student: Student) => (
          <span
            style={{
              color: student.subscriptionStatus === "active" ? "green" : "red",
            }}
          >
            {student.subscriptionStatus}
          </span>
        ),
      },
      {
        name: "Payment History",
        uid: "paymenthistory",
        render: (student: Student) => (
          <Button
            size="sm"
            onClick={() =>
              toast.info(`Mocked: Open Payment History for ${student.name}`)
            }
          >
            Payment History
          </Button>
        ),
      },
    ],
    []
  );

  return (
    <GenericTable<Student>
      columns={columns}
      list={students}
      initialVisibleColumns={[
        "name",
        "language",
        "email",
        "classhistory",
        "plan",
        "subscriptionStatus",
        "paymenthistory",
      ]}
    />
  );
};

export default AccountStudents;
