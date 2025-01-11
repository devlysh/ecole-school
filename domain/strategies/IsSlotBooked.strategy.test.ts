import { IsSlotBookedStrategy } from "./IsSlotBooked.strategy";
import { AvailableSlot, BookedClass } from "@prisma/client";

describe("BookedClassStrategy", () => {
  it("should return true if the slot is not booked", () => {
    const bookedClasses: BookedClass[] = [];
    const availableSlots: AvailableSlot[] = [
      {
        id: 1,
        teacherId: 1,
        startTime: new Date("2023-01-01T09:00:00Z"),
        endTime: new Date("2023-01-01T11:00:00Z"),
        rrule: null,
      },
    ];
    const strategy = new IsSlotBookedStrategy();
    const slot: AvailableSlot = availableSlots[0];
    const dateTime = new Date("2023-01-01T09:00:00Z");
    expect(strategy.isAvailable({ slot, dateTime, bookedClasses })).toBe(true);
  });

  it("should return false if the slot is booked", () => {
    const bookedClasses: BookedClass[] = [
      {
        id: 1,
        date: new Date("2023-01-01T09:00:00Z"),
        studentId: 1,
        teacherId: 1,
        recurring: false,
      },
    ];
    const availableSlots: AvailableSlot[] = [
      {
        id: 1,
        teacherId: 1,
        startTime: new Date("2023-01-01T09:00:00Z"),
        endTime: new Date("2023-01-01T11:00:00Z"),
        rrule: null,
      },
    ];
    const dateTime = new Date("2023-01-01T09:00:00Z");

    const strategy = new IsSlotBookedStrategy();
    const slot: AvailableSlot = availableSlots[0];

    expect(strategy.isAvailable({ slot, dateTime, bookedClasses })).toBe(false);
  });

  it("should return false if the slot is booked and the date is in the recurrence pattern", () => {
    const bookedClasses: BookedClass[] = [
      {
        id: 1,
        date: new Date("2023-01-01T09:00:00Z"),
        studentId: 1,
        teacherId: 1,
        recurring: true,
      },
    ];
    const availableSlots: AvailableSlot[] = [
      {
        id: 1,
        teacherId: 1,
        startTime: new Date("2023-01-01T09:00:00Z"),
        endTime: new Date("2023-01-01T11:00:00Z"),
        rrule: null,
      },
    ];
    const dateTime = new Date("2023-01-08T09:00:00Z");

    const strategy = new IsSlotBookedStrategy();
    const slot: AvailableSlot = availableSlots[0];

    expect(strategy.isAvailable({ slot, dateTime, bookedClasses })).toBe(false);
  });

  it("should return true if the slot is booked and the date recurrent, but the date is not in the recurrence pattern", () => {
    const bookedClasses: BookedClass[] = [
      {
        id: 1,
        date: new Date("2023-01-01T09:00:00Z"),
        studentId: 1,
        teacherId: 1,
        recurring: true,
      },
    ];
    const availableSlots: AvailableSlot[] = [
      {
        id: 1,
        teacherId: 1,
        startTime: new Date("2023-01-01T09:00:00Z"),
        endTime: new Date("2023-01-01T11:00:00Z"),
        rrule: null,
      },
    ];
    const dateTime = new Date("2023-01-09T09:00:00Z");

    const strategy = new IsSlotBookedStrategy();
    const slot: AvailableSlot = availableSlots[0];

    expect(strategy.isAvailable({ slot, dateTime, bookedClasses })).toBe(false);
  });
});

