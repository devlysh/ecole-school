import prisma from "@/lib/prisma";
import { RoleName } from "@/lib/types";
import { EventInput } from "@fullcalendar/core/index.js";
import { Role, Student, Teacher, User } from "@prisma/client";
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

  findTeachers(): Promise<User[]> {
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
        roles: {
          select: {
            role: {
              select: {
                name: true,
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

  findStudentByEmail(
    email: string
  ): Promise<(User & { student: Student | null }) | null> {
    return prisma.user.findUnique({
      where: { email },
      include: {
        student: true,
      },
    });
  }

  findTeacherByEmail(
    email: string
  ): Promise<(User & { teacher: Teacher | null }) | null> {
    return prisma.user.findUnique({
      where: { email },
      include: {
        teacher: {
          include: {
            availableSlots: true,
            vacations: true,
          },
        },
      },
    });
  }

  createTeacher(
    name: string,
    email: string,
    passwordHash: string,
    timeSlots: EventInput[]
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
    vacations: EventInput[]
  ) {
    return prisma.user.update({
      where: { email },
      data: {
        name: `${name}`,
        settings: { timezone },
        teacher: {
          update: {
            availableSlots: {
              deleteMany: {},
              create: timeSlots.map((slot) => ({
                startTime: slot.start as string,
                endTime: slot.end as string,
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
