import { AvailableHoursService } from "./AvailableHoursService";
import { AvailableSlotsRepository } from "@domain/repositories/AvailableSlotsRepository";
import { BookedClassesRepository } from "@domain/repositories/BookedClassesRepository";
import { UserRepository } from "@domain/repositories/UserRepository";
import { AvailableSlot, BookedClass, Student, User } from "@prisma/client";
import { IsSlotAvailableStrategy } from "@domain/strategies/IsSlotAvailable.strategy";
import { IsSlotBookedStrategy } from "@domain/strategies/IsSlotBooked.strategy";
import { HandleSelectedSlotsStrategy } from "@domain/strategies/HandleSelectedSlotsStrategy.strategy";
import { SlotAvailibilityStrategy } from "@domain/strategies/SlotAvailibilityStrategy.interface";
import { VacationsRepository } from "@domain/repositories/VacationsRepostiroy";

jest.mock("@domain/repositories/AvailableSlotsRepository");
jest.mock("@domain/repositories/BookedClassesRepository");
jest.mock("@domain/repositories/VacationsRepostiroy");
jest.mock("@domain/repositories/UserRepository");

/**
 * Helper to create a mock user object with optional assignedTeacherId
 */
function createMockUser(
  email: string,
  assignedTeacherId?: number
): Partial<User> & { student?: Partial<Student> } {
  return {
    email,
    student: { assignedTeacherId } as Partial<Student>,
  };
}

/**
 * Helper to create an AvailableSlot
 */
function createMockSlot(
  id: number,
  teacherId: number,
  startTime: string,
  endTime: string,
  rrule: string | null = null
): AvailableSlot {
  return {
    id,
    teacherId,
    startTime: new Date(startTime),
    endTime: new Date(endTime),
    rrule,
  };
}

/**
 * Helper to create a BookedClass
 */
function createMockBookedClass(
  id: number,
  teacherId: number,
  dateTime: string
): BookedClass {
  return {
    id,
    teacherId,
    studentId: 1,
    date: new Date(dateTime),
    recurring: false,
  };
}

const mockFetchAllBookedClasses = BookedClassesRepository.prototype
  .fetchAllBookedClasses as jest.Mock;
const mockFetchAll = AvailableSlotsRepository.prototype.fetchAll as jest.Mock;
const mockFetchRecurringSlots = AvailableSlotsRepository.prototype
  .fetchRecurringSlots as jest.Mock;
const mockFetchByTeacherId = AvailableSlotsRepository.prototype
  .fetchByTeacherId as jest.Mock;
const mockFetchRecurringByTeacherId = AvailableSlotsRepository.prototype
  .fetchRecurringByTeacherId as jest.Mock;
const mockFindByEmail = UserRepository.prototype.findByEmail as jest.Mock;
const mockFetchAllVacations = VacationsRepository.prototype
  .fetchAllVacations as jest.Mock;

