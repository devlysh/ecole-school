"use client";

import { useDisclosure } from "@nextui-org/react";
import { useState, useCallback } from "react";
import { StudentClass } from "@/lib/types";

const useClassModals = () => {
  const deleteClassModal = useDisclosure();
  const rescheduleClassModal = useDisclosure();
  const [selectedClass, setSelectedClass] = useState<StudentClass | null>(null);

  const handleOpenDeleteBookingModal = useCallback(
    (classItem: StudentClass) => {
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
    (classItem: StudentClass) => {
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
