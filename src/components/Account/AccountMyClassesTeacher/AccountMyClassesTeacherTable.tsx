import React, { useMemo } from "react";
import GenericTable from "src/components/GenericTable";
import { TeacherClass } from "@/lib/types";

interface AccountMyClassesTeacherTableProps {
  classes: TeacherClass[];
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
        render: (item: TeacherClass) => (
          <span>{new Date(item.date).toLocaleDateString()}</span>
        ),
      },
      {
        name: "Class Time",
        uid: "time",
        key: "time",
        render: (item: TeacherClass) => (
          <span>{new Date(item.date).toLocaleTimeString()}</span>
        ),
      },
      {
        name: "Student Name",
        uid: "studentName",
        key: "studentName",
        render: (item: TeacherClass) => <span>{item.studentName}</span>,
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

  const initialVisibleColumns = ["date", "time", "studentName", "join"];

  return (
    <GenericTable
      columns={columns}
      list={classes}
      initialVisibleColumns={initialVisibleColumns}
    />
  );
};

export default AccountMyClassesTeacherTable;