describe("IsSlotBookedStrategy Additional Tests", () => {
  it("should return true if there are no bookings", () => {
    const bookedClasses: BookedClass[] = [];
    const availableSlots: AvailableSlot[] = [
      {
        id: 1,
        teacherId: 1,
        startTime: new Date("2023-01-01T09:00:00Z"),
        endTime: new Date("2023-01-01T11:00:00Z"),
        rrule: null,
      },
    ];
    const strategy = new IsSlotBookedStrategy();
    const slot: AvailableSlot = availableSlots[0];
    const dateTime = new Date("2023-01-01T09:00:00Z");
    expect(strategy.isAvailable({ slot, dateTime, bookedClasses })).toBe(true);
  });

  it("should return false if there are overlapping bookings", () => {
    const bookedClasses: BookedClass[] = [
      {
        id: 1,
        date: new Date("2023-01-01T09:30:00Z"),
        studentId: 1,
        teacherId: 1,
        recurring: false,
      },
    ];
    const availableSlots: AvailableSlot[] = [
      {
        id: 1,
        teacherId: 1,
        startTime: new Date("2023-01-01T09:00:00Z"),
        endTime: new Date("2023-01-01T11:00:00Z"),
        rrule: null,
      },
    ];
    const strategy = new IsSlotBookedStrategy();
    const slot: AvailableSlot = availableSlots[0];
    const dateTime = new Date("2023-01-01T09:30:00Z");
    expect(strategy.isAvailable({ slot, dateTime, bookedClasses })).toBe(false);
  });

  it("should handle invalid recurrence rules gracefully", () => {
    const bookedClasses: BookedClass[] = [];
    const availableSlots: AvailableSlot[] = [
      {
        id: 1,
        teacherId: 1,
        startTime: new Date("2023-01-01T09:00:00Z"),
        endTime: new Date("2023-01-01T11:00:00Z"),
        rrule: "INVALID_RRULE",
      },
    ];
    const strategy = new IsSlotBookedStrategy();
    const slot: AvailableSlot = availableSlots[0];
    const dateTime = new Date("2023-01-01T09:00:00Z");
    expect(strategy.isAvailable({ slot, dateTime, bookedClasses })).toBe(false);
  });

  it("should correctly handle bookings in different time zones", () => {
    const bookedClasses: BookedClass[] = [
      {
        id: 1,
        date: new Date("2023-01-01T09:00:00-05:00"), // Different time zone
        studentId: 1,
        teacherId: 1,
        recurring: false,
      },
    ];
    const availableSlots: AvailableSlot[] = [
      {
        id: 1,
        teacherId: 1,
        startTime: new Date("2023-01-01T09:00:00Z"),
        endTime: new Date("2023-01-01T11:00:00Z"),
        rrule: null,
      },
    ];
    const strategy = new IsSlotBookedStrategy();
    const slot: AvailableSlot = availableSlots[0];
    const dateTime = new Date("2023-01-01T14:00:00Z"); // Equivalent to 09:00 in -05:00
    expect(strategy.isAvailable({ slot, dateTime, bookedClasses })).toBe(false);
  });

  it("should return true for slots with bookings on different days", () => {
    const bookedClasses: BookedClass[] = [
      {
        id: 1,
        date: new Date("2023-01-02T09:00:00Z"),
        studentId: 1,
        teacherId: 1,
        recurring: false,
      },
    ];
    const availableSlots: AvailableSlot[] = [
      {
        id: 1,
        teacherId: 1,
        startTime: new Date("2023-01-01T09:00:00Z"),
        endTime: new Date("2023-01-01T11:00:00Z"),
        rrule: null,
      },
    ];
    const strategy = new IsSlotBookedStrategy();
    const slot: AvailableSlot = availableSlots[0];
    const dateTime = new Date("2023-01-01T09:00:00Z");
    expect(strategy.isAvailable({ slot, dateTime, bookedClasses })).toBe(true);
  });

  it("should return false for slots with recurrence pattern but no bookings", () => {
    const bookedClasses: BookedClass[] = [];
    const availableSlots: AvailableSlot[] = [
      {
        id: 1,
        teacherId: 1,
        startTime: new Date("2023-01-01T09:00:00Z"),
        endTime: new Date("2023-01-01T11:00:00Z"),
        rrule: "FREQ=WEEKLY;BYDAY=MO",
      },
    ];
    const strategy = new IsSlotBookedStrategy();
    const slot: AvailableSlot = availableSlots[0];
    const dateTime = new Date("2023-01-01T09:00:00Z");
    expect(strategy.isAvailable({ slot, dateTime, bookedClasses })).toBe(false);
  });
});

