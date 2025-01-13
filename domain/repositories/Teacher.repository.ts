import prisma from "@/lib/prisma";
import { Teacher } from "@prisma/client";

/**
 * Example repository for getting all teachers from the DB.
 * Assumes you've got a Teacher model in your schema.
 */
export class TeacherRepository {
  public async findAllTeachers(): Promise<Teacher[]> {
    return prisma.teacher.findMany();
  }

  public async findTeacherById(userId: number): Promise<Teacher | null> {
    return prisma.teacher.findUnique({ where: { userId } });
  }
}
