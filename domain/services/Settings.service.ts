import { Settings } from "@/lib/types";
import { BookedClassesRepository } from "@domain/repositories/BookedClasses.repository";
import { UserRepository } from "@domain/repositories/User.repository";
import { User } from "@prisma/client";
import { UserNotFoundError } from "@/lib/errors";
import { UnauthorizedError } from "@/lib/errors";
import { JsonObject } from "@prisma/client/runtime/library";

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

    if (!user) {
      throw new UserNotFoundError();
    }

    const userSettings = user.settings as JsonObject;

    const settings = {
      email: user.email,
      name: user.name,
      language: userSettings.language ?? null,
      quizAnswers: userSettings.quizAnswers ?? null,
    };

    return settings;
  }

  public async updateSettings(email: string, settings: Partial<Settings>) {
    const user = await this.userRepo.findStudentByEmail(email);

    if (!user) {
      throw new UserNotFoundError();
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
      throw new UserNotFoundError();
    }

    await this.userRepo.updateName(user.id, name);
  }

  public async resetAssignedTeacher(email: string) {
    const user = await this.userRepo.findStudentByEmail(email);

    if (!user) {
      throw new UserNotFoundError();
    }

    if (!user.student) {
      throw new UnauthorizedError("User is not a student");
    }

    if (!user.student.assignedTeacherId) {
      throw new UnauthorizedError("User has no assigned teacher");
    }

    await this.userRepo.resetAssignedTeacher(user.id, user.student);
    await this.bookedClassesRepo.deleteAllBookedClassesByStudentId(user.id);
  }

  private async setName(user: User, name: string) {
    await this.userRepo.updateName(user.id, name);
  }
}
