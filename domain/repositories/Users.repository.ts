import prisma from "@/lib/prisma";
import { RoleName } from "@/lib/types";
import { EventInput } from "@fullcalendar/core/index.js";
import { Language, Role, Student, Teacher, User } from "@prisma/client";
import Stripe from "stripe";

export class UsersRepository {
  upsertStudent(
    email: string,
    name: string,
    stripeCustomer: Stripe.Customer,
    language: string,
    quizAnswers: Record<string, string>
  ): Promise<User> {
    return prisma.user.upsert({
      where: { email },
      create: {
        email,
        name,
        settings: {
          language,
          quizAnswers,
        },
        roles: {
          create: {
            role: {
              connect: {
                name: RoleName.STUDENT,
              },
            },
          },
        },
        student: {
          create: {
            stripeCustomerId: stripeCustomer.id,
            studentLanguages: {
              create: {
                language: {
                  connect: { code: language },
                },
              },
            },
          },
        },
      },
      update: {
        student: {
          upsert: {
            create: { stripeCustomerId: stripeCustomer.id },
            update: { stripeCustomerId: stripeCustomer.id },
          },
        },
      },
    });
  }

  findAllTeachers() {
    return prisma.user.findMany({
      where: {
        roles: {
          some: {
            role: {
              name: RoleName.TEACHER,
            },
          },
        },
        teacher: {
          isNot: null,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        passwordHash: true,
        dateJoined: true,
        isActive: true,
        settings: true,
        teacher: {
          select: {
            languages: {
              select: {
                language: true,
              },
            },
          },
        },
      },
    });
  }

  findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  findByEmailWithRoles(
    email: string
  ): Promise<(User & { roles: { role: Role }[] }) | null> {
    return prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  findStudentsByIds(
    ids: number[]
  ): Promise<(User & { student: Student | null })[]> {
    return prisma.user.findMany({
      where: { id: { in: ids } },
      include: { student: true },
    });
  }

  findStudentByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        settings: true,
        roles: true,
        dateJoined: true,
        isActive: true,
        student: {
          select: {
            userId: true,
            assignedTeacherId: true,
            exTeacherIds: true,
            stripeCustomerId: true,
            stripeSubscriptionId: true,
            studentLanguages: {
              select: {
                language: true,
              },
            },
          },
        },
      },
    });
  }

  findTeacherByEmail(
    email: string
  ): Promise<
    (Omit<User, "passwordHash"> & { teacher: Teacher | null }) | null
  > {
    return prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        dateJoined: true,
        isActive: true,
        settings: true,
        teacher: {
          include: {
            availableSlots: true,
            vacations: true,
            languages: {
              select: {
                language: {
                  select: {
                    name: true,
                    code: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  createTeacher(
    name: string,
    email: string,
    passwordHash: string,
    timeSlots: EventInput[],
    vacations: EventInput[],
    languages: Language[]
  ): Promise<User> {
    return prisma.user.create({
      data: {
        name: `${name}`,
        email,
        passwordHash,
        settings: {},
        teacher: {
          create: {
            availableSlots: {
              create: timeSlots.map((slot) => ({
                startTime: slot.start as string,
                endTime: slot.end as string,
                rrule: slot.rrule as string,
              })),
            },
            vacations: {
              create: vacations.map((slot) => ({
                date: new Date(slot.start as string).toISOString(),
              })),
            },
            languages: {
              create: languages.map((language) => ({
                language: {
                  connect: { code: language.code },
                },
              })),
            },
          },
        },
        roles: {
          create: {
            role: {
              connect: {
                name: "teacher",
              },
            },
          },
        },
      },
    });
  }

  updateTeacherByEmail(
    email: string,
    name: string,
    timezone: string,
    timeSlots: EventInput[],
    vacations: EventInput[],
    teacherLanguages: Language[]
  ): Promise<User> {
    return prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { email },
        data: {
          name,
          settings: { timezone },
          teacher: {
            update: {
              availableSlots: {
                deleteMany: {},
                create: timeSlots.map((slot) => ({
                  startTime: String(slot.start),
                  endTime: String(slot.end),
                  rrule: slot.extendedProps?.rrule,
                })),
              },
              vacations: {
                deleteMany: {},
                create: vacations.map((slot) => ({
                  date: new Date(slot.start as string).toISOString(),
                })),
              },
            },
          },
        },
        include: { teacher: true },
      });

      const teacherId = updatedUser.id;
      if (!teacherId) {
        throw new Error("Teacher record not found for user update");
      }

      await tx.teacherLanguage.deleteMany({ where: { teacherId } });

      const languages = await tx.language.findMany({
        where: { code: { in: teacherLanguages.map((l) => l.code) } },
        select: { id: true },
      });

      if (languages.length !== teacherLanguages.length) {
        throw new Error("One or more provided languages do not exist");
      }

      const teacherLanguageData = languages.map((langRec) => ({
        teacherId,
        languageId: langRec.id,
      }));

      await tx.teacherLanguage.createMany({
        data: teacherLanguageData,
      });

      return updatedUser;
    });
  }

  updateName(id: number, name: string) {
    return prisma.user.update({
      where: { id },
      data: { name },
    });
  }

  updatePassword(id: number, passwordHash: string) {
    return prisma.user.update({
      where: { id },
      data: {
        passwordHash,
        isActive: true,
      },
    });
  }
}
