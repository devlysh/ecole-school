import { BookedClassesService } from "@domain/services/BookedClasses.service";
import { verifyAccessToken } from "@/lib/jwt";
import logger from "@/lib/logger";

export const GET = async () => {
  try {
    const decodedToken = await verifyAccessToken();
    const email = decodedToken?.email;

    const bookedClassesService = new BookedClassesService();
    const classes = await bookedClassesService.getBookedClassesByEmail(email);
    return Response.json(classes, { status: 200 });
  } catch (err) {
    logger.error(err, "Error fetching booked classes");
    return Response.json(
      { error: "Failed to fetch booked classes" },
      { status: 500 }
    );
  }
};

export const POST = async (request: Request) => {
  try {
    const decodedToken = await verifyAccessToken();
    const email = decodedToken?.email;

    if (!email) {
      return Response.json(
        { error: "Unauthorized - no email in token" },
        { status: 401 }
      );
    }

    const { dates, isRecurrent } = await request.json();

    if (!dates || !Array.isArray(dates) || dates.length === 0) {
      return Response.json(
        { error: "dates must be a non-empty array of ISO 8601 strings" },
        { status: 400 }
      );
    }

    const bookedClassesService = new BookedClassesService();

    const result = await bookedClassesService.bookClasses(
      email,
      dates.map((date) => new Date(date)),
      isRecurrent
    );

    return Response.json(result, { status: 201 });
  } catch (err) {
    logger.error(err, "Error creating booked classes");
    return Response.json(
      { error: "Failed to create booked class" },
      { status: 500 }
    );
  }
};
