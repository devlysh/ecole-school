import logger from "@/lib/logger";
import { Settings } from "@/lib/types";
import { BookedClassesRepository } from "@domain/repositories/BookedClasses.repository";
import { UserRepository } from "@domain/repositories/User.repository";
import { User } from "@prisma/client";
import { logError } from "@/lib/errorUtils";

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
    try {
      const user = await this.userRepo.findStudentByEmail(email);

      if (!user) {
        throw new Error("User not found");
      }

      logger.debug({ user }, "User");

      const settings = {
        email: user.email,
        name: user.name,
      };

      return settings;
    } catch (err: unknown) {
      logError(err, "Error in getSettings", { email });
      throw err;
    }
  }

  public async updateSettings(email: string, settings: Partial<Settings>) {
    try {
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
    } catch (err: unknown) {
      logError(err, "Error in updateSettings", { email, settings });
      throw err;
    }
  }

  public async setNameByEmail(email: string, name: string) {
    try {
      const user = await this.userRepo.findStudentByEmail(email);

      if (!user) {
        throw new Error("User not found");
      }

      await this.userRepo.updateName(user.id, name);
    } catch (err: unknown) {
      logError(err, "Error in setNameByEmail", { email, name });
      throw err;
    }
  }

  public async resetAssignedTeacher(email: string) {
    try {
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
    } catch (err: unknown) {
      logError(err, "Error in resetAssignedTeacher", { email });
      throw err;
    }
  }

  private async setName(user: User, name: string) {
    await this.userRepo.updateName(user.id, name);
  }
}
