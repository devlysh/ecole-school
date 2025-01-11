import { IsSlotAvailableStrategy } from "./IsSlotAvailable.strategy";
import { AvailableSlot } from "@prisma/client";
import { RRule } from "rrule";

describe("IsAvailableSlotStrategy", () => {
  let strategy: IsSlotAvailableStrategy;

  beforeEach(() => {
    strategy = new IsSlotAvailableStrategy();
  });

  it("should return true for a slot within the time range without rrule", () => {
    const slot: AvailableSlot = {
      id: 1,
      teacherId: 1,
      startTime: new Date("2023-01-01T09:00:00Z"),
      endTime: new Date("2023-01-01T11:00:00Z"),
      rrule: null,
    };
    const dateTime = new Date("2023-01-01T10:00:00Z");
    expect(strategy.isAvailable({ slot, dateTime })).toBe(true);
  });

  it("should return false for a slot outside the time range without rrule", () => {
    const slot: AvailableSlot = {
      id: 1,
      teacherId: 1,
      startTime: new Date("2023-01-01T09:00:00Z"),
      endTime: new Date("2023-01-01T11:00:00Z"),
      rrule: null,
    };
    const dateTime = new Date("2023-01-01T12:00:00Z");
    expect(strategy.isAvailable({ slot, dateTime })).toBe(false);
  });

  it("should return true for a slot with a valid rrule that matches the dateTime", () => {
    const rrule = new RRule({
      freq: RRule.WEEKLY,
      byweekday: [RRule.MO],
    }).toString();

    const slot: AvailableSlot = {
      id: 1,
      teacherId: 1,
      startTime: new Date("2023-01-01T09:00:00Z"),
      endTime: new Date("2023-01-01T11:00:00Z"),
      rrule: rrule,
    };

    const dateTime = new Date("2023-01-02T09:00:00Z"); // Monday at 09:00:00
    expect(strategy.isAvailable({ slot, dateTime })).toBe(true);
  });

  it("should return false for a slot with a valid rrule that does not match the dateTime", () => {
    const rrule = new RRule({
      freq: RRule.WEEKLY,
      byweekday: [RRule.MO],
    }).toString();

    const slot: AvailableSlot = {
      id: 1,
      teacherId: 1,
      startTime: new Date("2023-01-01T09:00:00Z"),
      endTime: new Date("2023-01-01T11:00:00Z"),
      rrule: rrule,
    };
    const dateTime = new Date("2023-01-03T09:00:00Z"); // Tuesday
    expect(strategy.isAvailable({ slot, dateTime })).toBe(false);
  });

  it("should return false for a slot with an invalid rrule", () => {
    const slot: AvailableSlot = {
      id: 1,
      teacherId: 1,
      startTime: new Date("2023-01-01T09:00:00Z"),
      endTime: new Date("2023-01-01T11:00:00Z"),
      rrule: "INVALID_RRULE",
    };
    const dateTime = new Date("2023-01-01T10:00:00Z");
    expect(strategy.isAvailable({ slot, dateTime })).toBe(false);
  });

  it("should return true for a slot with a daily rrule that matches the dateTime", () => {
    const rrule = new RRule({
      freq: RRule.DAILY,
    }).toString();

    const slot: AvailableSlot = {
      id: 1,
      teacherId: 1,
      startTime: new Date("2023-01-01T09:00:00Z"),
      endTime: new Date("2023-01-01T11:00:00Z"),
      rrule: rrule,
    };

    const dateTime = new Date("2023-01-02T09:00:00Z");
    expect(strategy.isAvailable({ slot, dateTime })).toBe(true);
  });

  it("should return false for a slot with a daily rrule that does not match the dateTime", () => {
    const rrule = new RRule({
      freq: RRule.DAILY,
    }).toString();

    const slot: AvailableSlot = {
      id: 1,
      teacherId: 1,
      startTime: new Date("2023-01-01T09:00:00Z"),
      endTime: new Date("2023-01-01T11:00:00Z"),
      rrule: rrule,
    };

    const dateTime = new Date("2023-01-02T12:00:00Z");
    expect(strategy.isAvailable({ slot, dateTime })).toBe(false);
  });

  it("should return true for a slot with a monthly rrule that matches the dateTime", () => {
    const rrule = new RRule({
      freq: RRule.MONTHLY,
      bymonthday: [1],
    }).toString();

    const slot: AvailableSlot = {
      id: 1,
      teacherId: 1,
      startTime: new Date("2023-01-01T09:00:00Z"),
      endTime: new Date("2023-01-01T11:00:00Z"),
      rrule: rrule,
    };

    const dateTime = new Date("2023-02-01T09:00:00Z");
    expect(strategy.isAvailable({ slot, dateTime })).toBe(true);
  });

  it("should return false for a slot with a monthly rrule that does not match the dateTime", () => {
    const rrule = new RRule({
      freq: RRule.MONTHLY,
      bymonthday: [1],
    }).toString();

    const slot: AvailableSlot = {
      id: 1,
      teacherId: 1,
      startTime: new Date("2023-01-01T09:00:00Z"),
      endTime: new Date("2023-01-01T11:00:00Z"),
      rrule: rrule,
    };

    const dateTime = new Date("2023-02-02T09:00:00Z");
    expect(strategy.isAvailable({ slot, dateTime })).toBe(false);
  });

  it("should return true for a slot with a yearly rrule that matches the dateTime", () => {
    const rrule = new RRule({
      freq: RRule.YEARLY,
      bymonth: [1],
      bymonthday: [1],
    }).toString();

    const slot: AvailableSlot = {
      id: 1,
      teacherId: 1,
      startTime: new Date("2023-01-01T09:00:00Z"),
      endTime: new Date("2023-01-01T11:00:00Z"),
      rrule: rrule,
    };

    const dateTime = new Date("2024-01-01T09:00:00Z");
    expect(strategy.isAvailable({ slot, dateTime })).toBe(true);
  });

  it("should return false for a slot with a yearly rrule that does not match the dateTime", () => {
    const rrule = new RRule({
      freq: RRule.YEARLY,
      bymonth: [1],
      bymonthday: [1],
    }).toString();

    const slot: AvailableSlot = {
      id: 1,
      teacherId: 1,
      startTime: new Date("2023-01-01T09:00:00Z"),
      endTime: new Date("2023-01-01T11:00:00Z"),
      rrule: rrule,
    };

    const dateTime = new Date("2024-01-02T09:00:00Z");
    expect(strategy.isAvailable({ slot, dateTime })).toBe(false);
  });

  it("should return true for a slot with a weekly rrule on multiple days that matches the dateTime", () => {
    const rrule = new RRule({
      freq: RRule.WEEKLY,
      byweekday: [RRule.MO, RRule.WE],
    }).toString();

    const slot: AvailableSlot = {
      id: 1,
      teacherId: 1,
      startTime: new Date("2023-01-01T09:00:00Z"),
      endTime: new Date("2023-01-01T11:00:00Z"),
      rrule: rrule,
    };

    const dateTime = new Date("2023-01-04T09:00:00Z"); // Wednesday
    expect(strategy.isAvailable({ slot, dateTime })).toBe(true);
  });

  it("should return false for a slot with a weekly rrule on multiple days that does not match the dateTime", () => {
    const rrule = new RRule({
      freq: RRule.WEEKLY,
      byweekday: [RRule.MO, RRule.WE],
    }).toString();

    const slot: AvailableSlot = {
      id: 1,
      teacherId: 1,
      startTime: new Date("2023-01-01T09:00:00Z"),
      endTime: new Date("2023-01-01T11:00:00Z"),
      rrule: rrule,
    };

    const dateTime = new Date("2023-01-05T09:00:00Z"); // Thursday
    expect(strategy.isAvailable({ slot, dateTime })).toBe(false);
  });

  it("should return true for a slot with a bi-weekly rrule that matches the dateTime", () => {
    const rrule = new RRule({
      freq: RRule.WEEKLY,
      interval: 2,
      byweekday: [RRule.MO],
    }).toString();

    const slot: AvailableSlot = {
      id: 1,
      teacherId: 1,
      startTime: new Date("2023-01-01T09:00:00Z"),
      endTime: new Date("2023-01-01T11:00:00Z"),
      rrule: rrule,
    };

    const dateTime = new Date("2023-01-09T09:00:00Z");
    expect(strategy.isAvailable({ slot, dateTime })).toBe(true);
  });

  it("should return false for a slot with a bi-weekly rrule that does not match the dateTime", () => {
    const rrule = new RRule({
      freq: RRule.WEEKLY,
      interval: 2,
      byweekday: [RRule.MO],
    }).toString();

    const slot: AvailableSlot = {
      id: 1,
      teacherId: 1,
      startTime: new Date("2023-01-01T09:00:00Z"),
      endTime: new Date("2023-01-01T11:00:00Z"),
      rrule: rrule,
    };

    const dateTime = new Date("2023-01-08T09:00:00Z"); // One week later
    expect(strategy.isAvailable({ slot, dateTime })).toBe(false);
  });

  it("should return true for a slot with a rrule that includes a specific count", () => {
    const rrule = new RRule({
      freq: RRule.DAILY,
      count: 3,
    }).toString();

    const slot: AvailableSlot = {
      id: 1,
      teacherId: 1,
      startTime: new Date("2023-01-01T09:00:00Z"),
      endTime: new Date("2023-01-01T11:00:00Z"),
      rrule: rrule,
    };

    const dateTime = new Date("2023-01-03T09:00:00Z");
    expect(strategy.isAvailable({ slot, dateTime })).toBe(true);
  });

  it("should return false for a slot with a rrule that exceeds the specific count", () => {
    const rrule = new RRule({
      freq: RRule.DAILY,
      count: 3,
    }).toString();

    const slot: AvailableSlot = {
      id: 1,
      teacherId: 1,
      startTime: new Date("2023-01-01T09:00:00Z"),
      endTime: new Date("2023-01-01T11:00:00Z"),
      rrule: rrule,
    };

    const dateTime = new Date("2023-01-04T09:00:00Z");
    expect(strategy.isAvailable({ slot, dateTime })).toBe(false);
  });

  it("should return true for a slot with a rrule that includes an end date", () => {
    const rrule = new RRule({
      freq: RRule.DAILY,
      until: new Date("2023-01-03T09:00:00Z"),
    }).toString();

    const slot: AvailableSlot = {
      id: 1,
      teacherId: 1,
      startTime: new Date("2023-01-01T09:00:00Z"),
      endTime: new Date("2023-01-01T11:00:00Z"),
      rrule: rrule,
    };

    const dateTime = new Date("2023-01-02T09:00:00Z");
    expect(strategy.isAvailable({ slot, dateTime })).toBe(true);
  });

  it("should return false for a slot with a rrule that is past the end date", () => {
    const rrule = new RRule({
      freq: RRule.DAILY,
      until: new Date("2023-01-03T09:00:00Z"),
    }).toString();

    const slot: AvailableSlot = {
      id: 1,
      teacherId: 1,
      startTime: new Date("2023-01-01T09:00:00Z"),
      endTime: new Date("2023-01-01T11:00:00Z"),
      rrule: rrule,
    };

    const dateTime = new Date("2023-01-04T09:00:00Z");
    expect(strategy.isAvailable({ slot, dateTime })).toBe(false);
  });

  it("should return true for a slot with a rrule that includes a specific time of day", () => {
    const rrule = new RRule({
      freq: RRule.DAILY,
      byhour: [9],
    }).toString();

    const slot: AvailableSlot = {
      id: 1,
      teacherId: 1,
      startTime: new Date("2023-01-01T09:00:00Z"),
      endTime: new Date("2023-01-01T11:00:00Z"),
      rrule: rrule,
    };

    const dateTime = new Date("2023-01-02T09:00:00Z");
    expect(strategy.isAvailable({ slot, dateTime })).toBe(true);
  });

  it("should return false for a slot with a rrule that does not include the specific time of day", () => {
    const rrule = new RRule({
      freq: RRule.DAILY,
      byhour: [9],
    }).toString();

    const slot: AvailableSlot = {
      id: 1,
      teacherId: 1,
      startTime: new Date("2023-01-01T09:00:00Z"),
      endTime: new Date("2023-01-01T11:00:00Z"),
      rrule: rrule,
    };

    const dateTime = new Date("2023-01-02T10:00:00Z");
    expect(strategy.isAvailable({ slot, dateTime })).toBe(false);
  });

  it("should return true for a slot with a rrule that includes a specific minute of the hour", () => {
    const rrule = new RRule({
      freq: RRule.DAILY,
      byminute: [0],
    }).toString();

    const slot: AvailableSlot = {
      id: 1,
      teacherId: 1,
      startTime: new Date("2023-01-01T09:00:00Z"),
      endTime: new Date("2023-01-01T11:00:00Z"),
      rrule: rrule,
    };

    const dateTime = new Date("2023-01-02T09:00:00Z");
    expect(strategy.isAvailable({ slot, dateTime })).toBe(true);
  });

  it("should return false for a slot with a rrule that does not include the specific minute of the hour", () => {
    const rrule = new RRule({
      freq: RRule.DAILY,
      byminute: [0],
    }).toString();

    const slot: AvailableSlot = {
      id: 1,
      teacherId: 1,
      startTime: new Date("2023-01-01T09:00:00Z"),
      endTime: new Date("2023-01-01T11:00:00Z"),
      rrule: rrule,
    };

    const dateTime = new Date("2023-01-02T09:01:00Z");
    expect(strategy.isAvailable({ slot, dateTime })).toBe(false);
  });

  it("should return true for a slot with a rrule that includes a specific second of the minute", () => {
    const rrule = new RRule({
      freq: RRule.DAILY,
      bysecond: [0],
    }).toString();

    const slot: AvailableSlot = {
      id: 1,
      teacherId: 1,
      startTime: new Date("2023-01-01T09:00:00Z"),
      endTime: new Date("2023-01-01T11:00:00Z"),
      rrule: rrule,
    };

    const dateTime = new Date("2023-01-02T09:00:00Z");
    expect(strategy.isAvailable({ slot, dateTime })).toBe(true);
  });

  it("should return false for a slot with a rrule that does not include the specific second of the minute", () => {
    const rrule = new RRule({
      freq: RRule.DAILY,
      bysecond: [0],
    }).toString();

    const slot: AvailableSlot = {
      id: 1,
      teacherId: 1,
      startTime: new Date("2023-01-01T09:00:00Z"),
      endTime: new Date("2023-01-01T11:00:00Z"),
      rrule: rrule,
    };

    const dateTime = new Date("2023-01-02T09:00:01Z");
    expect(strategy.isAvailable({ slot, dateTime })).toBe(false);
  });

  it("should return true for a slot with a rrule that includes a specific week number", () => {
    const rrule = new RRule({
      freq: RRule.YEARLY,
      byweekno: [1],
    }).toString();

    const slot: AvailableSlot = {
      id: 1,
      teacherId: 1,
      startTime: new Date("2023-01-01T09:00:00Z"),
      endTime: new Date("2023-01-01T11:00:00Z"),
      rrule: rrule,
    };

    const dateTime = new Date("2023-01-02T09:00:00Z");
    expect(strategy.isAvailable({ slot, dateTime })).toBe(true);
  });

  it("should return false for a slot with a rrule that does not include the specific week number", () => {
    const rrule = new RRule({
      freq: RRule.YEARLY,
      byweekno: [1],
    }).toString();

    const slot: AvailableSlot = {
      id: 1,
      teacherId: 1,
      startTime: new Date("2023-01-01T09:00:00Z"),
      endTime: new Date("2023-01-01T11:00:00Z"),
      rrule: rrule,
    };

    const dateTime = new Date("2023-01-09T09:00:00Z");
    expect(strategy.isAvailable({ slot, dateTime })).toBe(false);
  });

  it("should return true for a slot lasting more than 1 hour that overlaps with the given time", () => {
    const slot: AvailableSlot = {
      id: 1,
      teacherId: 1,
      startTime: new Date("2023-01-01T09:00:00Z"),
      endTime: new Date("2023-01-01T12:00:00Z"), // Slot lasts 3 hours
      rrule: null,
    };

    const dateTime = new Date("2023-01-01T10:00:00Z"); // Overlaps with the slot
    expect(strategy.isAvailable({ slot, dateTime })).toBe(true);
  });

  it("should return false for a slot lasting more than 1 hour that does not overlap with the given time", () => {
    const slot: AvailableSlot = {
      id: 1,
      teacherId: 1,
      startTime: new Date("2023-01-01T09:00:00Z"),
      endTime: new Date("2023-01-01T12:00:00Z"), // Slot lasts 3 hours
      rrule: null,
    };

    const dateTime = new Date("2023-01-01T13:00:00Z"); // Does not overlap with the slot
    expect(strategy.isAvailable({ slot, dateTime })).toBe(false);
  });
});
