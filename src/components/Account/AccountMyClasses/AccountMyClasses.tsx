"use client";

import React, { useEffect, useState } from "react";
import { fetchBookedClasses } from "src/app/api/v1/booked-classes/request";
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

interface ClassItem extends Record<string, unknown> {
  id: string;
  date: string;
  time: string;
}

const AccountMyClasses = () => {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const pageSize = 10;
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const data = await fetchBookedClasses();
        setClasses(data);
      } catch (err) {
        logger.error({ err }, "Failed to fetch classes");
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

  const handleDelete = async () => {
    if (selectedClass) {
      try {
        await deleteBookedClass(selectedClass.id);
        setClasses(classes.filter((c) => c.id !== selectedClass.id));
      } catch (err) {
        logger.error({ err }, "Failed to delete class");
      } finally {
        onClose();
      }
    }
  };

  const handleOpenModal = (classItem: ClassItem) => {
    logger.info({ classItem }, "Selected class");
    setSelectedClass(classItem);
    onOpen();
  };

  const handleCloseModal = () => {
    onClose();
    setSelectedClass(null);
  };

  const columns = [
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
              <DropdownItem onClick={() => handleOpenModal(item)}>
                Delete
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      ),
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
