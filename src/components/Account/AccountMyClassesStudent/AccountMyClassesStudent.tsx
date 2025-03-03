"use client";

import React, { useCallback } from "react";
import { toast } from "react-toastify";
import logger from "@/lib/logger";
import { useStudentClasses } from "@/hooks/useStudentClasses";
import { useCreditCount } from "@/hooks/useCreditCount";
import useClassModals from "@/hooks/useClassModals";
import useRescheduleClass from "@/hooks/useRescheduleClass";
import AccountMyClassesStudentTable from "./AccountMyClassesStudentTable";
import DeleteClassModal from "./DeleteClassModal";
import RescheduleClassModal from "./RescheduleClassModal";
import {
  deleteBookedClassRequest,
  rescheduleBookedClassRequest,
} from "src/app/api/v1/booked-classes/[id]/request";
import { determineBookedClassId } from "@/lib/utils";
import useDeleteClass from "@/hooks/useDeleteClass";
import { differenceInMinutes, addDays, isBefore } from "date-fns";
import { StudentClass } from "@/lib/types";
import {
  MIN_MODIFY_BOOKING_DAYS,
  RECENTLY_CREATED_BOOKING_MINUTES,
} from "@/lib/constants";

const AccountMyClassesStudent = () => {
  const creditCount = useCreditCount();
  const { classes, loading, setClasses, fetchClasses } =
    useStudentClasses(creditCount);
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

  const canModifyBooking = useCallback((selectedClass: StudentClass) => {
    if (!selectedClass) return false;

    const now = new Date();
    const classDate = new Date(selectedClass.date);
    const bookingTime = new Date(selectedClass.createdAt);

    const isWithinMinBookingDays = isBefore(
      classDate,
      addDays(now, MIN_MODIFY_BOOKING_DAYS)
    );
    const wasRecentlyCreated =
      differenceInMinutes(now, bookingTime) <= RECENTLY_CREATED_BOOKING_MINUTES;

    return !(isWithinMinBookingDays && !wasRecentlyCreated);
  }, []);

  const handleRescheduleBooking = useCallback(async () => {
    if (!selectedClass || !rescheduleDate) return;

    if (!canModifyBooking(selectedClass)) {
      toast.error("Cannot reschedule classes within 3 days of the start time.");
      logger.error(
        { classDate: selectedClass.date, bookingTime: selectedClass.createdAt },
        "Cannot reschedule classes within 3 days of the start time."
      );
      return;
    }

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
  }, [
    selectedClass,
    rescheduleDate,
    canModifyBooking,
    fetchClasses,
    rescheduleClassModal,
  ]);

  const handleDeleteBooking = useCallback(async () => {
    if (!selectedClass) return;

    if (!canModifyBooking(selectedClass)) {
      toast.error("Cannot cancel classes within 3 days of the start time.");
      logger.error(
        { classDate: selectedClass.date, bookingTime: selectedClass.createdAt },
        "Cannot cancel classes within 3 days of the start time."
      );
      return;
    }

    try {
      const bookedClassId = determineBookedClassId(selectedClass);

      await deleteBookedClassRequest(
        bookedClassId,
        new Date(selectedClass.date),
        deleteFutureOccurences
      );

      setClasses((prevClasses) =>
        prevClasses.filter((c) => c.id !== selectedClass.id)
      );
      await fetchClasses();
      toast.success("Class deleted successfully");
    } catch (err: unknown) {
      toast.error("Failed to delete class");
      logger.error(err, "Failed to delete class");
    } finally {
      deleteClassModal.onClose();
    }
  }, [
    selectedClass,
    canModifyBooking,
    deleteFutureOccurences,
    setClasses,
    fetchClasses,
    deleteClassModal,
  ]);

  return (
    <div>
      <h1>My Classes</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <AccountMyClassesStudentTable
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

export default AccountMyClassesStudent;
