import { BookClassesService } from "./BookClassesService";
import { BookClassesRepository } from "./BookClassesRepository";

jest.mock("./BookClassesRepository");

const mockFindUserByEmail = BookClassesRepository.findUserByEmail as jest.Mock;
const mockFindAvailableSlots =
  BookClassesRepository.findAvailableSlots as jest.Mock;
const mockFindTeacherBookings =
  BookClassesRepository.findTeacherBookings as jest.Mock;
const mockUpdateStudentAssignedTeacher =
  BookClassesRepository.updateStudentAssignedTeacher as jest.Mock;
const mockCreateBookedClasses =
  BookClassesRepository.createBookedClasses as jest.Mock;

const email = "student@example.com";
const dates = ["2023-01-01T10:00:00Z", "2023-01-02T10:00:00Z"];
const isFixedSchedule = true;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("BookClassesService", () => {
  test("should throw an error if user is not a student", async () => {
    mockFindUserByEmail.mockResolvedValue(null);

    await expect(
      BookClassesService.bookClasses(email, dates, isFixedSchedule)
    ).rejects.toThrow("You must be a student to book classes");
  });

  test("should book classes successfully", async () => {
    mockFindUserByEmail.mockResolvedValue({
      id: 1,
      student: { assignedTeacherId: null },
    });
    mockFindAvailableSlots.mockResolvedValue([
      {
        teacherId: 1,
        startTime: "2023-01-01T09:00:00Z",
        endTime: "2023-01-01T11:00:00Z",
        rrule: null,
      },
      {
        teacherId: 1,
        startTime: "2023-01-02T09:00:00Z",
        endTime: "2023-01-02T11:00:00Z",
        rrule: null,
      },
    ]);
    mockFindTeacherBookings.mockResolvedValue([]);
    mockUpdateStudentAssignedTeacher.mockResolvedValue({});
    mockCreateBookedClasses.mockResolvedValue({});

    const result = await BookClassesService.bookClasses(
      email,
      dates,
      isFixedSchedule
    );

    expect(result).toEqual({ success: true });
    expect(mockCreateBookedClasses).toHaveBeenCalled();
  });

  // Add more tests as needed
});
