import { Settings } from "@/lib/types";
import { BookedClassesRepository } from "@domain/repositories/BookedClasses.repository";
import { UsersRepository } from "@domain/repositories/Users.repository";
import { User } from "@prisma/client";
import { UserNotFoundError } from "@/lib/errors";
import { UnauthorizedError } from "@/lib/errors";
import { JsonObject } from "@prisma/client/runtime/library";
import { StudentsRepository } from "@domain/repositories/Students.repository";

interface SettingsServiceParams {
  userRepo?: UsersRepository;
  studentsRepo?: StudentsRepository;
  bookedClassesRepo?: BookedClassesRepository;
}

export class SettingsService {
  private userRepo: UsersRepository;
  private studentsRepo: StudentsRepository;
  private bookedClassesRepo: BookedClassesRepository;

  constructor(params?: SettingsServiceParams) {
    this.userRepo = params?.userRepo ?? new UsersRepository();
    this.studentsRepo = params?.studentsRepo ?? new StudentsRepository();
    this.bookedClassesRepo =
      params?.bookedClassesRepo ?? new BookedClassesRepository();
  }

  public async getSettings(email: string) {
    const user = await this.userRepo.findStudentByEmail(email);

    if (!user) {
      throw new UserNotFoundError();
    }

    const userSettings = user.settings as JsonObject;
    const languages = user.student?.studentLanguages;

    const settings = {
      email: user.email,
      name: user.name,
      languages: languages?.map((language) => language.language.code) ?? [],
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

    await this.studentsRepo.resetAssignedTeacher(user.id, user.student);
    await this.bookedClassesRepo.deleteAllByStudentId(user.id);
  }

  private async setName(user: Omit<User, "passwordHash">, name: string) {
    await this.userRepo.updateName(user.id, name);
  }
}
