import { HandleSelectedSlotsStrategy } from "./HandleSelectedSlotsStrategy.strategy";
import { AvailableSlot } from "@prisma/client";
import { SlotAvailibilityContext } from "./SlotAvailibilityStrategy.interface";

describe("HandleSelectedSlotsStrategy", () => {
  let strategy: HandleSelectedSlotsStrategy;

  beforeEach(() => {
    strategy = new HandleSelectedSlotsStrategy();
  });

  it("should return true if slot is not defined", () => {
    const context: SlotAvailibilityContext = {
      selectedSlots: [],
      lockedTeacherIds: new Set(),
    };
    expect(strategy.isAvailable(context)).toBe(true);
  });

  it("should return true if lockedTeacherIds is not defined", () => {
    const context: SlotAvailibilityContext = {
      slot: { teacherId: 1, rrule: null } as AvailableSlot,
      selectedSlots: [],
    };
    expect(strategy.isAvailable(context)).toBe(true);
  });

  it("should return true if selectedSlots is empty", () => {
    const context: SlotAvailibilityContext = {
      slot: { teacherId: 1, rrule: null } as AvailableSlot,
      selectedSlots: [],
      lockedTeacherIds: new Set(),
    };
    expect(strategy.isAvailable(context)).toBe(true);
  });

  it("should return true if slot is available and teacher is locked", () => {
    const context: SlotAvailibilityContext = {
      slot: { teacherId: 1, rrule: null } as AvailableSlot,
      selectedSlots: [new Date("2025-01-01T00:00:00Z")],
      lockedTeacherIds: new Set([1]),
    };
    expect(strategy.isAvailable(context)).toBe(true);
  });

  it("should return false if slot is not available and teacher is not locked", () => {
    const context: SlotAvailibilityContext = {
      slot: { teacherId: 2, rrule: null } as AvailableSlot,
      selectedSlots: [new Date("2025-01-01T00:00:00Z")],
      lockedTeacherIds: new Set(),
    };
    expect(strategy.isAvailable(context)).toBe(false);
  });

  it("should lock the teacher if slot becomes available", () => {
    const context: SlotAvailibilityContext = {
      slot: {
        teacherId: 1,
        rrule: null,
        startTime: new Date("2025-01-01T00:00:00Z"),
        endTime: new Date("2025-01-01T02:00:00Z"),
      } as AvailableSlot,
      selectedSlots: [new Date("2025-01-01T01:00:00Z")],
      lockedTeacherIds: new Set(),
    };
    strategy.isAvailable(context);
    expect(context.lockedTeacherIds!.has(1)).toBe(true);
  });

  it("should not lock the teacher if slot is not available", () => {
    const context: SlotAvailibilityContext = {
      slot: { teacherId: 2, rrule: null } as AvailableSlot,
      selectedSlots: [new Date("2025-01-01T00:00:00Z")],
      lockedTeacherIds: new Set(),
    };
    strategy.isAvailable(context);
    expect(context.lockedTeacherIds!.has(2)).toBe(false);
  });

  it("should handle recurring slots correctly", () => {
    const context: SlotAvailibilityContext = {
      slot: {
        teacherId: 1,
        rrule: "FREQ=DAILY",
        startTime: new Date("2025-01-01T00:00:00Z"),
        endTime: new Date("2025-01-01T02:00:00Z"),
      } as AvailableSlot,
      selectedSlots: [new Date("2025-01-01T00:00:00Z")],
      lockedTeacherIds: new Set(),
    };
    expect(strategy.isAvailable(context)).toBe(true);
  });

  it("should handle non-recurring slots correctly", () => {
    const context: SlotAvailibilityContext = {
      slot: {
        teacherId: 1,
        rrule: null,
        startTime: new Date("2025-01-01T00:00:00Z"),
        endTime: new Date("2025-01-01T02:00:00Z"),
      } as AvailableSlot,
      selectedSlots: [new Date("2025-01-01T00:00:00Z")],
      lockedTeacherIds: new Set(),
    };
    expect(strategy.isAvailable(context)).toBe(true);
  });

  it("should return false if no slots are available", () => {
    const context: SlotAvailibilityContext = {
      slot: {
        teacherId: 3,
        rrule: null,
        startTime: new Date("2025-02-01T00:00:00Z"),
        endTime: new Date("2025-02-01T02:00:00Z"),
      } as AvailableSlot,
      selectedSlots: [
        new Date("2025-01-01T00:00:00Z"),
        new Date("2025-01-02T00:00:00Z"),
      ],
      lockedTeacherIds: new Set(),
    };
    expect(strategy.isAvailable(context)).toBe(false);
  });
});
