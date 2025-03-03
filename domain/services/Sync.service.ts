import logger from "@/lib/logger";
import prisma from "@/lib/prisma";
import { BookedClassesRepository } from "@domain/repositories/BookedClasses.repository";
import { CreditsRepository } from "@domain/repositories/Credits.repository";
import { PaidClassesRepository } from "@domain/repositories/PaidClasses.repository";
import { UnpaidClassesRepository } from "@domain/repositories/UnpaidClasses.repository";
import { BookedClass } from "@prisma/client";
import { addHours, addWeeks, isSameHour, startOfHour, subDays } from "date-fns";

const UNPAID_CLASS_LOOKBACK_DAYS = 2;
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
    const now = new Date();
    const nextHourBookedClasses = await this.getNextHourBookedClasses(now);
    logger.info({ nextHourBookedClasses }, "Syncing...");

    for (const bookedClass of nextHourBookedClasses) {
      await this.processBookedClass(bookedClass, now);
    }
  }

  private async getNextHourBookedClasses(now: Date): Promise<BookedClass[]> {
    const nextHour = addHours(now, 1);
    const bookedClasses = await this.bookedClassesRepo.findAll();

    return bookedClasses.filter(({ date, recurring }) => {
      if (recurring) {
        const sameWeekDay = date.getDay() === nextHour.getDay();
        const sameHourOfDay = date.getHours() === nextHour.getHours();

        return sameWeekDay && sameHourOfDay;
      } else {
        return isSameHour(date, nextHour);
      }
    });
  }

  private async processBookedClass(
    bookedClass: BookedClass,
    now: Date
  ): Promise<void> {
    const { studentId } = bookedClass;
    const availableCredit = await this.creditsRepo.findFirstUnused(studentId);

    if (availableCredit) {
      await this.processPaidClass(bookedClass, availableCredit.id, now);
    } else {
      logger.info({ studentId }, "Student has no available credits");
      await this.processUnpaidClass(bookedClass, now);
    }
  }

  private async processPaidClass(
    bookedClass: BookedClass,
    availableCreditId: number,
    now: Date
  ): Promise<void> {
    await prisma.$transaction(async () => {
      const { studentId, teacherId, date, recurring, id } = bookedClass;
      const classHour = addHours(startOfHour(now), 1);

      const paidClass = await this.paidClassesRepo.create(
        studentId,
        teacherId,
        classHour
      );
      logger.info(
        { studentId, paidClassId: paidClass.id },
        "Created paid class"
      );

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
            createdAt: now,
          },
        ]);
        logger.info(
          { studentId },
          "Created next occurrence of recurring class"
        );
      }
    });
  }

  private async processUnpaidClass(
    bookedClass: BookedClass,
    now: Date
  ): Promise<void> {
    await prisma.$transaction(async () => {
      const { studentId, teacherId, date } = bookedClass;
      const lookbackDate = subDays(date, UNPAID_CLASS_LOOKBACK_DAYS);
      const unpaidClasses =
        await this.unpaidClassesRepo.findByStudentIdAndDateRange(
          studentId,
          lookbackDate,
          date
        );

      if (unpaidClasses.length < UNPAID_CLASS_LIMIT) {
        const classHour = addHours(startOfHour(now), 1);
        await this.unpaidClassesRepo.create(studentId, teacherId, classHour);
        logger.info({ studentId }, "Created unpaid class");
      } else {
        await this.bookedClassesRepo.deleteAllByStudentId(studentId);
        logger.info(
          { studentId },
          "Student has too many unpaid classes for allowed lookback period. Deleted all booked classes."
        );
      }
    });
  }
}
