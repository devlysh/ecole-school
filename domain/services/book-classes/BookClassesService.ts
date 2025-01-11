import { parseISO } from "date-fns";
import { RRule } from "rrule";
import { AvailableSlot } from "@prisma/client";
import { BookedClassesRepository } from "../../repositories/BookedClassesRepository";
import { UserRepository } from "@domain/repositories/UserRepository";

export class BookClassesService {
  private userRepository: UserRepository;
  private bookedClassesRepository: BookedClassesRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.bookedClassesRepository = new BookedClassesRepository();
  }

  public async bookClasses(
    email: string,
    dates: string[],
    isRecurrentSchedule: boolean
  ): Promise<{ success: boolean }> {
    const user = await this.userRepository.findByEmail(email);

    if (!user?.student) {
      throw new Error("You must be a student to book classes");
    }

    return { success: true };
  }
}
