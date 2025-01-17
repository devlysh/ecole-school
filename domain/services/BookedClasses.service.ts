import { BookedClassesRepository } from "../repositories/BookedClasses.repository";
import { UserRepository } from "@domain/repositories/User.repository";
import { StudentRepository } from "@domain/repositories/Student.repository";
import logger from "@/lib/logger";
import { AvailableSlotsService } from "./AvailableSlots.service";
import { AvailableSlotsRepository } from "@domain/repositories/AvailableSlots.repository";
import { AvailableSlot, BookedClass, User } from "@prisma/client";
import { addWeeks } from "date-fns";

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
    const user = await this.userRepository.findStudentByEmail(email);

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
          isActive: true,
        }))
      );
      return Response.json({ result }, { status: 200 });
    }

    const availableSlots = await this.getAvailableSlots(
      assignedTeacherId,
      isRecurrentSchedule
    );
    const selectedTeachers =
      AvailableSlotsService.collectTeachersForSelectedSlots(
        availableSlots,
        selectedSlots
      );

    const teacherToAssign = this.determineTeacherToAssign(selectedTeachers);

    await this.studentRepository.updateAssignedTeacher(
      user.id,
      teacherToAssign
    );

    await this.bookedClassesRepository.createBookedClasses(
      selectedSlots.map((date) => ({
        date,
        teacherId: teacherToAssign,
        studentId: user.id,
        recurring: isRecurrentSchedule,
        isActive: true,
      }))
    );

    return { message: "Classes booked successfully" };
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
    const user = await this.userRepository.findStudentByEmail(email);

    if (!user || !user.id || !user.student) {
      throw new Error("User not found");
    }

    const classes =
      await this.bookedClassesRepository.fetchBookedClassesByStudentId(user.id);
    return classes;
  }

  public async deleteBookedClassById(
    email: string,
    classBeingDeletedId: number,
    classBeingDeletedDate: Date
  ) {
    const user = await this.userRepository.findStudentByEmail(email);

    if (!user || !user.id || !user.student) {
      throw new Error("User not found");
    }

    const bookedClass =
      await this.bookedClassesRepository.fetchBookedClassById(
        classBeingDeletedId
      );

    if (!bookedClass) {
      throw new Error("Booked class not found");
    }

    if (bookedClass.recurring) {
      const nextWeekDate = addWeeks(classBeingDeletedDate, 1);

      const recurringClass = {
        date: nextWeekDate,
        teacherId: bookedClass.teacherId,
        studentId: user.id,
        recurring: true,
        isActive: true,
      };

      const singleClasses = this.generateSingleClasses(
        bookedClass,
        classBeingDeletedDate,
        user
      );

      try {
        await this.bookedClassesRepository.createBookedClasses(singleClasses);
        await this.bookedClassesRepository.createBookedClasses([
          recurringClass,
        ]);
        await this.bookedClassesRepository.deleteByIdAndStudentId(
          classBeingDeletedId,
          user.id
        );
      } catch (error) {
        logger.error(error, "Error creating booked classes");
        throw new Error("Failed to create booked classes");
      }

      return { message: "Classes deleted successfully" };
    } else {
      return await this.bookedClassesRepository.deleteByIdAndStudentId(
        classBeingDeletedId,
        user.id
      );
    }
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

  private determineTeacherToAssign(selectedTeachers: Set<number>) {
    return Array.from(selectedTeachers)[
      Math.floor(Math.random() * selectedTeachers.size)
    ];
  }

  private generateSingleClasses(
    bookedClass: BookedClass,
    classBeingDeletedDate: Date,
    user: User
  ) {
    return this.getWeeklyOccurrencesInPast(
      bookedClass.date,
      classBeingDeletedDate,
      new Date()
    ).map((classDate) => ({
      date: classDate,
      teacherId: bookedClass.teacherId,
      studentId: user.id,
      recurring: false,
      isActive: true,
    }));
  }

  private getWeeklyOccurrencesInPast(
    startDate: Date,
    endDate: Date,
    now: Date
  ) {
    const occurrences = [];
    const date = new Date(startDate);

    while (date < endDate) {
      if (date > now) {
        occurrences.push(new Date(date));
      }
      date.setDate(date.getDate() + 7);
    }

    return occurrences;
  }
}
