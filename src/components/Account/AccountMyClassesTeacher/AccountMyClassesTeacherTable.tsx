import React, { useMemo } from "react";
import GenericTable from "src/components/GenericTable";
import { ClassItem } from "@/lib/types";

interface AccountMyClassesTeacherTableProps {
  classes: ClassItem[];
  handleOpenRescheduleBookingModal: (classItem: ClassItem) => void;
  handleOpenDeleteBookingModal: (classItem: ClassItem) => void;
}

const AccountMyClassesTeacherTable: React.FC<
  AccountMyClassesTeacherTableProps
> = ({ classes }) => {
  const columns = useMemo(
    () => [
      {
        name: "Class Date",
        uid: "date",
        key: "date",
        render: (item: Record<string, unknown>) => (
          <span>{new Date(item.date as string).toLocaleDateString()}</span>
        ),
      },
      {
        name: "Class Time",
        uid: "time",
        key: "time",
        render: (item: Record<string, unknown>) => (
          <span>{new Date(item.date as string).toLocaleTimeString()}</span>
        ),
      },
      {
        name: "Student info",
        uid: "studentInfo",
        key: "studentInfo",
        render: (item: Record<string, unknown>) => (
          <span>{JSON.stringify(item.studentInfo)}</span>
        ),
      },
      {
        name: "Join",
        uid: "join",
        key: "join",
        render: () => <button>Join</button>,
      },
    ],
    []
  );

  const initialVisibleColumns = [
    "date",
    "time",
    "join",
    "actions",
    "hasCredit",
  ];

  return (
    <GenericTable
      columns={columns}
      list={classes}
      initialVisibleColumns={initialVisibleColumns}
    />
  );
};

export default AccountMyClassesTeacherTable;
