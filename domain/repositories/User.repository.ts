import prisma from "@/lib/prisma";

export class UserRepository {
  public async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        student: { select: { assignedTeacherId: true } },
      },
    });
  }
}
