import { VacationStrategy } from "./Vacation.strategy";
import { SlotAvailibilityContext } from "./SlotAvailibilityStrategy.interface";

describe("VacationStrategy", () => {
  let strategy: VacationStrategy;

  beforeEach(() => {
    strategy = new VacationStrategy();
  });

  it("should return true if the slot is not during a vacation", () => {
    const context: SlotAvailibilityContext = {
      dateTime: new Date("2023-01-01T09:00:00Z"),
      slot: {
        id: 1,
        teacherId: 1,
        startTime: new Date(),
        endTime: new Date(),
        rrule: null,
      },
      vacations: [
        { id: 1, teacherId: 1, date: new Date("2023-01-02T00:00:00Z") },
      ],
    };
    expect(strategy.isAvailable(context)).toBe(true);
  });

  it("should return false if the slot is during a vacation", () => {
    const context: SlotAvailibilityContext = {
      dateTime: new Date("2023-01-01T09:00:00Z"),
      slot: {
        id: 1,
        teacherId: 1,
        startTime: new Date(),
        endTime: new Date(),
        rrule: null,
      },
      vacations: [
        { id: 1, teacherId: 1, date: new Date("2023-01-01T00:00:00Z") },
      ],
    };
    expect(strategy.isAvailable(context)).toBe(false);
  });

  it("should return true if there are no vacations", () => {
    const context: SlotAvailibilityContext = {
      dateTime: new Date("2023-01-01T09:00:00Z"),
      slot: {
        id: 1,
        teacherId: 1,
        startTime: new Date(),
        endTime: new Date(),
        rrule: null,
      },
      vacations: [],
    };
    expect(strategy.isAvailable(context)).toBe(true);
  });

  it("should return true if dateTime is undefined", () => {
    const context: SlotAvailibilityContext = {
      dateTime: undefined,
      slot: {
        id: 1,
        teacherId: 1,
        startTime: new Date(),
        endTime: new Date(),
        rrule: null,
      },
      vacations: [
        { id: 1, teacherId: 1, date: new Date("2023-01-01T00:00:00Z") },
      ],
    };
    expect(strategy.isAvailable(context)).toBe(true);
  });

  it("should return true if slot is undefined", () => {
    const context: SlotAvailibilityContext = {
      dateTime: new Date("2023-01-01T09:00:00Z"),
      slot: undefined,
      vacations: [
        { id: 1, teacherId: 1, date: new Date("2023-01-01T00:00:00Z") },
      ],
    };
    expect(strategy.isAvailable(context)).toBe(true);
  });

  it("should return true if vacations is undefined", () => {
    const context: SlotAvailibilityContext = {
      dateTime: new Date("2023-01-01T09:00:00Z"),
      slot: {
        id: 1,
        teacherId: 1,
        startTime: new Date(),
        endTime: new Date(),
        rrule: null,
      },
      vacations: undefined,
    };
    expect(strategy.isAvailable(context)).toBe(true);
  });
});
