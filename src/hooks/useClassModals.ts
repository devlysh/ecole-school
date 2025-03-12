"use client";

import { useDisclosure } from "@nextui-org/react";
import { useState, useCallback } from "react";
import { DisplayBookedClass } from "@/lib/types";

const useClassModals = () => {
  const deleteClassModal = useDisclosure();
  const rescheduleClassModal = useDisclosure();
  const [selectedClass, setSelectedClass] = useState<DisplayBookedClass | null>(null);

  const handleOpenDeleteBookingModal = useCallback(
    (classItem: DisplayBookedClass) => {
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
    (classItem: DisplayBookedClass) => {
      setSelectedClass(classItem);
      rescheduleClassModal.onOpen();
    },
    [rescheduleClassModal]
  );

  const handleCloseRescheduleBookingModal = useCallback(() => {
    rescheduleClassModal.onClose();
    setSelectedClass(null);
  }, [rescheduleClassModal]);

  return {
    deleteClassModal,
    rescheduleClassModal,
    selectedClass,
    handleOpenDeleteBookingModal,
    handleCloseDeleteBookingModal,
    handleOpenRescheduleBookingModal,
    handleCloseRescheduleBookingModal,
  };
};

export default useClassModals;
