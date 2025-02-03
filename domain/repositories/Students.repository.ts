import prisma from "@/lib/prisma";
import { Student } from "@prisma/client";

export class StudentsRepository {
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