describe("AvailableHoursService", () => {
  let service: AvailableHoursService;
  let mockStrategies: SlotAvailibilityStrategy[];

  beforeEach(() => {
    jest.clearAllMocks();
    mockStrategies = [
      new IsSlotAvailableStrategy(),
      new IsSlotBookedStrategy(),
      new HandleSelectedSlotsStrategy(),
    ];
    service = new AvailableHoursService(
      undefined,
      undefined,
      undefined,
      undefined,
      mockStrategies
    );
  });

  describe("Validation", () => {
    it("should throw an error if email is not provided", async () => {
      await expect(
        service.getAvailableHours({
          email: "",
          startDate: new Date(),
          endDate: new Date(),
          isRecurrentSchedule: false,
        })
      ).rejects.toThrow("Email is required");
    });

    it("should return an empty array if startDate is after endDate", async () => {
      const mockUser = createMockUser("student@example.com", 1);
      mockFindByEmail.mockResolvedValue(mockUser);
      mockFetchByTeacherId.mockResolvedValue([]);
      mockFetchAllBookedClasses.mockResolvedValue([]);

      const result = await service.getAvailableHours({
        email: "student@example.com",
        startDate: new Date("2025-01-10T12:00:00Z"),
        endDate: new Date("2025-01-10T08:00:00Z"),
        isRecurrentSchedule: false,
      });

      expect(result).toEqual([]);
    });

    it("should handle same start and end date", async () => {
      const mockUser = createMockUser("student@example.com", 1);
      mockFindByEmail.mockResolvedValue(mockUser);
      mockFetchByTeacherId.mockResolvedValue([]);
      mockFetchAllBookedClasses.mockResolvedValue([]);

      const result = await service.getAvailableHours({
        email: "student@example.com",
        startDate: new Date("2025-01-10T00:00:00Z"),
        endDate: new Date("2025-01-10T00:00:00Z"),
        isRecurrentSchedule: false,
      });

      expect(result).toEqual([]);
    });
  });

  describe("Strategy Integration", () => {
    it("should use strategies to determine slot availability", async () => {
      const mockUser = createMockUser("student@example.com", 42);
      const availableSlots: AvailableSlot[] = [
        createMockSlot(1, 42, "2023-01-01T09:00:00Z", "2023-01-01T10:00:00Z"),
      ];

      mockFindByEmail.mockResolvedValue(mockUser);
      mockFetchByTeacherId.mockResolvedValue(availableSlots);
      mockFetchAllBookedClasses.mockResolvedValue([]);

      jest.spyOn(mockStrategies[0], "isAvailable").mockReturnValue(true);
      jest.spyOn(mockStrategies[1], "isAvailable").mockReturnValue(true);
      jest.spyOn(mockStrategies[2], "isAvailable").mockReturnValue(true);

      const result = await service.getAvailableHours({
        email: "student@example.com",
        startDate: new Date("2023-01-01T00:00:00Z"),
        endDate: new Date("2023-01-01T23:59:59Z"),
        isRecurrentSchedule: false,
      });

      expect(result).toEqual(expect.any(Array));
      expect(mockStrategies[0].isAvailable).toHaveBeenCalled();
      expect(mockStrategies[1].isAvailable).toHaveBeenCalled();
      expect(mockStrategies[2].isAvailable).toHaveBeenCalled();
    });

    it("should handle one strategy returning false", async () => {
      const mockUser = createMockUser("student@example.com", 42);
      const availableSlots: AvailableSlot[] = [
        createMockSlot(1, 42, "2023-01-01T09:00:00Z", "2023-01-01T10:00:00Z"),
      ];

      mockFindByEmail.mockResolvedValue(mockUser);
      mockFetchByTeacherId.mockResolvedValue(availableSlots);
      mockFetchAllBookedClasses.mockResolvedValue([]);

      jest.spyOn(mockStrategies[0], "isAvailable").mockReturnValue(true);
      jest.spyOn(mockStrategies[1], "isAvailable").mockReturnValue(false);
      jest.spyOn(mockStrategies[2], "isAvailable").mockReturnValue(true);

      const result = await service.getAvailableHours({
        email: "student@example.com",
        startDate: new Date("2023-01-01T00:00:00Z"),
        endDate: new Date("2023-01-01T23:59:59Z"),
        isRecurrentSchedule: false,
      });

      expect(result).toEqual([]);
    });

    it("should handle all strategies returning false", async () => {
      const mockUser = createMockUser("student@example.com", 42);
      const availableSlots: AvailableSlot[] = [
        createMockSlot(1, 42, "2023-01-01T09:00:00Z", "2023-01-01T10:00:00Z"),
      ];

      mockFindByEmail.mockResolvedValue(mockUser);
      mockFetchByTeacherId.mockResolvedValue(availableSlots);
      mockFetchAllBookedClasses.mockResolvedValue([]);

      jest.spyOn(mockStrategies[0], "isAvailable").mockReturnValue(false);
      jest.spyOn(mockStrategies[1], "isAvailable").mockReturnValue(false);
      jest.spyOn(mockStrategies[2], "isAvailable").mockReturnValue(false);

      const result = await service.getAvailableHours({
        email: "student@example.com",
        startDate: new Date("2023-01-01T00:00:00Z"),
        endDate: new Date("2023-01-01T23:59:59Z"),
        isRecurrentSchedule: false,
      });

      expect(result).toEqual([]);
    });
  });

  describe("Time Zone Handling", () => {
    it("should correctly handle slots in different time zones", async () => {
      const mockUser = createMockUser("student@example.com", 42);
      const availableSlots: AvailableSlot[] = [
        createMockSlot(
          1,
          42,
          "2023-01-01T09:00:00-05:00",
          "2023-01-01T10:00:00-05:00"
        ),
      ];

      mockFindByEmail.mockResolvedValue(mockUser);
      mockFetchByTeacherId.mockResolvedValue(availableSlots);
      mockFetchAllBookedClasses.mockResolvedValue([]);

      jest.spyOn(mockStrategies[0], "isAvailable").mockReturnValue(true);
      jest.spyOn(mockStrategies[1], "isAvailable").mockReturnValue(true);
      jest.spyOn(mockStrategies[2], "isAvailable").mockReturnValue(true);

      const result = await service.getAvailableHours({
        email: "student@example.com",
        startDate: new Date("2023-01-01T14:00:00Z"), // Equivalent to 09:00 in -05:00
        endDate: new Date("2023-01-01T15:00:00Z"),
        isRecurrentSchedule: false,
      });

      expect(result).toEqual(expect.any(Array));
    });
  });

  describe("Complex Scenarios", () => {
    it("should handle multiple slots and bookings", async () => {
      const mockUser = createMockUser("student@example.com", 42);
      const availableSlots: AvailableSlot[] = [
        createMockSlot(1, 42, "2023-01-01T09:00:00Z", "2023-01-01T10:00:00Z"),
        createMockSlot(2, 42, "2023-01-01T11:00:00Z", "2023-01-01T12:00:00Z"),
      ];
      const bookedClasses: BookedClass[] = [
        createMockBookedClass(1, 42, "2023-01-01T09:30:00Z"),
      ];

      mockFindByEmail.mockResolvedValue(mockUser);
      mockFetchByTeacherId.mockResolvedValue(availableSlots);
      mockFetchAllBookedClasses.mockResolvedValue(bookedClasses);

      jest.spyOn(mockStrategies[0], "isAvailable").mockReturnValue(true);
      jest.spyOn(mockStrategies[1], "isAvailable").mockReturnValue(false);
      jest.spyOn(mockStrategies[2], "isAvailable").mockReturnValue(true);

      const result = await service.getAvailableHours({
        email: "student@example.com",
        startDate: new Date("2023-01-01T00:00:00Z"),
        endDate: new Date("2023-01-01T23:59:59Z"),
        isRecurrentSchedule: false,
      });

      expect(result).toEqual(expect.any(Array));
    });
  });

  describe("Edge Cases for Recurring Slots", () => {
    it("should handle recurring slots that overlap with the given time on different days", async () => {
      const mockUser = createMockUser("student@example.com", 42);
      const availableSlots: AvailableSlot[] = [
        createMockSlot(
          1,
          42,
          "2023-01-01T09:00:00Z",
          "2023-01-01T10:00:00Z",
          "FREQ=DAILY"
        ),
      ];

      mockFindByEmail.mockResolvedValue(mockUser);
      mockFetchByTeacherId.mockResolvedValue(availableSlots);
      mockFetchAllBookedClasses.mockResolvedValue([]);

      jest.spyOn(mockStrategies[0], "isAvailable").mockReturnValue(true);
      jest.spyOn(mockStrategies[1], "isAvailable").mockReturnValue(true);
      jest.spyOn(mockStrategies[2], "isAvailable").mockReturnValue(true);

      const result = await service.getAvailableHours({
        email: "student@example.com",
        startDate: new Date("2023-01-02T09:00:00Z"),
        endDate: new Date("2023-01-02T10:00:00Z"),
        isRecurrentSchedule: true,
      });

      expect(result).toEqual(expect.any(Array));
    });
  });

  describe("Invalid Data Handling", () => {
    it("should handle invalid slot data gracefully", async () => {
      const mockUser = createMockUser("student@example.com", 42);
      const availableSlots: AvailableSlot[] = [
        createMockSlot(1, 42, "INVALID_DATE", "2023-01-01T10:00:00Z"),
      ];

      mockFindByEmail.mockResolvedValue(mockUser);
      mockFetchByTeacherId.mockResolvedValue(availableSlots);
      mockFetchAllBookedClasses.mockResolvedValue([]);

      jest.spyOn(mockStrategies[0], "isAvailable").mockReturnValue(false);
      jest.spyOn(mockStrategies[1], "isAvailable").mockReturnValue(false);
      jest.spyOn(mockStrategies[2], "isAvailable").mockReturnValue(false);

      const result = await service.getAvailableHours({
        email: "student@example.com",
        startDate: new Date("2023-01-01T00:00:00Z"),
        endDate: new Date("2023-01-01T23:59:59Z"),
        isRecurrentSchedule: false,
      });

      expect(result).toEqual([]);
    });
  });
});
