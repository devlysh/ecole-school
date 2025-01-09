import { AvailableHoursService } from "./AvailableHoursService";
import { AvailableHoursRepository } from "./AvailableHoursRepository";
import { BookedClassRepository } from "./BookedClassRepository";
import { AvailableSlot, BookedClass } from "@prisma/client";

describe("AvailableHoursService", () => {
  let mockAvailableHoursRepo: jest.Mocked<AvailableHoursRepository>;
  let mockBookedClassRepo: jest.Mocked<BookedClassRepository>;
  let service: AvailableHoursService;

  beforeEach(() => {
    mockAvailableHoursRepo = {
      fetchAll: jest.fn(),
      fetchFixedScheduleSlots: jest.fn(),
    } as unknown as jest.Mocked<AvailableHoursRepository>;

    mockBookedClassRepo = {
      fetchAll: jest.fn(),
      fetchForTeacher: jest.fn(),
    } as unknown as jest.Mocked<BookedClassRepository>;

    service = new AvailableHoursService(mockAvailableHoursRepo, mockBookedClassRepo);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should throw an error if dates are invalid", async () => {
    await expect(
      service.getAvailableHours({
        startDateParam: "invalid",
        endDateParam: "alsoInvalid",
      })
    ).rejects.toThrow("Invalid start or end date");
  });

  it("should return empty hourSlots if no AvailableSlot is found", async () => {
    mockAvailableHoursRepo.fetchAll.mockResolvedValue([]);
    mockBookedClassRepo.fetchAll.mockResolvedValue([]);

    const result = await service.getAvailableHours({
      startDateParam: "2023-10-01",
      endDateParam: "2023-10-01",
    });

    expect(result).toEqual({ hourSlots: [] });
  });

  it("should return correct hour slots when no bookings exist", async () => {
    const mockSlot: AvailableSlot = {
      id: 1,
      teacherId: 101,
      startTime: new Date("2023-10-01T08:00:00Z"),
      endTime: new Date("2023-10-01T10:00:00Z"),
      rrule: null,
    };
    mockAvailableHoursRepo.fetchAll.mockResolvedValue([mockSlot]);
    mockBookedClassRepo.fetchAll.mockResolvedValue([]);

    const result = await service.getAvailableHours({
      startDateParam: "2023-10-01",
      endDateParam: "2023-10-01",
    });

    // 2023-10-01 is Sunday => day=0
    // We expect hours 8 and 9 to be free
    expect(result).toEqual({
      hourSlots: [
        { day: 0, hour: 8 },
        { day: 0, hour: 9 },
      ],
    });
  });

  it("should skip booked hours", async () => {
    const mockSlot: AvailableSlot = {
      id: 2,
      teacherId: 202,
      startTime: new Date("2023-10-02T08:00:00Z"),
      endTime: new Date("2023-10-02T10:00:00Z"),
      rrule: null,
    };
    const mockBooked: BookedClass = {
      id: 99,
      teacherId: 202,
      date: new Date("2023-10-02T09:00:00Z"),
      studentId: 123,
      recurring: false,
    };
    mockAvailableHoursRepo.fetchAll.mockResolvedValue([mockSlot]);
    mockBookedClassRepo.fetchAll.mockResolvedValue([mockBooked]);

    const result = await service.getAvailableHours({
      startDateParam: "2023-10-02",
      endDateParam: "2023-10-02",
    });

    // 2023-10-02 is Monday => day=1
    // Hour 9 is booked, so only hour 8 remains
    expect(result).toEqual({
      hourSlots: [{ day: 1, hour: 8 }],
    });
  });

  it("should filter to fixed-schedule slots when fixedScheduleParam is 'true'", async () => {
    const mockSlots: AvailableSlot[] = [
      {
        id: 10,
        teacherId: 303,
        startTime: new Date("2023-10-05T08:00:00Z"),
        endTime: new Date("2023-10-05T10:00:00Z"),
        rrule: null,
      },
      {
        id: 11,
        teacherId: 404,
        startTime: new Date("2023-10-05T09:00:00Z"),
        endTime: new Date("2023-10-05T11:00:00Z"),
        rrule: "FREQ=DAILY;COUNT=3", // This one is fixed schedule
      },
    ];
    mockAvailableHoursRepo.fetchAll.mockResolvedValue(mockSlots);
    mockBookedClassRepo.fetchAll.mockResolvedValue([]);

    const result = await service.getAvailableHours({
      startDateParam: "2023-10-05",
      endDateParam: "2023-10-05",
      fixedScheduleParam: "true",
    });

    // We expect only slot id=11 to be considered
    // 2023-10-05 => day=4, hours 9 and 10
    expect(result.hourSlots).toContainEqual({ day: 4, hour: 9 });
    expect(result.hourSlots).toContainEqual({ day: 4, hour: 10 });
    expect(result.hourSlots).not.toContainEqual({ day: 4, hour: 8 });
  });
});
