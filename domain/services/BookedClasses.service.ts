import { BookedClassesRepository } from "../repositories/BookedClasses.repository";
import { UserRepository } from "@domain/repositories/User.repository";
import { StudentRepository } from "@domain/repositories/Student.repository";
import { AvailableSlotsService } from "./AvailableSlots.service";
import { AvailableSlotsRepository } from "@domain/repositories/AvailableSlots.repository";
import { AvailableSlot, BookedClass, User } from "@prisma/client";
import { addWeeks } from "date-fns";
import {
  BookedClassNotFoundError,
  SlotIsNotAvailableError,
  UnauthorizedError,
  UserNotFoundError,
} from "@/lib/errors";

export class BookedClassesService {
  private userRepository: UserRepository;
  private studentRepository: StudentRepository;
  private bookedClassesRepository: BookedClassesRepository;
  private availableSlotsService: AvailableSlotsService;
  private availableSlotsRepository: AvailableSlotsRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.studentRepository = new StudentRepository();
    this.bookedClassesRepository = new BookedClassesRepository();
    this.availableSlotsService = new AvailableSlotsService();
    this.availableSlotsRepository = new AvailableSlotsRepository();
  }

  public async deleteAllBookedClassesById(studentId: number) {
    await this.bookedClassesRepository.deleteAllBookedClassesByStudentId(
      studentId
    );
  }

  public async deleteAllBookedClassesByEmail(email: string) {
    const user = await this.userRepository.findStudentByEmail(email);
    if (!user) {
      throw new UserNotFoundError("User not found", { email });
    }
    await this.bookedClassesRepository.deleteAllBookedClassesByStudentId(
      user.id
    );
  }

  public async bookClasses(
    email: string,
    selectedSlots: Date[],
    isRecurrent: boolean
  ) {
    const user = await this.userRepository.findStudentByEmail(email);

    if (!user?.student) {
      throw new UnauthorizedError("User is not a student", {
        email,
      });
    }

    const assignedTeacherId = user.student.assignedTeacherId;

    if (assignedTeacherId) {
      const result = this.bookedClassesRepository.createBookedClasses(
        selectedSlots.map(
          (date) =>
            ({
              date,
              teacherId: assignedTeacherId,
              studentId: user.id,
              recurring: isRecurrent,
            }) as BookedClass
        )
      );
      return Response.json({ result }, { status: 200 });
    }

    const availableSlots = await this.getAvailableSlots(
      assignedTeacherId,
      isRecurrent
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
      selectedSlots.map(
        (date) =>
          ({
            date,
            teacherId: teacherToAssign,
            studentId: user.id,
            recurring: isRecurrent,
          }) as BookedClass
      )
    );

    return { message: "Classes booked successfully" };
  }

  public async getBookedClasses() {
    return await this.bookedClassesRepository.fetchAllBookedClasses();
  }

  public async getBookedClassesByEmail(email: string) {
    const user = await this.userRepository.findStudentByEmail(email);

    if (!user || !user.id) {
      throw new UserNotFoundError();
    }

    if (!user.student) {
      throw new UnauthorizedError();
    }

    return await this.bookedClassesRepository.fetchBookedClassesByStudentId(
      user.id
    );
  }

  public async deleteBookedClassById(
    email: string,
    classBeingDeletedId: number,
    classBeingDeletedDate: Date,
    deleteFutureOccurences: boolean = false
  ) {
    const user = await this.getUserByEmail(email);
    const bookedClass = await this.getBookedClassById(classBeingDeletedId);

    if (bookedClass.recurring) {
      await this.handleRecurringClassDeletion(
        user,
        bookedClass,
        classBeingDeletedDate,
        deleteFutureOccurences
      );
    } else {
      await this.deleteClass(user.id, classBeingDeletedId);
    }

    return { message: "Classes deleted successfully" };
  }

  public async rescheduleBookedClass(
    email: string,
    classId: number,
    oldDate: Date,
    newDate: Date
  ) {
    const bookedClass =
      await this.bookedClassesRepository.fetchBookedClassById(classId);

    if (!bookedClass) {
      throw new BookedClassNotFoundError({ classId });
    }

    const isAvailable = await this.availableSlotsService.isSlotAvailable(
      newDate,
      bookedClass.teacherId
    );

    if (!isAvailable) {
      throw new SlotIsNotAvailableError({
        bookedClassId: bookedClass.id,
        teacherId: bookedClass.teacherId,
        oldDate,
        newDate,
      });
    }

    await this.deleteBookedClassById(email, classId, oldDate);
    await this.bookClasses(email, [newDate], false);

    return { message: "Class rescheduled successfully" };
  }

  private async getUserByEmail(email: string) {
    const user = await this.userRepository.findStudentByEmail(email);
    if (!user || !user.id) {
      throw new UserNotFoundError();
    }

    if (!user.student) {
      throw new UnauthorizedError("User is not a student", { email });
    }

    return user;
  }

  private async getBookedClassById(classId: number) {
    const bookedClass =
      await this.bookedClassesRepository.fetchBookedClassById(classId);
    if (!bookedClass) {
      throw new BookedClassNotFoundError({ classId });
    }
    return bookedClass;
  }

  private async handleRecurringClassDeletion(
    user: User,
    bookedClass: BookedClass,
    classBeingDeletedDate: Date,
    deleteFutureOccurences: boolean = false
  ) {
    // Add singles classes for past occurrences
    const singleClasses: BookedClass[] = this.generateSingleClasses(
      bookedClass,
      classBeingDeletedDate,
      user
    );
    await this.bookedClassesRepository.createBookedClasses(singleClasses);

    // Add recurring class for future occurrences if deleteFutureOccurences is true
    if (!deleteFutureOccurences) {
      const nextWeekDate = addWeeks(classBeingDeletedDate, 1);
      const recurringClass: BookedClass = this.createRecurringClass(
        nextWeekDate,
        bookedClass.teacherId,
        user.id
      );
      await this.bookedClassesRepository.createBookedClasses([recurringClass]);
    }

    // Delete the class being deleted
    await this.deleteClass(user.id, bookedClass.id);
  }

  private createRecurringClass(
    date: Date,
    teacherId: number,
    studentId: number
  ) {
    return {
      date,
      teacherId,
      studentId,
      recurring: true,
    } as BookedClass;
  }

  private async deleteClass(studentId: number, classId: number) {
    await this.bookedClassesRepository.deleteByIdAndStudentId(
      classId,
      studentId
    );
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
    ).map(
      (classDate) =>
        ({
          date: classDate,
          teacherId: bookedClass.teacherId,
          studentId: user.id,
          recurring: false,
        }) as BookedClass
    );
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
