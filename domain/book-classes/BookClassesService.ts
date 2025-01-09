import { parseISO } from "date-fns";
import { RRule } from "rrule";
import { AvailableSlot } from "@prisma/client";
import { BookClassesRepository } from "./BookClassesRepository";

export const BookClassesService = {
  async bookClasses(email: string, dates: string[], isFixedSchedule: boolean) {
    const user = await BookClassesRepository.findUserByEmail(email);

    if (!user?.student) {
      throw new Error("You must be a student to book classes");
    }

    const studentId = user.id;
    let { assignedTeacherId } = user.student;
    const recurring = !!isFixedSchedule;

    if (!assignedTeacherId) {
      const allSlots = await BookClassesRepository.findAvailableSlots();

      const teacherSlotsMap = new Map<number, typeof allSlots>();
      for (const slot of allSlots) {
        const arr = teacherSlotsMap.get(slot.teacherId) || [];
        arr.push(slot);
        teacherSlotsMap.set(slot.teacherId, arr);
      }

      const isDateCoveredBySlot = (dateString: string, slot: AvailableSlot) => {
        const parsedDate = parseISO(dateString);
        if (slot.rrule) {
          try {
            const options = RRule.parseString(slot.rrule);
            options.dtstart = new Date(slot.startTime);
            const rule = new RRule(options);
            const nextOccurences = rule.between(parsedDate, parsedDate, true);
            if (nextOccurences.length > 0) {
              const slotStartHour = new Date(slot.startTime).getUTCHours();
              const slotEndHour = new Date(slot.endTime).getUTCHours();
              const dateHour = parsedDate.getUTCHours();
              return dateHour >= slotStartHour && dateHour < slotEndHour;
            }
          } catch (e) {
            throw new Error("Failed to parse or check rrule");
          }
          return false;
        } else {
          const slotDateStr = new Date(slot.startTime)
            .toISOString()
            .slice(0, 10);
          const requestDateStr = parsedDate.toISOString().slice(0, 10);
          return slotDateStr === requestDateStr;
        }
      };

      const canTeacherCoverAllDates = async (
        teacherId: number,
        slots: AvailableSlot[]
      ) => {
        const teacherBookings = await BookClassesRepository.findTeacherBookings(teacherId, dates);
        const teacherHasBookingCollision = teacherBookings.some((bc) => {
          const bcTime = bc.date.getTime();
          return dates.some((d: string) => parseISO(d).getTime() === bcTime);
        });
        if (teacherHasBookingCollision) return false;

        return dates.every((dateStr: string) =>
          slots.some((slot) => isDateCoveredBySlot(dateStr, slot))
        );
      };

      const teacherIds = Array.from(teacherSlotsMap.keys());
      let foundTeacherId: number | null = null;

      for (const tid of teacherIds) {
        const teacherAvailableSlots = teacherSlotsMap.get(tid) || [];
        if (await canTeacherCoverAllDates(tid, teacherAvailableSlots)) {
          foundTeacherId = tid;
          break;
        }
      }

      if (!foundTeacherId) {
        throw new Error("No teacher found who can cover all requested dates.");
      }

      assignedTeacherId = foundTeacherId;
      await BookClassesRepository.updateStudentAssignedTeacher(studentId, foundTeacherId);
    } else {
      const collisions = await BookClassesRepository.findTeacherBookings(assignedTeacherId, dates);
      if (collisions.length > 0) {
        throw new Error("Assigned teacher is busy for one or more of these dates.");
      }
    }

    const newBookingsData = dates.map((dateStr: string) => ({
      date: parseISO(dateStr),
      studentId: studentId,
      teacherId: assignedTeacherId!,
      recurring,
    }));

    await BookClassesRepository.createBookedClasses(newBookingsData);

    return { success: true };
  },
};
