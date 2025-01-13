import { BookedClassesRepository } from "../../repositories/BookedClasses.repository";
import { UserRepository } from "@domain/repositories/User.repository";
import { StudentRepository } from "@domain/repositories/Student.repository";
import logger from "@/lib/logger";
import { AvailableHoursService } from "../available-hours/AvailableHoursService";
import { AvailableSlotsRepository } from "@domain/repositories/AvailableSlots.repository";
import { AvailableSlot } from "@prisma/client";

export class BookedClassesService {
  private userRepository: UserRepository;
  private studentRepository: StudentRepository;
  private bookedClassesRepository: BookedClassesRepository;
  private availableSlotsRepository: AvailableSlotsRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.studentRepository = new StudentRepository();
    this.bookedClassesRepository = new BookedClassesRepository();
    this.availableSlotsRepository = new AvailableSlotsRepository();
  }

  public async bookClasses(
    email: string,
    selectedSlots: Date[],
    isRecurrentSchedule: boolean
  ) {
    const user = await this.userRepository.findByEmail(email);

    if (!user?.student) {
      throw new Error("You must be a student to book classes");
    }

    const assignedTeacherId = user.student.assignedTeacherId;

    if (assignedTeacherId) {
      const result = this.bookedClassesRepository.createBookedClasses(
        selectedSlots.map((date) => ({
          date,
          teacherId: assignedTeacherId,
          studentId: user.id,
          recurring: isRecurrentSchedule,
        }))
      );
      return Response.json({ result }, { status: 200 });
    }

    const availableSlots = await this.getAvailableSlots(
      assignedTeacherId,
      isRecurrentSchedule
    );
    const selectedTeachers =
      AvailableHoursService.collectTeachersForSelectedSlots(
        availableSlots,
        selectedSlots
      );
    const teacherToAssign =
      Array.from(selectedTeachers)[
        Math.floor(Math.random() * selectedTeachers.size)
      ];

    await this.studentRepository.updateAssignedTeacher(
      user.id,
      teacherToAssign
    );

    const result = this.bookedClassesRepository.createBookedClasses(
      selectedSlots.map((date) => ({
        date,
        teacherId: teacherToAssign,
        studentId: user.id,
        recurring: isRecurrentSchedule,
      }))
    );

    logger.debug(
      {
        selectedTeachers: Array.from(selectedTeachers),
        teacherToAssign,
      },
      "DEBUG!"
    );

    return Response.json({ result }, { status: 200 });
  }

  private async getAvailableSlots(
    assignedTeacherId: number | null,
    isRecurrentSchedule: boolean
  ): Promise<AvailableSlot[]> {
    if (assignedTeacherId) {
      return isRecurrentSchedule
        ? this.availableSlotsRepository.fetchByTeacherId(assignedTeacherId)
        : this.availableSlotsRepository.fetchRecurringByTeacherId(
            assignedTeacherId
          );
    } else {
      return isRecurrentSchedule
        ? this.availableSlotsRepository.fetchAll()
        : this.availableSlotsRepository.fetchRecurringSlots();
    }
  }

  public async getBookedClasses() {
    try {
      const classes =
        await this.bookedClassesRepository.fetchAllBookedClasses();
      return classes;
    } catch (error) {
      logger.error(error, "Error fetching booked classes");
      throw new Error("Failed to fetch booked classes");
    }
  }

  public async getBookedClassesByEmail(email: string) {
    const user = await this.userRepository.findByEmail(email);

    if (!user || !user.id || !user.student) {
      throw new Error("User not found");
    }

    const classes =
      await this.bookedClassesRepository.fetchBookedClassesByStudentId(user.id);
    return classes;
  }

  public async deleteBookedClassById(email: string, classId: number) {
    const user = await this.userRepository.findByEmail(email);

    if (!user || !user.id || !user.student) {
      throw new Error("User not found");
    }

    await this.bookedClassesRepository.deleteByIdAndStudentId(classId, user.id);
  }
}
