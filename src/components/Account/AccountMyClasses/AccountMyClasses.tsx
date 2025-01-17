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
import { fetchCreditCount } from "@/app/api/v1/credits/request";
import { addMonths, addWeeks } from "date-fns";
import { getWeeklyOccurencesForPeriod } from "@/lib/utils";
import { BookedClass } from "@prisma/client";

type ClassItem = { id: string } & Pick<BookedClass, "date" | "recurring">;

const AccountMyClasses = () => {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [creditCount, setCreditCount] = useState(0);

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
              <DropdownItem onClick={() => handleOpenModal(item)}>
                Delete
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      ),
    },
  ];

  const initialVisibleColumns = [
    "date",
    "time",
    "join",
    "actions",
    "hasCredit",
  ];

  const handleDelete = async () => {
    if (!selectedClass) return;

    try {
      const bookedClassId = selectedClass.recurring
        ? decodeClassId(selectedClass.id).bookedClassId
        : Number(selectedClass.id);

      await deleteBookedClass(bookedClassId, new Date(selectedClass.date));
      setClasses((prevClasses) =>
        prevClasses.filter((c) => c.id !== selectedClass.id)
      );
    } catch (err) {
      logger.error({ err }, "Failed to delete class");
    } finally {
      onClose();
    }
  };

  const handleOpenModal = (classItem: ClassItem) => {
    setSelectedClass(classItem);
    onOpen();
  };

  const handleCloseModal = () => {
    onClose();
    setSelectedClass(null);
  };

  useEffect(() => {
    const loadClasses = async () => {
      try {
        let classes = await fetchBookedClasses();
        classes = expandClasses(classes);
        classes = filterClasses(classes);
        classes = sortClasses(classes);
        classes = markClassesWithCredit(classes, creditCount);

        setClasses(classes);
      } catch (err) {
        logger.error({ err }, "Failed to fetch classes");
      } finally {
        setLoading(false);
      }
    };
    loadClasses();
  }, [creditCount]);

  useEffect(() => {
    const loadCreditCount = async () => {
      const creditCount = await fetchCreditCount();
      setCreditCount(creditCount);
    };
    loadCreditCount();
  }, []);

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

const expandClasses = (classes: ClassItem[]) => {
  return classes.flatMap((classItem: ClassItem) => {
    const classDate = new Date(classItem.date);
    const isRecurring = classItem.recurring === true;
    const classes = [];

    if (isRecurring) {
      const occurencesForMonth = getWeeklyOccurencesForPeriod(
        classDate,
        addMonths(classDate, 1)
      );

      for (let i = 0; i < occurencesForMonth.length; i++) {
        const recurringClassDate = addWeeks(classDate, i);

        const recurringClassItem = {
          ...classItem,
          id: encodeClassId(classItem.id, i),
        };

        classes.push({
          ...recurringClassItem,
          date: recurringClassDate,
        });
      }
    } else {
      classes.push({ ...classItem, id: classItem.id.toString() });
    }

    return classes;
  });
};

const filterClasses = (classes: ClassItem[]) => {
  return classes.filter((classItem) => {
    return new Date() < new Date(classItem.date);
  });
};

const sortClasses = (classes: ClassItem[]) => {
  return classes.sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
};

const markClassesWithCredit = (classes: ClassItem[], creditCount: number) => {
  return classes.map((classItem, index) => {
    if (creditCount > index) {
      return { ...classItem, hasCredit: true };
    }
    return { ...classItem, hasCredit: false };
  });
};

const encodeClassId = (classId: string, index: number) => {
  return encodeURIComponent(`recurring-${classId}-${index}`);
};

const decodeClassId = (
  classId: string
): { bookedClassId: number; index: number } => {
  const [, bookedClassId, index] = classId.split("-");
  return { bookedClassId: Number(bookedClassId), index: Number(index) };
};
