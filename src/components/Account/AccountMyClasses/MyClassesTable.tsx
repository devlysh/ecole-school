import React, { useMemo } from "react";
import GenericTable from "src/components/GenericTable";
import { ClassItem } from "@/lib/types";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import { VerticalDotsIcon } from "@/icons";

interface MyClassesTableProps {
  classes: ClassItem[];
  handleOpenRescheduleBookingModal: (classItem: ClassItem) => void;
  handleOpenDeleteBookingModal: (classItem: ClassItem) => void;
}

const MyClassesTable: React.FC<MyClassesTableProps> = ({
  classes,
  handleOpenRescheduleBookingModal,
  handleOpenDeleteBookingModal,
}) => {
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
        name: "Has Credit",
        uid: "hasCredit",
        key: "hasCredit",
        render: (item: Record<string, unknown>) => (
          <span>{JSON.stringify(item.hasCredit)}</span>
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
        render: (item: ClassItem) => (
          <div className="relative flex justify-end items-center gap-2">
            <Dropdown className="bg-background border-1 border-default-200">
              <DropdownTrigger>
                <Button isIconOnly radius="full" size="sm" variant="light">
                  <VerticalDotsIcon className="text-default-400" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem
                  onClick={() => handleOpenRescheduleBookingModal(item)}
                >
                  Reschedule
                </DropdownItem>
                <DropdownItem
                  onClick={() => handleOpenDeleteBookingModal(item)}
                >
                  Delete
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        ),
      },
    ],
    [handleOpenDeleteBookingModal, handleOpenRescheduleBookingModal]
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

export default MyClassesTable;
