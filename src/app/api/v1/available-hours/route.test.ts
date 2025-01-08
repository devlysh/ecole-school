import {
  parseDateRange,
  parseSelectedSlots,
} from "@/app/api/v1/available-hours/route";
import { jest } from "@jest/globals";
import { buildHourSlotsMap } from "@/app/api/v1/available-hours/route";
import type { AvailableSlot, BookedClass } from "@prisma/client";

jest.mock("@/lib/prisma", () => ({
  bookedClass: {
    findMany: jest.fn(),
  },
  availableSlot: {
    findMany: jest.fn(),
  },
}));

jest.mock("@/lib/logger", () => ({
  debug: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

describe("parseSelectedSlots", () => {
  it("should correctly parse selected slots", () => {
    // Arrange: Set up the input data and expected output
    const input = "0-12,1-12";
    const expectedOutput = [
      { day: 0, hour: 12 },
      { day: 1, hour: 12 },
    ];

    // Act: Call the function with the input data
    const result = parseSelectedSlots(input);

    // Assert: Check if the result matches the expected output
    expect(result).toEqual(expectedOutput);
  });

  it("should handle empty input", () => {
    // Arrange
    const input: string = "";
    const expectedOutput: string[] = [];

    // Act
    const result = parseSelectedSlots(input);

    // Assert
    expect(result).toEqual(expectedOutput);
  });

  it("should correctly parse selected slots from query string", () => {
    // Arrange: Set up the input data and expected output
    const selectedSlotsParam = "2-15,4-16";
    const expectedOutput = [
      { day: 2, hour: 15 },
      { day: 4, hour: 16 },
    ];

    // Act: Call the function with the input data
    const result = parseSelectedSlots(selectedSlotsParam);

    // Assert: Check if the result matches the expected output
    expect(result).toEqual(expectedOutput);
  });

  it("should handle empty selected slots", () => {
    // Arrange
    const selectedSlotsParam = "";
    const expectedOutput: string[] = [];

    // Act
    const result = parseSelectedSlots(selectedSlotsParam);

    // Assert
    expect(result).toEqual(expectedOutput);
  });
});

describe("parseDateRange", () => {
  it("should parse date range", () => {
    // Arrange
    const startDateParam = "2023-10-01";
    const endDateParam = "2023-10-02";
    const expectedOutput = {
      startDate: new Date("2023-10-01T00:00:00.000Z"),
      endDate: new Date("2023-10-02T23:59:59.999Z"),
    };

    // Act
    const result = parseDateRange(startDateParam, endDateParam);

    // Assert
    expect(result).toEqual(expectedOutput);
  });

  it("should handle same start and end date", () => {
    // Arrange
    const startDateParam = "2023-10-01";
    const endDateParam = "2023-10-01";
    const expectedOutput = {
      startDate: new Date("2023-10-01T00:00:00.000Z"),
      endDate: new Date("2023-10-01T23:59:59.999Z"),
    };

    // Act
    const result = parseDateRange(startDateParam, endDateParam);

    // Assert
    expect(result).toEqual(expectedOutput);
  });

  it("should handle invalid date input", () => {
    // Arrange
    const startDateParam = "invalid-date";
    const endDateParam = "2023-10-02";

    // Act & Assert
    expect(() => parseDateRange(startDateParam, endDateParam)).toThrowError();
  });

  it("should handle leap year date", () => {
    // Arrange
    const startDateParam = "2024-02-29";
    const endDateParam = "2024-03-01";
    const expectedOutput = {
      startDate: new Date("2024-02-29T00:00:00.000Z"),
      endDate: new Date("2024-03-01T23:59:59.999Z"),
    };

    // Act
    const result = parseDateRange(startDateParam, endDateParam);

    // Assert
    expect(result).toEqual(expectedOutput);
  });

  it("should handle end date before start date", () => {
    // Arrange
    const startDateParam = "2023-10-02";
    const endDateParam = "2023-10-01";

    // Act & Assert
    expect(() => parseDateRange(startDateParam, endDateParam)).toThrowError();
  });
});

describe("buildHourSlotsMap", () => {
  it("should build hour slots map for a simple scenario with no booked classes", () => {
    // Arrange
    // Suppose we have one available slot from 08:00 to 10:00 UTC on 2023-10-01
    const availableSlots: AvailableSlot[] = [
      {
        id: 1,
        teacherId: 101,
        startTime: new Date("2023-10-01T08:00:00.000Z"),
        endTime: new Date("2023-10-01T10:00:00.000Z"),
        rrule: null,
        timezone: "UTC",
      },
    ];
    const bookedClasses: BookedClass[] = [];

    // We'll consider the entire day of 2023-10-01
    const startDate = new Date("2023-10-01T00:00:00.000Z");
    const endDate = new Date("2023-10-01T23:59:59.999Z");

    // Act
    const hourSlotsMap = buildHourSlotsMap(
      availableSlots,
      bookedClasses,
      startDate,
      endDate
    );

    // Assert
    // We should get two entries: one for hour 8 and one for hour 9
    expect(hourSlotsMap.size).toBe(2);
    // 2023-10-01 is a Sunday, so getUTCDay() = 0.
    expect(hourSlotsMap.has("0-8")).toBe(true);
    expect(hourSlotsMap.has("0-9")).toBe(true);

    // Each key's set should contain the teacher ID 101
    expect(hourSlotsMap.get("0-8")).toEqual(new Set([101]));
    expect(hourSlotsMap.get("0-9")).toEqual(new Set([101]));
  });

  it("should exclude booked hours from the map", () => {
    // Arrange
    // An available slot from 08:00 to 10:00 UTC
    const availableSlots: AvailableSlot[] = [
      {
        id: 2,
        teacherId: 202,
        startTime: new Date("2023-10-02T08:00:00.000Z"),
        endTime: new Date("2023-10-02T10:00:00.000Z"),
        rrule: null,
        timezone: "UTC",
      },
    ];
    // One of those hours (09:00) is already booked
    const bookedClasses: BookedClass[] = [
      {
        id: 99,
        teacherId: 202,
        date: new Date("2023-10-02T09:00:00.000Z"),
        studentId: 10,
        recurring: false,
      },
    ];

    // We'll consider the entire day of 2023-10-02
    const startDate = new Date("2023-10-02T00:00:00.000Z");
    const endDate = new Date("2023-10-02T23:59:59.999Z");

    // Act
    const hourSlotsMap = buildHourSlotsMap(
      availableSlots,
      bookedClasses,
      startDate,
      endDate
    );

    // Assert
    // We only expect one free hour: 08:00 (hour 8).
    expect(hourSlotsMap.size).toBe(1);
    // 2023-10-02 is a Monday, so getUTCDay() = 1.
    expect(hourSlotsMap.has("1-8")).toBe(true);
    // Hour 9 should be excluded because it is booked
    expect(hourSlotsMap.has("1-9")).toBe(false);
    expect(hourSlotsMap.get("1-8")).toEqual(new Set([202]));
  });

  it("should handle overlapping available slots", () => {
    // Arrange
    const availableSlots: AvailableSlot[] = [
      {
        id: 3,
        teacherId: 303,
        startTime: new Date("2023-10-03T08:00:00.000Z"),
        endTime: new Date("2023-10-03T11:00:00.000Z"),
        rrule: null,
        timezone: "UTC",
      },
      {
        id: 4,
        teacherId: 303,
        startTime: new Date("2023-10-03T09:00:00.000Z"),
        endTime: new Date("2023-10-03T12:00:00.000Z"),
        rrule: null,
        timezone: "UTC",
      },
    ];
    const bookedClasses: BookedClass[] = [];

    const startDate = new Date("2023-10-03T00:00:00.000Z");
    const endDate = new Date("2023-10-03T23:59:59.999Z");

    // Act
    const hourSlotsMap = buildHourSlotsMap(
      availableSlots,
      bookedClasses,
      startDate,
      endDate
    );

    // Assert
    expect(hourSlotsMap.size).toBe(4);
    expect(hourSlotsMap.has("2-8")).toBe(true);
    expect(hourSlotsMap.has("2-9")).toBe(true);
    expect(hourSlotsMap.has("2-10")).toBe(true);
    expect(hourSlotsMap.has("2-11")).toBe(true);
    expect(hourSlotsMap.get("2-8")).toEqual(new Set([303]));
    expect(hourSlotsMap.get("2-9")).toEqual(new Set([303]));
    expect(hourSlotsMap.get("2-10")).toEqual(new Set([303]));
    expect(hourSlotsMap.get("2-11")).toEqual(new Set([303]));
  });

  it("should handle slots in different time zones", () => {
    // Arrange
    const availableSlots: AvailableSlot[] = [
      {
        id: 5,
        teacherId: 404,
        startTime: new Date("2023-10-04T08:00:00.000Z"),
        endTime: new Date("2023-10-04T10:00:00.000Z"),
        rrule: null,
        timezone: "America/New_York",
      },
    ];
    const bookedClasses: BookedClass[] = [];

    const startDate = new Date("2023-10-04T00:00:00.000Z");
    const endDate = new Date("2023-10-04T23:59:59.999Z");

    // Act
    const hourSlotsMap = buildHourSlotsMap(
      availableSlots,
      bookedClasses,
      startDate,
      endDate
    );

    // Assert
    // New York is UTC-4, so 08:00 UTC is 04:00 local time
    expect(hourSlotsMap.size).toBe(2);
    expect(hourSlotsMap.has("3-4")).toBe(true);
    expect(hourSlotsMap.has("3-5")).toBe(true);
    expect(hourSlotsMap.get("3-4")).toEqual(new Set([404]));
    expect(hourSlotsMap.get("3-5")).toEqual(new Set([404]));
  });

  it("should handle slots with recurring rules", () => {
    // Arrange
    const availableSlots: AvailableSlot[] = [
      {
        id: 6,
        teacherId: 505,
        startTime: new Date("2023-10-05T08:00:00.000Z"),
        endTime: new Date("2023-10-05T10:00:00.000Z"),
        rrule: "FREQ=DAILY;COUNT=3",
        timezone: "UTC",
      },
    ];
    const bookedClasses: BookedClass[] = [];

    const startDate = new Date("2023-10-05T00:00:00.000Z");
    const endDate = new Date("2023-10-07T23:59:59.999Z");

    // Act
    const hourSlotsMap = buildHourSlotsMap(
      availableSlots,
      bookedClasses,
      startDate,
      endDate
    );

    // Assert
    expect(hourSlotsMap.size).toBe(6);
    expect(hourSlotsMap.has("4-8")).toBe(true);
    expect(hourSlotsMap.has("4-9")).toBe(true);
    expect(hourSlotsMap.has("5-8")).toBe(true);
    expect(hourSlotsMap.has("5-9")).toBe(true);
    expect(hourSlotsMap.has("6-8")).toBe(true);
    expect(hourSlotsMap.has("6-9")).toBe(true);
    expect(hourSlotsMap.get("4-8")).toEqual(new Set([505]));
    expect(hourSlotsMap.get("4-9")).toEqual(new Set([505]));
    expect(hourSlotsMap.get("5-8")).toEqual(new Set([505]));
    expect(hourSlotsMap.get("5-9")).toEqual(new Set([505]));
    expect(hourSlotsMap.get("6-8")).toEqual(new Set([505]));
    expect(hourSlotsMap.get("6-9")).toEqual(new Set([505]));
  });

  it("should handle slots that start or end at midnight", () => {
    // Arrange
    const availableSlots: AvailableSlot[] = [
      {
        id: 7,
        teacherId: 606,
        startTime: new Date("2023-10-06T00:00:00.000Z"),
        endTime: new Date("2023-10-06T02:00:00.000Z"),
        rrule: null,
        timezone: "UTC",
      },
    ];
    const bookedClasses: BookedClass[] = [];

    const startDate = new Date("2023-10-06T00:00:00.000Z");
    const endDate = new Date("2023-10-06T23:59:59.999Z");

    // Act
    const hourSlotsMap = buildHourSlotsMap(
      availableSlots,
      bookedClasses,
      startDate,
      endDate
    );

    // Assert
    expect(hourSlotsMap.size).toBe(2);
    expect(hourSlotsMap.has("5-0")).toBe(true);
    expect(hourSlotsMap.has("5-1")).toBe(true);
    expect(hourSlotsMap.get("5-0")).toEqual(new Set([606]));
    expect(hourSlotsMap.get("5-1")).toEqual(new Set([606]));
  });
});

describe("filterFixedScheduleSlots", () => {
  it("should filter fixed schedule slots", () => {
    // Add your test logic
  });
});

describe("calculateSlotDates", () => {
  it("should calculate slot dates", () => {
    // Add your test logic here
  });
});

describe("calculateDurationHours", () => {
  it("should calculate duration hours", () => {
    // Add your test logic here
  });
});

describe("isSlotBooked", () => {
  it("should check if slot is booked", () => {
    // Add your test logic here
  });
});

describe("calculateTeacherIntersection", () => {
  it("should calculate teacher intersection", () => {
    // Add your test logic here
  });
});

describe("buildHourSlots", () => {
  it("should build hour slots", () => {
    // Add your test logic here
  });
});

describe("fetchBookedClasses", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch booked classes", async () => {
    // Add your test logic here
  });
});

describe("fetchAvailableSlots", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch available slots", async () => {
    // Add your test logic here
  });
});
