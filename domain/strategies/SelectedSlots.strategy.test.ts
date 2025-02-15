import { SelectedSlotsStrategy } from "./SelectedSlots.strategy";
import { AvailableSlot } from "@prisma/client";
import { SlotAvailibilityContext } from "./SlotAvailibilityStrategy.interface";

describe("SelectedSlotsStrategy", () => {
  let strategy: SelectedSlotsStrategy;

  beforeEach(() => {
    strategy = new SelectedSlotsStrategy();
  });

  it("should return true if teacher matches", () => {
    const context: SlotAvailibilityContext = {
      slot: { teacherId: 1, rrule: null } as AvailableSlot,
      selectedTeacherIds: new Set([1]),
    };
    expect(strategy.isAvailable(context)).toBe(true);
  });

  it("should return false if teacher does not match", () => {
    const context: SlotAvailibilityContext = {
      slot: { teacherId: 1, rrule: null } as AvailableSlot,
      selectedTeacherIds: new Set([2]),
    };
    expect(strategy.isAvailable(context)).toBe(false);
  });
});
