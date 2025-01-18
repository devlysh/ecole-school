"use client";

import React from "react";
import { ToastContainer, toast } from "react-toastify";
import logger from "@/lib/logger";
import { useClasses } from "@/hooks/useClasses";
import { useCreditCount } from "@/hooks/useCreditCount";
import useClassModals from "@/hooks/useClassModals";
import useRescheduleClass from "@/hooks/useRescheduleClass";
import MyClassesTable from "./MyClassesTable";
import DeleteClassModal from "./DeleteClassModal";
import RescheduleClassModal from "./RescheduleClassModal";
import {
  deleteBookedClass,
  rescheduleBookedClass,
} from "src/app/api/v1/booked-classes/[id]/request";
import { determineBookedClassId } from "@/lib/utils";
import useDeleteClass from "@/hooks/useDeleteClass";

const AccountMyClasses = () => {
  const creditCount = useCreditCount();
  const { classes, loading, setClasses, fetchClasses } =
    useClasses(creditCount);
  const {
    deleteClassModal,
    rescheduleClassModal,
    selectedClass,
    handleOpenDeleteBookingModal,
    handleCloseDeleteBookingModal,
    handleOpenRescheduleBookingModal,
    handleCloseRescheduleBookingModal,
  } = useClassModals();
  const { rescheduleDate, handleChangeRescheduleDate } = useRescheduleClass();
  const { deleteFutureOccurences, setDeleteFutureOccurences } =
    useDeleteClass();

  const handleRescheduleBooking = async () => {
    if (!selectedClass || !rescheduleDate) return;

    try {
      const bookedClassId = determineBookedClassId(selectedClass);

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
  };

  const handleDeleteBooking = async () => {
    if (!selectedClass) return;

    try {
      const bookedClassId = determineBookedClassId(selectedClass);

      await deleteBookedClass(
        bookedClassId,
        new Date(selectedClass.date),
        deleteFutureOccurences
      );

      setClasses((prevClasses) =>
        prevClasses.filter((c) => c.id !== selectedClass.id)
      );
      await fetchClasses();
    } catch (err) {
      logger.error({ err }, "Failed to delete class");
    } finally {
      deleteClassModal.onClose();
    }
  };

  return (
    <div>
      <ToastContainer />
      <h1>My Classes</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <MyClassesTable
          classes={classes}
          handleOpenRescheduleBookingModal={handleOpenRescheduleBookingModal}
          handleOpenDeleteBookingModal={handleOpenDeleteBookingModal}
        />
      )}
      <DeleteClassModal
        isOpen={deleteClassModal.isOpen}
        onClose={handleCloseDeleteBookingModal}
        onDelete={handleDeleteBooking}
        isRecurring={selectedClass?.recurring ?? false}
        deleteFutureOccurences={deleteFutureOccurences}
        setDeleteFutureOccurences={setDeleteFutureOccurences}
      />
      <RescheduleClassModal
        isOpen={rescheduleClassModal.isOpen}
        onClose={handleCloseRescheduleBookingModal}
        onConfirm={handleRescheduleBooking}
        selectedClass={selectedClass}
        onChangeDate={handleChangeRescheduleDate}
      />
    </div>
  );
};

export default AccountMyClasses;
