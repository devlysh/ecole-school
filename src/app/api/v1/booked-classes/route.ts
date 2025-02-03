import { BookedClassesService } from "@domain/services/BookedClasses.service";
import { verifyAccessToken } from "@/lib/jwt";
import logger from "@/lib/logger";
import { handleErrorResponse } from "@/lib/errorUtils";
import { EmailIsMissingError } from "@/lib/errors";
import { StudentClass, TeacherClass, RoleName } from "@/lib/types";
import { UsersRepository } from "@domain/repositories/Users.repository";

interface GetBookedClassesResponse {
  student?: StudentClass[];
  teacher?: TeacherClass[];
}

export const GET = async () => {
  try {
    const decodedToken = await verifyAccessToken();
    const email = decodedToken?.email;

    if (!email) {
      throw new EmailIsMissingError();
    }

    const isStudent = decodedToken.roles.includes(RoleName.STUDENT);
    const isTeacher = decodedToken.roles.includes(RoleName.TEACHER);

    const bookedClassesService = new BookedClassesService();
    const usersRepository = new UsersRepository();

    const classes: GetBookedClassesResponse = {};

    if (isStudent) {
      classes.student =
        await bookedClassesService.getStudentBookedClassesByEmail(email);
    }

    if (isTeacher) {
      const teacherClasses =
        await bookedClassesService.getTeacherBookedClassesByEmail(email);

      const studentIds = new Set(teacherClasses.map((c) => c.studentId));

      const students = await usersRepository.findStudentsByIds(
        Array.from(studentIds)
      );

      classes.teacher = teacherClasses.map((teacherClass) => ({
        id: teacherClass.id,
        date: teacherClass.date,
        recurring: teacherClass.recurring,
        studentName:
          students.find((s) => s.id === teacherClass.studentId)?.name ?? "",
      }));
    }

    return Response.json(classes, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof EmailIsMissingError) {
      return handleErrorResponse(err, 401);
    }
    logger.error(err, "Error fetching booked classes");
    return handleErrorResponse(
      new Error("Failed to fetch booked classes"),
      500
    );
  }
};

export const POST = async (request: Request) => {
  try {
    const decodedToken = await verifyAccessToken();
    const email = decodedToken?.email;
    if (!email) {
      throw new EmailIsMissingError();
    }

    const { dates, isRecurrent } = await request.json();

    if (!dates || !Array.isArray(dates) || dates.length === 0) {
      return handleErrorResponse(
        new Error("Dates must be a non-empty array of ISO 8601 strings"),
        400
      );
    }

    const bookedClassesService = new BookedClassesService();

    const result = await bookedClassesService.bookClasses(
      email,
      dates.map((date) => new Date(date)),
      isRecurrent
    );

    return Response.json(result, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof EmailIsMissingError) {
      return handleErrorResponse(err, 401);
    }
    logger.error(err, "Error creating booked classes");
    return handleErrorResponse(new Error("Failed to create booked class"), 500);
  }
};

export const DELETE = async () => {
  try {
    const decodedToken = await verifyAccessToken();
    const email = decodedToken?.email;
    if (!email) {
      throw new EmailIsMissingError();
    }

    const bookedClassesService = new BookedClassesService();
    await bookedClassesService.deleteAllBookedClassesByEmail(email);
    return Response.json({ message: "Booked class deleted" }, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof EmailIsMissingError) {
      return handleErrorResponse(err, 401);
    }
    logger.error(err, "Error deleting booked classes");
    return handleErrorResponse(
      new Error("Failed to delete booked classes"),
      500
    );
  }
};
