import { AvailableSlotsRepository } from "../repositories/AvailableSlots.repository";
import { BookedClassesRepository } from "../repositories/BookedClasses.repository";
import { AvailableSlot, BookedClass, Vacation } from "@prisma/client";
import { UserRepository } from "../repositories/User.repository";
import { compressTime } from "@/lib/utils";
import {
  SlotAvailibilityContext,
  SlotAvailibilityStrategy,
} from "@domain/strategies/SlotAvailibilityStrategy.interface";
import { IsSlotAvailableStrategy } from "@domain/strategies/IsSlotAvailable.strategy";
import { IsSlotBookedStrategy } from "@domain/strategies/IsSlotBooked.strategy";
import { HandleSelectedSlotsStrategy } from "@domain/strategies/HandleSelectedSlotsStrategy.strategy";
import { IsAssignedTeacherStrategy } from "@domain/strategies/IsAssignedTeacher.strategy";
import { IsOnVacationStrategy } from "@domain/strategies/IsOnVacation.strategy";
import { VacationsRepository } from "@domain/repositories/Vacations.repostiroy";
import {
  IsAtPermittedTimeStrategy,
  PermittedTimeDirection,
  PermittedTimeUnit,
} from "@domain/strategies/IsAtPermittedTime.strategy";
import { IsSlotRecurringStrategy } from "@domain/strategies/IsSlotRecurring.strategy";

interface GetAvailableHoursParams {
  startDate: Date;
  endDate: Date;
  isRecurrentSchedule: boolean;
  selectedSlots?: Date[];
  email: string;
}

interface ComputeAvailableTimesParams {
  availableSlots: AvailableSlot[];
  bookedClasses: BookedClass[];
  vacations: Vacation[];
  startDate: Date;
  endDate: Date;
  selectedSlots?: Date[];
  assignedTeacherId?: number;
  strategies: SlotAvailibilityStrategy[];
  isRecurrentSchedule?: boolean;
}

enum RangeUnit {
  Day = "Date",
  Hour = "Hours",
}

export class AvailableHoursService {
  private userRepo: UserRepository;
  private availableHoursRepo: AvailableSlotsRepository;
  private bookClassesRepo: BookedClassesRepository;
  private vacationsRepo: VacationsRepository;
  private strategies: SlotAvailibilityStrategy[];

  constructor(
    userRepo?: UserRepository,
    availableHoursRepo?: AvailableSlotsRepository,
    bookClassesRepo?: BookedClassesRepository,
    vacationsRepo?: VacationsRepository,
    strategies?: SlotAvailibilityStrategy[]
  ) {
    this.userRepo = userRepo || new UserRepository();
    this.availableHoursRepo =
      availableHoursRepo || new AvailableSlotsRepository();
    this.bookClassesRepo = bookClassesRepo || new BookedClassesRepository();
    this.vacationsRepo = vacationsRepo || new VacationsRepository();
    this.strategies = strategies || this.defaultStrategies();
  }

  private defaultStrategies(): SlotAvailibilityStrategy[] {
    return [
      new IsSlotAvailableStrategy(),
      new IsSlotBookedStrategy(),
      new HandleSelectedSlotsStrategy(),
      new IsAssignedTeacherStrategy(),
      new IsOnVacationStrategy(),
      new IsAtPermittedTimeStrategy(
        1,
        PermittedTimeUnit.DAYS,
        PermittedTimeDirection.AFTER,
        new Date()
      ),
      new IsSlotRecurringStrategy(),
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

    const availableSlots = await this.fetchSlots(
      assignedTeacherId,
      isRecurrentSchedule
    );

    if (!availableSlots) {
      return [];
    }

    const bookedClasses = await this.bookClassesRepo.fetchAllBookedClasses();
    const vacations = await this.vacationsRepo.fetchAllVacations();

    return this.computeAvailableTimes({
      availableSlots,
      bookedClasses,
      startDate,
      endDate,
      selectedSlots,
      assignedTeacherId,
      vacations,
      strategies: this.strategies,
      isRecurrentSchedule,
    });
  }

  public static collectTeachersForSelectedSlots(
    availableSlots: AvailableSlot[],
    selectedSlots: Date[]
  ): Set<number> {
    // If there are no selected slots, return an empty set
    if (!selectedSlots.length) return new Set<number>();

    const isSlotAvailableStrategy = new IsSlotAvailableStrategy();

    // 1. Group the available slots by teacherId
    const teacherSlotsMap = availableSlots.reduce((acc, slot) => {
      if (!acc.has(slot.teacherId)) {
        acc.set(slot.teacherId, []);
      }
      acc.get(slot.teacherId)!.push(slot);
      return acc;
    }, new Map<number, AvailableSlot[]>());

    // 2. For each teacher, check if *every* selectedSlot is matched
    //    by at least one slot from that teacher (via the strategy).
    const validTeacherIds = Array.from(teacherSlotsMap.entries())
      .filter(([, slots]) =>
        selectedSlots.every((selectedSlot) =>
          slots.some((slot) =>
            isSlotAvailableStrategy.isAvailable({
              slot,
              dateTime: selectedSlot,
            })
          )
        )
      )
      .map(([teacherId]) => teacherId);

    // Return that set of teacherIds
    return new Set<number>(validTeacherIds);
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
      availableSlots,
      bookedClasses,
      startDate,
      endDate,
      selectedSlots,
      assignedTeacherId,
      vacations,
      strategies,
      isRecurrentSchedule,
    } = params;

    const selectedTeacherIds =
      AvailableHoursService.collectTeachersForSelectedSlots(
        availableSlots,
        selectedSlots ?? []
      );

    const availableDateTimes: Date[] = [];
    const dailyRange = this.generateRange(startDate, endDate, RangeUnit.Day);

    for (const slot of availableSlots) {
      const hourlyIncrements = this.generateRange(
        slot.startTime,
        slot.endTime,
        RangeUnit.Hour
      );

      for (const currentDay of dailyRange) {
        for (const hourSlot of hourlyIncrements) {
          const dateTime = AvailableHoursService.createDateTime(
            currentDay,
            hourSlot
          );

          const context: SlotAvailibilityContext = {
            slot,
            dateTime,
            bookedClasses,
            selectedSlots,
            assignedTeacherId,
            selectedTeacherIds,
            vacations,
            isRecurrentSchedule,
          };

          if (this.isAvailable(strategies, context)) {
            availableDateTimes.push(dateTime);
          }
        }
      }
    }

    return availableDateTimes.map((time) => compressTime(time.getTime()));
  }

  private static createDateTime(currentDay: Date, hourSlot: Date): Date {
    const dateTime = new Date(currentDay);
    dateTime.setHours(
      hourSlot.getHours(),
      hourSlot.getMinutes(),
      hourSlot.getSeconds()
    );
    return dateTime;
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
