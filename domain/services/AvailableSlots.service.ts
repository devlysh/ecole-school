import { AvailableSlotsRepository } from "../repositories/AvailableSlots.repository";
import { BookedClassesRepository } from "../repositories/BookedClasses.repository";
import { AvailableSlot, Language } from "@prisma/client";
import { UsersRepository } from "../repositories/Users.repository";
import { compressTime } from "@/lib/utils";
import {
  SlotAvailibilityContext,
  SlotAvailibilityStrategy,
} from "@domain/strategies/SlotAvailibilityStrategy.interface";
import { IsSlotAvailableStrategy } from "@domain/strategies/IsSlotAvailable.strategy";
import { IsSlotBookedStrategy } from "@domain/strategies/IsSlotBooked.strategy";
import { HandleSelectedSlotsStrategy } from "@domain/strategies/HandleSelectedSlots.strategy";
import { IsAssignedTeacherStrategy } from "@domain/strategies/IsAssignedTeacher.strategy";
import { IsOnVacationStrategy } from "@domain/strategies/IsOnVacation.strategy";
import { VacationsRepository } from "@domain/repositories/Vacations.repostiroy";
import {
  IsAtPermittedTimeStrategy,
  PermittedTimeDirection,
  PermittedTimeUnit,
} from "@domain/strategies/IsAtPermittedTime.strategy";
import { IsSlotRecurringStrategy } from "@domain/strategies/IsSlotRecurring.strategy";
import { IsExTeachersSlotStrategy } from "@domain/strategies/IsExTeachersSlot.strategy";
import { IsLanguageMatchingStrategy } from "@domain/strategies/IsLanguageMatching.strategy";

interface AvailableSlotsServiceParams {
  userRepo?: UsersRepository;
  availableSlotsRepo?: AvailableSlotsRepository;
  bookClassesRepo?: BookedClassesRepository;
  vacationsRepo?: VacationsRepository;
  strategies?: SlotAvailibilityStrategy[];
  config?: Config;
}

interface GetAvailableSlotsParams {
  startDate: Date;
  endDate: Date;
  isRecurrentSchedule: boolean;
  selectedSlots?: Date[];
  email: string;
}

enum RangeUnit {
  Day = "Date",
  Hour = "Hours",
}

interface Config {
  permittedTime: {
    duration: number;
    unit: PermittedTimeUnit;
    direction: PermittedTimeDirection;
    date: Date;
  };
}

export class AvailableSlotsService {
  private userRepo: UsersRepository;
  private availableSlotsRepo: AvailableSlotsRepository;
  private bookClassesRepo: BookedClassesRepository;
  private vacationsRepo: VacationsRepository;
  private strategies: SlotAvailibilityStrategy[];
  private config: Config;

  constructor(params?: AvailableSlotsServiceParams) {
    this.userRepo = params?.userRepo ?? new UsersRepository();
    this.availableSlotsRepo =
      params?.availableSlotsRepo ?? new AvailableSlotsRepository();
    this.bookClassesRepo =
      params?.bookClassesRepo ?? new BookedClassesRepository();
    this.vacationsRepo = params?.vacationsRepo ?? new VacationsRepository();
    this.config = params?.config ?? this.getDefaultConfig();
    this.strategies =
      params?.strategies ?? this.getDefaultStrategies(this.config);
  }

  public async getAvailableSlots(
    params: GetAvailableSlotsParams
  ): Promise<number[]> {
    this.validateParams(params);

    const { email, startDate, endDate, isRecurrentSchedule, selectedSlots } =
      params;

    const user = await this.userRepo.findStudentByEmail(email);
    const teachers = await this.userRepo.findAllTeachers();
    const assignedTeacherId = user?.student?.assignedTeacherId ?? undefined;
    const exTeacherIds = user?.student?.exTeacherIds ?? [];

    const availableSlots = await this.fetchSlots(
      isRecurrentSchedule,
      assignedTeacherId
    );

    if (!availableSlots) {
      return [];
    }

    const studentLanguages =
      user?.student?.studentLanguages?.map((l) => l.language) ?? [];

    const teachersLanguages = new Map<number, Language[]>();

    for (const teacher of teachers) {
      teachersLanguages.set(
        teacher.id,
        teacher.teacher?.languages.map((l) => l.language) ?? []
      );
    }

    const bookedClasses = await this.bookClassesRepo.findAll();
    const vacations = await this.vacationsRepo.findAll();

    const selectedTeacherIds =
      AvailableSlotsService.collectTeachersForSelectedSlots(
        availableSlots,
        selectedSlots ?? []
      );

    const availableDateTimes: Date[] = [];
    const dailyRange = this.generateDateRange(
      startDate,
      endDate,
      RangeUnit.Day
    );

    for (const slot of availableSlots) {
      const hourlyIncrements = this.generateDateRange(
        slot.startTime,
        slot.endTime,
        RangeUnit.Hour
      );

      for (const currentDay of dailyRange) {
        for (const hourSlot of hourlyIncrements) {
          const dateTime = AvailableSlotsService.createDateTime(
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
            exTeacherIds,
            teachersLanguages,
            studentLanguages,
          };

          if (this.isAvailable(this.strategies, context)) {
            availableDateTimes.push(dateTime);
          }
        }
      }
    }

    return availableDateTimes.map((time) => compressTime(time.getTime()));
  }