describe("IsSlotBookedStrategy - Weekly Recurrence", () => {
  it("should return false for a slot booked on Monday at 08:00", () => {
    const bookedClasses: BookedClass[] = [
      {
        id: 1,
        date: new Date("2025-01-06T08:00:00Z"), // Monday
        studentId: 1,
        teacherId: 105,
        recurring: true,
      },
    ];
    const availableSlots: AvailableSlot[] = [
      {
        id: 285,
        teacherId: 105,
        startTime: new Date("2025-01-05T00:00:00Z"),
        endTime: new Date("2025-01-06T00:00:00Z"),
        rrule: "RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR,SA,SU",
      },
    ];
    const dateTime = new Date("2025-01-06T08:00:00Z");

    const strategy = new IsSlotBookedStrategy();
    const slot: AvailableSlot = availableSlots[0];

    expect(strategy.isAvailable({ slot, dateTime, bookedClasses })).toBe(false);
  });

  it("should return false for a slot booked on Friday at 08:00", () => {
    const bookedClasses: BookedClass[] = [
      {
        id: 2,
        date: new Date("2025-01-10T08:00:00Z"), // Friday
        studentId: 1,
        teacherId: 105,
        recurring: true,
      },
    ];
    const availableSlots: AvailableSlot[] = [
      {
        id: 285,
        teacherId: 105,
        startTime: new Date("2025-01-05T00:00:00Z"),
        endTime: new Date("2025-01-06T00:00:00Z"),
        rrule: "RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR,SA,SU",
      },
    ];
    const dateTime = new Date("2025-01-10T08:00:00Z");

    const strategy = new IsSlotBookedStrategy();
    const slot: AvailableSlot = availableSlots[0];

    expect(strategy.isAvailable({ slot, dateTime, bookedClasses })).toBe(false);
  });

  it("should return true for a slot available on Monday at 09:00", () => {
    const bookedClasses: BookedClass[] = [];
    const availableSlots: AvailableSlot[] = [
      {
        id: 285,
        teacherId: 105,
        startTime: new Date("2025-01-05T00:00:00Z"),
        endTime: new Date("2025-01-06T00:00:00Z"),
        rrule: "RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR,SA,SU",
      },
    ];
    const dateTime = new Date("2025-01-06T09:00:00Z");

    const strategy = new IsSlotBookedStrategy();
    const slot: AvailableSlot = availableSlots[0];

    expect(strategy.isAvailable({ slot, dateTime, bookedClasses })).toBe(true);
  });

  it("should return true for a slot available on Friday at 09:00", () => {
    const bookedClasses: BookedClass[] = [];
    const availableSlots: AvailableSlot[] = [
      {
        id: 285,
        teacherId: 105,
        startTime: new Date("2025-01-05T00:00:00Z"),
        endTime: new Date("2025-01-06T00:00:00Z"),
        rrule: "RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR,SA,SU",
      },
    ];
    const dateTime = new Date("2025-01-10T09:00:00Z");

    const strategy = new IsSlotBookedStrategy();
    const slot: AvailableSlot = availableSlots[0];

    expect(strategy.isAvailable({ slot, dateTime, bookedClasses })).toBe(true);
  });

  it("should return true for a slot available on Tuesday at 08:00", () => {
    const bookedClasses: BookedClass[] = [];
    const availableSlots: AvailableSlot[] = [
      {
        id: 285,
        teacherId: 105,
        startTime: new Date("2025-01-05T00:00:00Z"),
        endTime: new Date("2025-01-06T00:00:00Z"),
        rrule: "RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR,SA,SU",
      },
    ];
    const dateTime = new Date("2025-01-07T08:00:00Z");

    const strategy = new IsSlotBookedStrategy();
    const slot: AvailableSlot = availableSlots[0];

    expect(strategy.isAvailable({ slot, dateTime, bookedClasses })).toBe(true);
  });

  it("should return true for a slot available on Saturday at 08:00", () => {
    const bookedClasses: BookedClass[] = [];
    const availableSlots: AvailableSlot[] = [
      {
        id: 285,
        teacherId: 105,
        startTime: new Date("2025-01-05T00:00:00Z"),
        endTime: new Date("2025-01-06T00:00:00Z"),
        rrule: "RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR,SA,SU",
      },
    ];
    const dateTime = new Date("2025-01-11T08:00:00Z");

    const strategy = new IsSlotBookedStrategy();
    const slot: AvailableSlot = availableSlots[0];

    expect(strategy.isAvailable({ slot, dateTime, bookedClasses })).toBe(true);
  });
});
