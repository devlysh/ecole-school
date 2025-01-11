import { AvailableSlotsRepository } from "../../repositories/AvailableSlotsRepository";
import { BookedClassesRepository } from "../../repositories/BookedClassesRepository";
import { AvailableSlot, BookedClass } from "@prisma/client";
import { UserRepository } from "../../repositories/UserRepository";
import { compressTime } from "@/lib/utils";
import { SlotAvailibilityStrategy } from "@domain/strategies/SlotAvailibilityStrategy.interface";
import logger from "@/lib/logger";
import { IsSlotAvailableStrategy } from "@domain/strategies/IsSlotAvailable.strategy";
import { IsSlotBookedStrategy } from "@domain/strategies/IsSlotBooked.strategy";

interface GetAvailableHoursParams {
  startDate: Date;
  endDate: Date;
  isRecurrentSchedule: boolean;
  selectedSlots?: Date[];
  email: string;
}

export class AvailableHoursService {
  private strategies: SlotAvailibilityStrategy[];
  private userRepo: UserRepository;
  private availableHoursRepo: AvailableSlotsRepository;
  private bookClassesRepo: BookedClassesRepository;

  constructor(
    strategies?: SlotAvailibilityStrategy[],
    userRepo?: UserRepository,
    availableHoursRepo?: AvailableSlotsRepository,
    bookClassesRepo?: BookedClassesRepository
  ) {
    this.availableHoursRepo =
      availableHoursRepo || new AvailableSlotsRepository();
    this.bookClassesRepo = bookClassesRepo || new BookedClassesRepository();
    this.userRepo = userRepo || new UserRepository();
    this.strategies = strategies || [];
  }

  public async getAvailableHours(
    params: GetAvailableHoursParams
  ): Promise<number[]> {
    const { email, startDate, endDate, isRecurrentSchedule } = params;

    if (!email) {
      throw new Error("Email is required");
    }

    const user = await this.userRepo.findByEmail(email);
    const assignedTeacherId = user?.student?.assignedTeacherId;

    let availableSlots: AvailableSlot[];

    if (assignedTeacherId) {
      availableSlots = isRecurrentSchedule
        ? await this.availableHoursRepo.fetchRecurringByTeacherId(
            assignedTeacherId
          )
        : await this.availableHoursRepo.fetchByTeacherId(assignedTeacherId);
    } else {
      availableSlots = isRecurrentSchedule
        ? await this.availableHoursRepo.fetchRecurringSlots()
        : await this.availableHoursRepo.fetchAll();
    }

    const bookedClasses: BookedClass[] =
      await this.bookClassesRepo.fetchAllBookedClasses();

    logger.debug({ user }, "User");

    const isSlotAvailable = new IsSlotAvailableStrategy();
    const isSlotBooked = new IsSlotBookedStrategy();

    const availableTimes = [];

    for (const slot of availableSlots) {
      const hourlySlots = this.generateHourlySlots(
        slot.startTime,
        slot.endTime
      );

      logger.debug({ hourlySlots }, "Hourly Slots");

      for (
        let date = new Date(startDate);
        date <= endDate;
        date.setDate(date.getDate() + 1)
      ) {
        for (const hourlySlot of hourlySlots) {
          const dateTime = new Date(date);
          dateTime.setHours(
            hourlySlot.getHours(),
            hourlySlot.getMinutes(),
            hourlySlot.getSeconds()
          );

          const context = { slot, dateTime, bookedClasses };

          if (
            isSlotAvailable.isAvailable(context) &&
            isSlotBooked.isAvailable(context)
          ) {
            availableTimes.push(dateTime);
          }
        }
      }
    }

    return availableTimes.map((time) => compressTime(time.getTime()));
  }

  private generateHourlySlots(startDate: Date, endDate: Date): Date[] {
    const hourlySlots: Date[] = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      hourlySlots.push(new Date(currentDate));
      currentDate.setHours(currentDate.getHours() + 1);
    }

    return hourlySlots;
  }
}
