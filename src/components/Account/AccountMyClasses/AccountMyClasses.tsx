"use client";

import React, { useState, useMemo, useCallback } from "react";
import { deleteBookedClass } from "src/app/api/v1/booked-classes/[id]/request";
import GenericTable from "src/components/GenericTable";
import {
  Modal,
  Button,
  ModalBody,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  ModalContent,
  ModalHeader,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import logger from "@/lib/logger";
import { VerticalDotsIcon } from "@/icons";
import { decodeClassId, useClasses } from "@/hooks/useClasses";
import { ClassItem } from "@/lib/types";
import { useCreditCount } from "@/hooks/useCreditCount";

const AccountMyClasses = () => {
  const creditCount = useCreditCount();
  const { classes, loading, setClasses } = useClasses(creditCount);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleDelete = useCallback(async () => {
    if (!selectedClass) return;

    try {
      const bookedClassId = selectedClass.recurring
        ? decodeClassId(selectedClass.id).bookedClassId
        : Number(selectedClass.id);

      await deleteBookedClass(bookedClassId, new Date(selectedClass.date));
      setClasses((prevClasses: ClassItem[]) =>
        prevClasses.filter((c: ClassItem) => c.id !== selectedClass.id)
      );
    } catch (err) {
      logger.error({ err }, "Failed to delete class");
    } finally {
      onClose();
    }
  }, [onClose, selectedClass, setClasses]);

  const handleOpenDeleteBookingModal = useCallback(
    (classItem: ClassItem) => {
      setSelectedClass(classItem);
      onOpen();
    },
    [onOpen]
  );

  const handleCloseModal = () => {
    onClose();
    setSelectedClass(null);
  };

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
                  onClick={() => handleOpenDeleteBookingModal(item)}
                >
                  Delete booking
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        ),
      },
    ],
    [handleOpenDeleteBookingModal]
  );

  const initialVisibleColumns = [
    "date",
    "time",
    "join",
    "actions",
    "hasCredit",
  ];

  return (
    <div>
      <h1>My Classes</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <GenericTable
            columns={columns}
            list={classes}
            initialVisibleColumns={initialVisibleColumns}
          />
        </>
      )}
      <Modal isOpen={isOpen} onClose={handleCloseModal}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Confirm Deletion
          </ModalHeader>
          <ModalBody>
            <p>Are you sure you want to delete this class?</p>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={handleCloseModal}>
              No
            </Button>
            <Button color="primary" onPress={handleDelete}>
              Yes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default AccountMyClasses;
