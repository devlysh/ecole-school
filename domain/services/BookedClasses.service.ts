import { BookedClassesRepository } from "@domain/repositories/BookedClasses.repository";
import { UsersRepository } from "@domain/repositories/Users.repository";
import { StudentsRepository } from "@domain/repositories/Students.repository";
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
  private userRepository: UsersRepository;
  private studentRepository: StudentsRepository;
  private bookedClassesRepository: BookedClassesRepository;
  private availableSlotsService: AvailableSlotsService;
  private availableSlotsRepository: AvailableSlotsRepository;

  constructor() {
    this.userRepository = new UsersRepository();
    this.studentRepository = new StudentsRepository();
    this.bookedClassesRepository = new BookedClassesRepository();
    this.availableSlotsService = new AvailableSlotsService();
    this.availableSlotsRepository = new AvailableSlotsRepository();
  }

  public async deleteAllBookedClassesById(studentId: number) {
    await this.bookedClassesRepository.deleteAllByStudentId(studentId);
  }

  public async deleteAllBookedClassesByEmail(email: string) {
    const user = await this.userRepository.findStudentByEmail(email);
    if (!user) {
      throw new UserNotFoundError("User not found", { email });
    }
    await this.bookedClassesRepository.deleteAllByStudentId(user.id);
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
      const result = await this.bookedClassesRepository.create(
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

    await this.bookedClassesRepository.create(
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

  public async getStudentBookedClassesByEmail(email: string) {
    const user = await this.userRepository.findStudentByEmail(email);

    if (!user || !user.id) {
      throw new UserNotFoundError();
    }

    if (!user.student) {
      throw new UnauthorizedError("User is not a student", { email });
    }

    return await this.bookedClassesRepository.findByStudentId(user.id);
  }

  public async getTeacherBookedClassesByEmail(email: string) {
    const user = await this.userRepository.findTeacherByEmail(email);

    if (!user || !user.id) {
      throw new UserNotFoundError();
    }

    if (!user.teacher) {
      throw new UnauthorizedError("User is not a teacher", { email });
    }

    return await this.bookedClassesRepository.findByTeacherId(user.id);
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
      await this.deleteClass(classBeingDeletedId);
    }

    return { message: "Classes deleted successfully" };
  }

  public async rescheduleBookedClass(
    email: string,
    classId: number,
    oldDate: Date,
    newDate: Date
  ) {
    const bookedClass = await this.bookedClassesRepository.findById(classId);

    if (!bookedClass) {
      throw new BookedClassNotFoundError({ classId });
    }

    const isAvailable = await this.availableSlotsService.isSlotAvailable(
      email,
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
    const bookedClass = await this.bookedClassesRepository.findById(classId);
    if (!bookedClass) {
      throw new BookedClassNotFoundError({ classId });
    }
    return bookedClass;
  }

  private async handleRecurringClassDeletion(
    user: Omit<User, "passwordHash">,
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
    await this.bookedClassesRepository.create(singleClasses);

    // creating a recurring class for future if the user doesn't want to delete future occurences
    if (!deleteFutureOccurences) {
      const nextWeekDate = addWeeks(classBeingDeletedDate, 1);
      const recurringClass: BookedClass = this.createRecurringClass(
        nextWeekDate,
        bookedClass.teacherId,
        user.id
      );
      await this.bookedClassesRepository.create([recurringClass]);
    }

    await this.deleteClass(bookedClass.id);
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

  private async deleteClass(id: number) {
    await this.bookedClassesRepository.deleteById(id);
  }

  private async getAvailableSlots(
    assignedTeacherId: number | null,
    isRecurrentSchedule: boolean
  ): Promise<AvailableSlot[]> {
    if (assignedTeacherId) {
      return isRecurrentSchedule
        ? await this.availableSlotsRepository.findByTeacherId(assignedTeacherId)
        : await this.availableSlotsRepository.findRecurringByTeacherId(
            assignedTeacherId
          );
    } else {
      return isRecurrentSchedule
        ? await this.availableSlotsRepository.findAll()
        : await this.availableSlotsRepository.findRecurringSlots();
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
    user: Omit<User, "passwordHash">
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
