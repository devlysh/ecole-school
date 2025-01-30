import logger from "@/lib/logger";
import { Settings } from "@/lib/types";
import { BookedClassesRepository } from "@domain/repositories/BookedClasses.repository";
import { UserRepository } from "@domain/repositories/User.repository";
import { User } from "@prisma/client";

interface SettingsServiceParams {
  userRepo?: UserRepository;
  bookedClassesRepo?: BookedClassesRepository;
}

export class SettingsService {
  private userRepo: UserRepository;
  private bookedClassesRepo: BookedClassesRepository;

  constructor(params?: SettingsServiceParams) {
    this.userRepo = params?.userRepo ?? new UserRepository();
    this.bookedClassesRepo =
      params?.bookedClassesRepo ?? new BookedClassesRepository();
  }

  public async getSettings(email: string) {
    const user = await this.userRepo.findStudentByEmail(email);

    logger.debug({ user }, "User");

    const settings = {
      email: user?.email,
      name: user?.name,
    };

    return settings;
  }

  public async updateSettings(email: string, settings: Partial<Settings>) {
    const user = await this.userRepo.findStudentByEmail(email);

    if (!user) {
      throw new Error("User not found");
    }

    if (settings.name) {
      await this.setName(user, settings.name);
    }

    return {
      email: user.email,
      name: settings.name,
    };
  }

  public async setNameByEmail(email: string, name: string) {
    const user = await this.userRepo.findStudentByEmail(email);

    if (!user) {
      throw new Error("User not found");
    }

    await this.userRepo.updateName(user.id, name);
  }

  public async resetAssignedTeacher(email: string) {
    const user = await this.userRepo.findStudentByEmail(email);

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.student) {
      throw new Error("User is not a student");
    }

    if (!user.student.assignedTeacherId) {
      throw new Error("User has no assigned teacher");
    }

    await this.userRepo.resetAssignedTeacher(user.id, user.student);
    await this.bookedClassesRepo.deleteAllBookedClassesByStudentId(user.id);
  }

  private async setName(user: User, name: string) {
    await this.userRepo.updateName(user.id, name);
  }
}
