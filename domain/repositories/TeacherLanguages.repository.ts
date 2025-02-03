export class TeacherLanguagesRepository {
  create(teacherId: number, languageId: number) {
    return prisma.teacherLanguage.create({
      data: { teacherId, languageId },
    });
  }

  findByTeacherId(teacherId: number) {
    return prisma.teacherLanguage.findMany({
      where: { teacherId },
    });
  }

  delete(teacherId: number, languageId: number) {
    return prisma.teacherLanguage.delete({
      where: { teacherId, languageId },
    });
  }
}
