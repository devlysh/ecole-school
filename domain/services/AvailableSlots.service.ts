import { AvailableSlotsRepository } from "../repositories/AvailableSlots.repository";
import { BookedClassesRepository } from "../repositories/BookedClasses.repository";
import { AvailableSlot, BookedClass, Language, Vacation } from "@prisma/client";
import { UsersRepository } from "../repositories/Users.repository";
import { compressTime } from "@/lib/utils";
import {
  SlotAvailibilityContext,
  SlotAvailibilityStrategy,
} from "@domain/strategies/SlotAvailibilityStrategy.interface";
import { AvailableSlotStrategy } from "@domain/strategies/AvailableSlot.strategy";
import { BookedSlotStrategy } from "@domain/strategies/BookedSlot.strategy";
import { SelectedSlotsStrategy } from "@domain/strategies/SelectedSlots.strategy";
import { AssignedTeacherStrategy } from "@domain/strategies/AssignedTeacher.strategy";
import { VacationStrategy } from "@domain/strategies/Vacation.strategy";
import { VacationsRepository } from "@domain/repositories/Vacations.repostiroy";
import {
  PermittedTimeStrategy,
  PermittedTimeDirection,
  PermittedTimeUnit,
} from "@domain/strategies/PermittedTime.strategy";
import { RecurringSlotStrategy } from "@domain/strategies/RecurringSlot.strategy";
import { TeachersSlotStrategy } from "@domain/strategies/TeachersSlot.strategy";
import { LanguageMatchingStrategy } from "@domain/strategies/LanguageMatching.strategy";

export interface AvailableSlotsServiceParams {
  userRepo?: UsersRepository;
  availableSlotsRepo?: AvailableSlotsRepository;
  bookClassesRepo?: BookedClassesRepository;
  vacationsRepo?: VacationsRepository;
  strategies?: SlotAvailibilityStrategy[];
  config?: Config;
}

export interface GetAvailableSlotsParams {
  startDate: Date;
  endDate: Date;
  isRecurrentSchedule: boolean;
  selectedSlots?: Date[];
  email: string;
}

export enum RangeUnit {
  Day = "Date",
  Hour = "Hours",
}

export interface Config {
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
    const {
      email,
      startDate,
      endDate,
      isRecurrentSchedule,
      selectedSlots = [],
    } = params;

    const strategyData = await this.loadStrategyData(email);
    if (!strategyData) return [];

    const availableSlots = await this.fetchSlots(
      isRecurrentSchedule,
      strategyData.assignedTeacherId
    );
    if (!availableSlots) return [];

    const selectedTeacherIds =
      AvailableSlotsService.collectTeachersForSelectedSlots(
        availableSlots,
        selectedSlots
      );

    const dailyRange = this.generateDateRange(
      startDate,
      endDate,
      RangeUnit.Day
    );
    const availableDateTimes: Date[] = [];

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
            bookedClasses: strategyData.bookedClasses,
            selectedSlots,
            assignedTeacherId: strategyData.assignedTeacherId,
            selectedTeacherIds,
            vacations: strategyData.vacations,
            isRecurrentSchedule,
            exTeacherIds: strategyData.exTeacherIds,
            teachersLanguages: strategyData.teachersLanguages,
            studentLanguages: strategyData.studentLanguages,
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
    const strategyData = await this.loadStrategyData(email);
    if (!strategyData) return false;

    const effectiveAssignedTeacherId =
      assignedTeacherId ?? strategyData.assignedTeacherId;
    const availableSlots = await this.fetchSlots(
      false,
      effectiveAssignedTeacherId
    );
    if (!availableSlots || availableSlots.length === 0) return false;

    return availableSlots.some((slot) => {
      const context: SlotAvailibilityContext = {
        slot,
        dateTime: date,
        bookedClasses: strategyData.bookedClasses,
        vacations: strategyData.vacations,
        selectedSlots: [],
        selectedTeacherIds: new Set<number>(),
        isRecurrentSchedule: false,
        assignedTeacherId: effectiveAssignedTeacherId,
        studentLanguages: strategyData.studentLanguages,
        teachersLanguages: strategyData.teachersLanguages,
      };

      return this.isAvailable(this.strategies, context);
    });
  }

  public static collectTeachersForSelectedSlots(
    availableSlots: AvailableSlot[],
    selectedSlots: Date[]
  ): Set<number> {
    if (selectedSlots.length === 0) return new Set<number>();
    const isSlotAvailStrategy = new AvailableSlotStrategy();

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
            isSlotAvailStrategy.isAvailable({ slot, dateTime: selectedSlot })
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

  private getTeachersLanguagesMap(
    teachers: {
      id: number;
      teacher?: {
        languages?: { language: Language }[];
      } | null;
    }[]
  ): Map<number, Language[]> {
    const languagesMap = new Map<number, Language[]>();
    teachers.forEach((teacher) => {
      languagesMap.set(
        teacher.id,
        teacher.teacher?.languages?.map(({ language }) => language) ?? []
      );
    });
    return languagesMap;
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
      new PermittedTimeStrategy(
        config.permittedTime.duration,
        config.permittedTime.unit,
        config.permittedTime.direction,
        config.permittedTime.date
      ),
      new AvailableSlotStrategy(),
      new BookedSlotStrategy(),
      new SelectedSlotsStrategy(),
      new VacationStrategy(),
      new TeachersSlotStrategy(),
      new AssignedTeacherStrategy(),
      new RecurringSlotStrategy(),
      new LanguageMatchingStrategy(),
    ];
  }

  private async loadStrategyData(email: string): Promise<{
    assignedTeacherId?: number;
    exTeacherIds: number[];
    studentLanguages: Language[];
    bookedClasses: BookedClass[];
    vacations: Vacation[];
    teachersLanguages: Map<number, Language[]>;
  } | null> {
    const user = await this.userRepo.findStudentByEmail(email);
    if (!user) return null;

    const [teachers, bookedClasses, vacations] = await Promise.all([
      this.userRepo.findAllTeachers(),
      this.bookClassesRepo.findAll(),
      this.vacationsRepo.findAll(),
    ]);

    const assignedTeacherId = user.student?.assignedTeacherId ?? undefined;
    const exTeacherIds = user.student?.exTeacherIds ?? [];
    const studentLanguages =
      user.student?.studentLanguages?.map((l) => l.language) ?? [];
    const teachersLanguages = this.getTeachersLanguagesMap(teachers);

    return {
      assignedTeacherId,
      exTeacherIds,
      studentLanguages,
      bookedClasses,
      vacations,
      teachersLanguages,
    };
  }
}
