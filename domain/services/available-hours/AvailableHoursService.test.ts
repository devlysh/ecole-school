import { AvailableHoursService } from "./AvailableHoursService";
import { AvailableSlotsRepository } from "@domain/repositories/AvailableSlotsRepository";
import { BookedClassesRepository } from "@domain/repositories/BookedClassesRepository";
import { UserRepository } from "@domain/repositories/UserRepository";
import { AvailableSlot, BookedClass } from "@prisma/client";

jest.mock("@domain/repositories/AvailableSlotsRepository");
jest.mock("@domain/repositories/BookedClassesRepository");
jest.mock("@domain/repositories/UserRepository");

const mockFetchAll = AvailableSlotsRepository.prototype.fetchAll as jest.Mock;
const mockFetchAllBookedClasses = BookedClassesRepository.prototype
  .fetchAllBookedClasses as jest.Mock;
const mockFindByEmail = UserRepository.prototype.findByEmail as jest.Mock;

describe("AvailableHoursService", () => {
  let service: AvailableHoursService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AvailableHoursService();
  });

  test("should return available hours for non-recurrent schedule", async () => {
    // Mock data setup
    const availableSlots: AvailableSlot[] = [
      {
        id: 276,
        startTime: new Date("2025-01-06T08:00:00"),
        endTime: new Date("2025-01-06T09:00:00"),
        rrule: "RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR",
        teacherId: 105,
      },
      {
        id: 277,
        startTime: new Date("2025-01-06T10:00:00"),
        endTime: new Date("2025-01-06T11:00:00"),
        rrule: "RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR",
        teacherId: 105,
      },
      {
        id: 278,
        startTime: new Date("2025-01-05T12:00:00"),
        endTime: new Date("2025-01-05T13:00:00"),
        rrule: "RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR",
        teacherId: 112,
      },
      {
        id: 279,
        startTime: new Date("2025-01-05T14:00:00"),
        endTime: new Date("2025-01-05T15:00:00"),
        rrule: "RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR",
        teacherId: 112,
      },
    ];

    const bookedClasses: BookedClass[] = []; // Assuming no booked classes for simplicity

    mockFetchAll.mockResolvedValue(availableSlots);
    mockFetchAllBookedClasses.mockResolvedValue(bookedClasses);
    mockFindByEmail.mockResolvedValue({
      email: "test@example.com",
      student: { assignedTeacherId: null },
    });

    const params = {
      startDate: new Date("2025-01-11"),
      endDate: new Date("2025-01-17"),
      isRecurrentSchedule: false,
      email: "test@example.com",
    };

    const result = await service.getAvailableHours(params);

    // Assertions
    expect(result).toBeDefined();
    expect(result.length).toBe(20);

    // Check specific times for each teacher
    const expectedTimes = [
      "2025-01-13T08:00:00",
      "2025-01-13T10:00:00",
      "2025-01-14T08:00:00",
      "2025-01-14T10:00:00",
      "2025-01-15T08:00:00",
      "2025-01-15T10:00:00",
      "2025-01-16T08:00:00",
      "2025-01-16T10:00:00",
      "2025-01-17T08:00:00",
      "2025-01-17T10:00:00",
      "2025-01-13T12:00:00",
      "2025-01-13T14:00:00",
      "2025-01-14T12:00:00",
      "2025-01-14T14:00:00",
      "2025-01-15T12:00:00",
      "2025-01-15T14:00:00",
      "2025-01-16T12:00:00",
      "2025-01-16T14:00:00",
      "2025-01-17T12:00:00",
      "2025-01-17T14:00:00",
    ];

    expectedTimes.forEach((time) => {
      expect(result).toContainEqual(
        expect.objectContaining({ startTime: new Date(time) })
      );
    });
  });

  // Add more test cases as needed
});
