"use client";

import React from "react";
import { toast } from "react-toastify";
import logger from "@/lib/logger";
import { useTeacherClasses } from "@/hooks/useTeacherClasses";
import useClassModals from "@/hooks/useClassModals";
import useRescheduleClass from "@/hooks/useRescheduleClass";
import AccountMyClassesTeacherTable from "./AccountMyClassesTeacherTable";
import DeleteClassModal from "../AccountMyClassesStudent/DeleteClassModal";
import RescheduleClassModal from "../AccountMyClassesStudent/RescheduleClassModal";
import {
  deleteBookedClassRequest,
  rescheduleBookedClassRequest,
} from "src/app/api/v1/booked-classes/[id]/request";
import { determineBookedClassId } from "@/lib/utils";
import useDeleteClass from "@/hooks/useDeleteClass";

const AccountMyClassesTeacher = () => {
  const { classes, loading, setClasses, fetchClasses } = useTeacherClasses();
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

      await rescheduleBookedClassRequest(
        bookedClassId,
        new Date(selectedClass.date),
        new Date(rescheduleDate)
      );
      await fetchClasses();
      toast.success("Class rescheduled successfully");
    } catch (err: unknown) {
      toast.error(
        "The selected slot is not available. Please choose another date."
      );
      logger.error(
        { err, classDate: selectedClass.date, rescheduleDate },
        "Failed to reschedule class"
      );
    } finally {
      rescheduleClassModal.onClose();
    }
  };

  const handleDeleteBooking = async () => {
    if (!selectedClass) return;

    try {
      const bookedClassId = determineBookedClassId(selectedClass);

      await deleteBookedClassRequest(
        bookedClassId,
        new Date(selectedClass.date),
        deleteFutureOccurences
      );

      setClasses();
      await fetchClasses();
      toast.success("Class deleted successfully");
    } catch (err: unknown) {
      toast.error("Failed to delete class");
      logger.error(err, "Failed to delete class");
    } finally {
      deleteClassModal.onClose();
    }
  };

  return (
    <div>
      <h1>My Classes</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <AccountMyClassesTeacherTable
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

export default AccountMyClassesTeacher;
