import prisma from "@/lib/prisma";
import { Student } from "@prisma/client";

export class StudentRepository {
  /**
   * Updates a student's assigned teacher.
   * @param studentId The student's userId (primary key in the Student model).
   * @param teacherId The teacher's userId to assign.
   *                  Pass null if unassigning a teacher, if your logic allows.
   */
  public async updateAssignedTeacher(
    studentId: number,
    teacherId: number | null
  ): Promise<Student> {
    // Use Prisma to update the student record
    return prisma.student.update({
      where: { userId: studentId },
      data: {
        assignedTeacherId: teacherId,
      },
    });
  }
}
