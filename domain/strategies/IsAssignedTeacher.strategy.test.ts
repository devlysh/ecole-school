import { IsAssignedTeacherStrategy } from "./IsAssignedTeacher.strategy";
import { AvailableSlot, Student } from "@prisma/client";

describe("IsAssignedTeacherStrategy", () => {
  it("should validate a slot assigned to the correct teacher", () => {
    const slot: AvailableSlot = {
      id: 1,
      teacherId: 1,
      startTime: new Date("2023-01-01T09:00:00Z"),
      endTime: new Date("2023-01-01T11:00:00Z"),
      rrule: null,
    };

    const student: Student = {
      userId: 1,
      assignedTeacherId: 1,
      stripeCustomerId: "1",
      stripeSubscriptionId: "1",
    };

    const strategy = new IsAssignedTeacherStrategy();
    expect(
      strategy.isAvailable({
        slot,
        assignedTeacherId: student.assignedTeacherId ?? undefined,
      })
    ).toBe(true);
  });

  it("should return false if the assigned teacher id is defined but the slot is not assigned to current teacher", () => {
    const slot: AvailableSlot = {
      id: 1,
      teacherId: 2,
      startTime: new Date("2023-01-01T09:00:00Z"),
      endTime: new Date("2023-01-01T11:00:00Z"),
      rrule: null,
    };

    const strategy = new IsAssignedTeacherStrategy();
    expect(
      strategy.isAvailable({
        slot,
        assignedTeacherId: 3,
      })
    ).toBe(false);
  });
});
