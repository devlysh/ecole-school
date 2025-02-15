import { AssignedTeacherStrategy } from "./AssignedTeacher.strategy";
import { AvailableSlot } from "@prisma/client";

describe("AssignedTeacherStrategy", () => {
  it("should validate a slot assigned to the correct teacher", () => {
    const slot: AvailableSlot = {
      id: 1,
      teacherId: 1,
      startTime: new Date("2023-01-01T09:00:00Z"),
      endTime: new Date("2023-01-01T11:00:00Z"),
      rrule: null,
    };

    const strategy = new AssignedTeacherStrategy();
    expect(
      strategy.isAvailable({
        slot,
        assignedTeacherId: 1,
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

    const strategy = new AssignedTeacherStrategy();
    expect(
      strategy.isAvailable({
        slot,
        assignedTeacherId: 3,
      })
    ).toBe(false);
  });
});
