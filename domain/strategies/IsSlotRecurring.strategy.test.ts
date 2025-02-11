import { IsSlotRecurringStrategy } from "./IsSlotRecurring.strategy";
import { AvailableSlot } from "@prisma/client";

describe("RecurringStrategy", () => {
  it("should validate recurring slots", () => {
    const strategy = new IsSlotRecurringStrategy();
    const recurringSlot: AvailableSlot = {
      id: 1,
      teacherId: 1,
      startTime: new Date(),
      endTime: new Date(),
      rrule: "FREQ=WEEKLY;BYDAY=MO",
    };
    expect(
      strategy.isAvailable({ slot: recurringSlot, isRecurrentSchedule: true })
    ).toBe(true);
  });

  it("should return true if the slot is not recurring", () => {
    const strategy = new IsSlotRecurringStrategy();
    const nonRecurringSlot: AvailableSlot = {
      id: 2,
      teacherId: 1,
      startTime: new Date(),
      endTime: new Date(),
      rrule: null,
    };
    expect(
      strategy.isAvailable({
        slot: nonRecurringSlot,
        isRecurrentSchedule: false,
      })
    ).toBe(true);
  });

  it("should return false if the isRecurrentSchedule is true and rrule is falsy", () => {
    const strategy = new IsSlotRecurringStrategy();
    const nonRecurringSlot: AvailableSlot = {
      id: 2,
      teacherId: 1,
      startTime: new Date(),
      endTime: new Date(),
      rrule: null,
    };
    expect(
      strategy.isAvailable({
        slot: nonRecurringSlot,
        isRecurrentSchedule: true,
      })
    ).toBe(false);
  });
});
