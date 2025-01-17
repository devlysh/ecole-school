"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  deleteBookedClass,
  rescheduleBookedClass,
} from "src/app/api/v1/booked-classes/[id]/request";
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
  DatePicker,
} from "@nextui-org/react";
import logger from "@/lib/logger";
import { VerticalDotsIcon } from "@/icons";
import { decodeClassId, useClasses } from "@/hooks/useClasses";
import { ClassItem } from "@/lib/types";
import { useCreditCount } from "@/hooks/useCreditCount";
import { fromDate } from "@internationalized/date";
import { ZonedDateTime } from "@internationalized/date";
import { ToastContainer, toast } from "react-toastify";

const AccountMyClasses = () => {
  const creditCount = useCreditCount();
  const { classes, loading, setClasses, fetchClasses } =
    useClasses(creditCount);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<Date | null>(null);

  const deleteClassModal = useDisclosure();
  const rescheduleClassModal = useDisclosure();

  const handleRescheduleBooking = useCallback(async () => {
    if (!selectedClass || !rescheduleDate) return;

    try {
      const bookedClassId = selectedClass.recurring
        ? decodeClassId(selectedClass.id).bookedClassId
        : Number(selectedClass.id);

      await rescheduleBookedClass(
        bookedClassId,
        new Date(selectedClass.date),
        new Date(rescheduleDate)
      );
      await fetchClasses();
    } catch (err) {
      logger.error({ err }, "Failed to reschedule class");
      toast.error(
        "The selected slot is not available. Please choose another date."
      );
    } finally {
      rescheduleClassModal.onClose();
    }
  }, [rescheduleClassModal, rescheduleDate, selectedClass, fetchClasses]);

  const handleDeleteBooking = useCallback(async () => {
    if (!selectedClass) return;

    try {
      const bookedClassId = selectedClass.recurring
        ? decodeClassId(selectedClass.id).bookedClassId
        : Number(selectedClass.id);

      await deleteBookedClass(bookedClassId, new Date(selectedClass.date));
      setClasses((prevClasses) =>
        prevClasses.filter((c) => c.id !== selectedClass.id)
      );
      await fetchClasses();
    } catch (err) {
      logger.error({ err }, "Failed to delete class");
    } finally {
      deleteClassModal.onClose();
    }
  }, [deleteClassModal, selectedClass, setClasses, fetchClasses]);

  const handleOpenDeleteBookingModal = useCallback(
    (classItem: ClassItem) => {
      setSelectedClass(classItem);
      deleteClassModal.onOpen();
    },
    [deleteClassModal]
  );

  const handleCloseDeleteBookingModal = useCallback(() => {
    deleteClassModal.onClose();
    setSelectedClass(null);
  }, [deleteClassModal]);

  const handleOpenRescheduleBookingModal = useCallback(
    (classItem: ClassItem) => {
      setSelectedClass(classItem);
      rescheduleClassModal.onOpen();
    },
    [rescheduleClassModal]
  );

  const handleCloseRescheduleBookingModal = useCallback(() => {
    rescheduleClassModal.onClose();
    setSelectedClass(null);
  }, [rescheduleClassModal]);

  const handleChangeRescheduleDate = useCallback((date: ZonedDateTime) => {
    setRescheduleDate(date.toDate());
  }, []);

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
    <div>
      <ToastContainer />
      <h1>My Classes</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <GenericTable
          columns={columns}
          list={classes}
          initialVisibleColumns={initialVisibleColumns}
        />
      )}
      <Modal
        isOpen={deleteClassModal.isOpen}
        onClose={handleCloseDeleteBookingModal}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Confirm Deletion
          </ModalHeader>
          <ModalBody>
            <p>Are you sure you want to delete this class?</p>
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              variant="light"
              onPress={handleCloseDeleteBookingModal}
            >
              No
            </Button>
            <Button color="primary" onPress={handleDeleteBooking}>
              Yes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal
        isOpen={rescheduleClassModal.isOpen}
        onClose={handleCloseRescheduleBookingModal}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Reschedule Class
          </ModalHeader>
          <ModalBody>
            <DatePicker
              hideTimeZone
              showMonthAndYearPickers
              label="Event Date"
              variant="bordered"
              onChange={handleChangeRescheduleDate}
              defaultValue={
                selectedClass?.date
                  ? fromDate(
                      new Date(selectedClass.date),
                      Intl.DateTimeFormat().resolvedOptions().timeZone
                    )
                  : fromDate(
                      new Date(),
                      Intl.DateTimeFormat().resolvedOptions().timeZone
                    )
              }
            />
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              variant="light"
              onPress={handleCloseRescheduleBookingModal}
            >
              Cancel
            </Button>
            <Button color="primary" onPress={handleRescheduleBooking}>
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default AccountMyClasses;
