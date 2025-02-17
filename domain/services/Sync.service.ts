import logger from "@/lib/logger";
import { BookedClassesRepository } from "@domain/repositories/BookedClasses.repository";
import { CreditsRepository } from "@domain/repositories/Credits.repository";
import { PaidClassesRepository } from "@domain/repositories/PaidClasses.repository";
import { UnpaidClassesRepository } from "@domain/repositories/UnpaidClasses.repository";
import { BookedClass } from "@prisma/client";
import { addWeeks, isSameHour, subDays } from "date-fns";

const UNPAID_CLASS_LOOKBACK_DAYS = 7;
const UNPAID_CLASS_LIMIT = 2;

export class SyncService {
  private bookedClassesRepo: BookedClassesRepository;
  private paidClassesRepo: PaidClassesRepository;
  private unpaidClassesRepo: UnpaidClassesRepository;
  private creditsRepo: CreditsRepository;

  constructor() {
    this.bookedClassesRepo = new BookedClassesRepository();
    this.paidClassesRepo = new PaidClassesRepository();
    this.unpaidClassesRepo = new UnpaidClassesRepository();
    this.creditsRepo = new CreditsRepository();
  }

  public async sync(): Promise<void> {
    const currentHourBookedClasses = await this.getCurrentHourBookedClasses();
    logger.info({ currentHourBookedClasses }, "Syncing...");

    for (const bookedClass of currentHourBookedClasses) {
      await this.processBookedClass(bookedClass);
    }
  }

  private async processBookedClass(bookedClass: BookedClass): Promise<void> {
    const { studentId } = bookedClass;
    const availableCredit = await this.creditsRepo.findFirstUnused(studentId);

    if (!availableCredit) {
      await this.processUnpaidClass(bookedClass);
      return;
    } else {
      await this.processPaidClass(bookedClass, availableCredit.id);
    }
  }

  private async processUnpaidClass(bookedClass: BookedClass): Promise<void> {
    const { studentId, teacherId, date } = bookedClass;

    logger.info({ studentId }, "Student has no available credits");
    const lookbackDate = subDays(date, UNPAID_CLASS_LOOKBACK_DAYS);
    const unpaidClasses =
      await this.unpaidClassesRepo.findByStudentIdAndDateRange(
        studentId,
        date,
        lookbackDate
      );

    if (unpaidClasses.length < UNPAID_CLASS_LIMIT) {
      await this.unpaidClassesRepo.create(studentId, teacherId);
      logger.info({ studentId }, "Created unpaid class");
    } else {
      await this.bookedClassesRepo.deleteAllByStudentId(studentId);
      logger.info(
        { studentId },
        "Student has too many unpaid classes for allowed lookback period. Deleting all booked classes."
      );
    }
  }

  private async processPaidClass(
    bookedClass: BookedClass,
    availableCreditId: number
  ): Promise<void> {
    const { studentId, teacherId, date, recurring, id } = bookedClass;

    const paidClass = await this.paidClassesRepo.create(studentId, teacherId);
    logger.info({ studentId, paidClassId: paidClass.id }, "Created paid class");
    await this.creditsRepo.markAsUsed(availableCreditId, paidClass.id);
    logger.info({ studentId, availableCreditId }, "Marked credit as used");
    await this.bookedClassesRepo.deleteById(id);
    logger.info({ studentId, bookedClassId: id }, "Deleted booked class");

    if (recurring) {
      const nextOccurrence = addWeeks(date, 1);
      await this.bookedClassesRepo.create([
        {
          studentId,
          teacherId,
          date: nextOccurrence,
          recurring: true,
        },
      ]);
      logger.info({ studentId }, "Created next occurrence of recurring class");
    }
  }

  private async getCurrentHourBookedClasses(): Promise<BookedClass[]> {
    const now = new Date();
    const bookedClasses = await this.bookedClassesRepo.findAll();

    return bookedClasses.filter(({ date, recurring }) => {
      if (recurring) {
        const sameWeekDay = date.getDay() === now.getDay();
        const sameHourOfDay = date.getHours() === now.getHours();

        return sameWeekDay && sameHourOfDay;
      }
      return isSameHour(date, now);
    });
  }
}
