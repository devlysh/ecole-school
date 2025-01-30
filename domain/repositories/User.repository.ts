import prisma from "@/lib/prisma";
import { RoleName } from "@/lib/types";
import { Role, Student, Teacher, User } from "@prisma/client";
import Stripe from "stripe";

export class UserRepository {
  public async upsertStudent(
    email: string,
    name: string,
    stripeCustomer: Stripe.Customer,
    language: string,
    quizAnswers: Record<string, string>
  ): Promise<User> {
    return await prisma.user.upsert({
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

  public async findTeachers(): Promise<User[]> {
    return await prisma.user.findMany({
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

  public async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  public async findByEmailWithRoles(
    email: string
  ): Promise<(User & { roles: { role: Role }[] }) | null> {
    return await prisma.user.findUnique({
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

  public async findStudentByEmail(
    email: string
  ): Promise<(User & { student: Student | null }) | null> {
    return prisma.user.findUnique({
      where: { email },
      include: {
        student: true,
      },
    });
  }

  public async findTeacherByEmail(
    email: string
  ): Promise<(User & { teacher: Teacher | null }) | null> {
    return await prisma.user.findUnique({
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

  public async updateName(id: number, name: string) {
    return await prisma.user.update({
      where: { id },
      data: { name },
    });
  }

  public async updatePassword(id: number, passwordHash: string) {
    await prisma.user.update({
      where: { id },
      data: {
        passwordHash,
        isActive: true,
      },
    });
  }

  public async resetAssignedTeacher(userId: number, student: Student) {
    if (!student.assignedTeacherId) {
      throw new Error("User has no assigned teacher");
    }

    return await prisma.student.update({
      where: { userId },
      data: {
        assignedTeacherId: null,
        exTeacherIds: [...student.exTeacherIds, student.assignedTeacherId],
      },
    });
  }
}
