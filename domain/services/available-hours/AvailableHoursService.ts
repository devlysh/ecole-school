import { AvailableSlotsRepository } from "../../repositories/AvailableSlotsRepository";
import { BookedClassesRepository } from "../../repositories/BookedClassesRepository";
import { AvailableSlot, BookedClass } from "@prisma/client";
import { UserRepository } from "../../repositories/UserRepository";
import { compressTime } from "@/lib/utils";
import {
  SlotAvailibilityContext,
  SlotAvailibilityStrategy,
} from "@domain/strategies/SlotAvailibilityStrategy.interface";
import { IsSlotAvailableStrategy } from "@domain/strategies/IsSlotAvailable.strategy";
import { IsSlotBookedStrategy } from "@domain/strategies/IsSlotBooked.strategy";
import { HandleSelectedSlotsStrategy } from "@domain/strategies/HandleSelectedSlotsStrategy.strategy";
import { IsAssignedTeacherStrategy } from "@domain/strategies/IsAssignedTeacher.strategy";

interface GetAvailableHoursParams {
  startDate: Date;
  endDate: Date;
  isRecurrentSchedule: boolean;
  selectedSlots?: Date[];
  email: string;
}

interface ComputeAvailableTimesParams {
  allSlots: AvailableSlot[];
  allBookedClasses: BookedClass[];
  startDate: Date;
  endDate: Date;
  selectedSlots?: Date[];
  assignedTeacherId?: number;
  strategies: SlotAvailibilityStrategy[];
}

enum RangeUnit {
  Day = "Date",
  Hour = "Hours",
}

export class AvailableHoursService {
  private userRepo: UserRepository;
  private availableHoursRepo: AvailableSlotsRepository;
  private bookClassesRepo: BookedClassesRepository;
  private strategies: SlotAvailibilityStrategy[];

  constructor(
    userRepo?: UserRepository,
    availableHoursRepo?: AvailableSlotsRepository,
    bookClassesRepo?: BookedClassesRepository,
    strategies?: SlotAvailibilityStrategy[]
  ) {
    this.userRepo = userRepo || new UserRepository();
    this.availableHoursRepo =
      availableHoursRepo || new AvailableSlotsRepository();
    this.bookClassesRepo = bookClassesRepo || new BookedClassesRepository();
    this.strategies = strategies || [
      new IsSlotAvailableStrategy(),
      new IsSlotBookedStrategy(),
      new HandleSelectedSlotsStrategy(),
      new IsAssignedTeacherStrategy(),
    ];
  }

  public async getAvailableHours(
    params: GetAvailableHoursParams
  ): Promise<number[]> {
    this.validateParams(params);

    const { email, startDate, endDate, isRecurrentSchedule, selectedSlots } =
      params;

    const user = await this.userRepo.findByEmail(email);
    const assignedTeacherId = user?.student?.assignedTeacherId ?? undefined;

    let allSlots: AvailableSlot[] = [];

    const fetchedSlots = await this.fetchSlots(
      assignedTeacherId,
      isRecurrentSchedule
    );
    if (fetchedSlots) {
      allSlots = fetchedSlots;
    }

    const allBookedClasses = await this.bookClassesRepo.fetchAllBookedClasses();

    return this.computeAvailableTimes({
      allSlots,
      allBookedClasses,
      startDate,
      endDate,
      selectedSlots,
      assignedTeacherId,
      strategies: this.strategies,
    });
  }

  private validateParams(params: GetAvailableHoursParams): void {
    if (!params.email) {
      throw new Error("Email is required");
    }
  }

  private async fetchSlots(
    teacherId: number | undefined,
    isRecurrentSchedule: boolean
  ): Promise<AvailableSlot[] | null> {
    if (teacherId) {
      return isRecurrentSchedule
        ? this.availableHoursRepo.fetchRecurringByTeacherId(teacherId)
        : this.availableHoursRepo.fetchByTeacherId(teacherId);
    } else {
      return isRecurrentSchedule
        ? this.availableHoursRepo.fetchRecurringSlots()
        : this.availableHoursRepo.fetchAll();
    }
  }

  private computeAvailableTimes(params: ComputeAvailableTimesParams): number[] {
    const {
      allSlots,
      allBookedClasses,
      startDate,
      endDate,
      selectedSlots,
      assignedTeacherId,
      strategies,
    } = params;

    const lockedTeacherIds = new Set<number>();
    const availableDateTimes: Date[] = [];
    const dailyRange = this.generateRange(startDate, endDate, RangeUnit.Day);

    for (const slot of allSlots) {
      const hourlyIncrements = this.generateRange(
        slot.startTime,
        slot.endTime,
        RangeUnit.Hour
      );
      for (const currentDay of dailyRange) {
        for (const hourSlot of hourlyIncrements) {
          const dateTime = new Date(currentDay);
          dateTime.setHours(
            hourSlot.getHours(),
            hourSlot.getMinutes(),
            hourSlot.getSeconds()
          );

          const context: SlotAvailibilityContext = {
            slot,
            dateTime,
            bookedClasses: allBookedClasses,
            selectedSlots,
            assignedTeacherId,
            lockedTeacherIds,
          };

          if (this.isAvailable(strategies, context)) {
            availableDateTimes.push(dateTime);
          }
        }
      }
    }

    return availableDateTimes.map((time) => compressTime(time.getTime()));
  }

  private isAvailable(
    strategies: SlotAvailibilityStrategy[],
    context: SlotAvailibilityContext
  ): boolean {
    return strategies.every((strategy) => strategy.isAvailable(context));
  }

  private generateRange(
    startDate: Date,
    endDate: Date,
    unit: RangeUnit
  ): Date[] {
    const days: Date[] = [];
    const currentDay = new Date(startDate);

    while (currentDay <= endDate) {
      days.push(new Date(currentDay));
      currentDay[`set${unit}`](currentDay[`get${unit}`]() + 1);
    }

    return days;
  }
}