  public async isSlotAvailable(
    email: string,
    date: Date,
    assignedTeacherId?: number
  ): Promise<boolean> {
    const availableSlots = await this.fetchSlots(false);

    if (!availableSlots || !availableSlots.length) {
      return false;
    }

    const teachers = await this.userRepo.findAllTeachers();
    const user = await this.userRepo.findStudentByEmail(email);
    const bookedClasses = await this.bookClassesRepo.findAll();
    const vacations = await this.vacationsRepo.findAll();
    const studentLanguages =
      user?.student?.studentLanguages?.map((l) => l.language) ?? [];

    const teachersLanguages = new Map<number, Language[]>();

    for (const teacher of teachers) {
      teachersLanguages.set(
        teacher.id,
        teacher.teacher?.languages.map((l) => l.language) ?? []
      );
    }

    return availableSlots.some((slot) => {
      const context: SlotAvailibilityContext = {
        dateTime: date,
        slot,
        assignedTeacherId,
        bookedClasses,
        vacations,
        selectedSlots: [],
        selectedTeacherIds: new Set(),
        isRecurrentSchedule: false,
        studentLanguages,
        teachersLanguages,
      };
      return this.isAvailable(this.strategies, context);
    });
  }

  public static collectTeachersForSelectedSlots(
    availableSlots: AvailableSlot[],
    selectedSlots: Date[]
  ): Set<number> {
    if (!selectedSlots.length) return new Set<number>();

    const isSlotAvailableStrategy = new IsSlotAvailableStrategy();

    const teacherSlotsMap = availableSlots.reduce((acc, slot) => {
      if (!acc.has(slot.teacherId)) {
        acc.set(slot.teacherId, []);
      }
      acc.get(slot.teacherId)!.push(slot);
      return acc;
    }, new Map<number, AvailableSlot[]>());

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

    return new Set<number>(validTeacherIds);
  }

  private validateParams(params: GetAvailableSlotsParams): void {
    if (!params.email) {
      throw new Error("Email is required");
    }
  }

  private async fetchSlots(
    isRecurrentSchedule: boolean,
    assignedTeacherId?: number
  ): Promise<AvailableSlot[] | null> {
    if (assignedTeacherId) {
      return isRecurrentSchedule
        ? await this.availableSlotsRepo.findRecurringByTeacherId(
            assignedTeacherId
          )
        : await this.availableSlotsRepo.findByTeacherId(assignedTeacherId);
    } else {
      return isRecurrentSchedule
        ? await this.availableSlotsRepo.findRecurringSlots()
        : await this.availableSlotsRepo.findAll();
    }
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

  private generateDateRange(
    startDate: Date,
    endDate: Date,
    unit: RangeUnit
  ): Date[] {
    const range: Date[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      range.push(new Date(current));
      if (unit === RangeUnit.Day) {
        current.setDate(current.getDate() + 1);
      } else if (unit === RangeUnit.Hour) {
        current.setHours(current.getHours() + 1);
      }
    }

    return range;
  }

  private getDefaultConfig(): Config {
    return {
      permittedTime: {
        duration: 1,
        unit: PermittedTimeUnit.DAYS,
        direction: PermittedTimeDirection.AFTER,
        date: new Date(),
      },
    };
  }

  private getDefaultStrategies(config: Config): SlotAvailibilityStrategy[] {
    return [
      new IsAtPermittedTimeStrategy(
        config.permittedTime.duration,
        config.permittedTime.unit,
        config.permittedTime.direction,
        config.permittedTime.date
      ),
      new IsSlotAvailableStrategy(),
      new IsSlotBookedStrategy(),
      new HandleSelectedSlotsStrategy(),
      new IsOnVacationStrategy(),
      new IsExTeachersSlotStrategy(),
      new IsAssignedTeacherStrategy(),
      new IsSlotRecurringStrategy(),
      new IsLanguageMatchingStrategy(),
    ];
  }
}
