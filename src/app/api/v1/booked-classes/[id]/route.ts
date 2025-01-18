import { BookedClassesService } from "@domain/services/BookedClasses.service";
import { verifyAccessToken } from "@/lib/jwt";
import logger from "@/lib/logger";
import { NextRequest } from "next/server";
import { expandTime } from "@/lib/utils";

const handleErrorResponse = (message: string, status: number) => {
  return Response.json({ error: message }, { status });
};

export const DELETE = async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    if (!params.id) {
      return handleErrorResponse("Class ID is required", 400);
    }

    const dateParam = request.nextUrl.searchParams.get("date");
    if (!dateParam) {
      return handleErrorResponse("Date is required", 400);
    }

    const deleteFutureOccurencesParam = request.nextUrl.searchParams.get(
      "deleteFutureOccurences"
    );

    const decodedToken = await verifyAccessToken();
    const email = decodedToken?.email;
    if (!email) {
      return handleErrorResponse("Unauthorized", 401);
    }

    const id = Number(params.id);
    const compressedTime = Number(dateParam);
    const date = new Date(expandTime(compressedTime));
    const deleteFutureOccurences =
      deleteFutureOccurencesParam === "true" ? true : false;

    const bookedClassesService = new BookedClassesService();
    await bookedClassesService.deleteBookedClassById(
      email,
      id,
      date,
      deleteFutureOccurences
    );

    return Response.json(
      { message: "Class deleted successfully" },
      { status: 200 }
    );
  } catch (err) {
    logger.error(err, "Error deleting booked classes");
    return handleErrorResponse("Failed to delete booked class", 500);
  }
};

export const PUT = async (
  request: Request,
  { params }: { params: { id: string } }
) => {
  try {
    const body = await request.json();
    const id = Number(params.id);

    const decodedToken = await verifyAccessToken();
    const email = decodedToken?.email;
    if (!email) {
      return handleErrorResponse("Unauthorized", 401);
    }

    const bookedClassesService = new BookedClassesService();
    const response = await bookedClassesService.rescheduleBookedClass(
      email,
      id,
      new Date(body.oldDate),
      new Date(body.newDate)
    );

    return Response.json(response, { status: 200 });
  } catch (err) {
    logger.error(err, "Error rescheduling booked classes");
    return handleErrorResponse("Failed to reschedule booked class", 500);
  }
};
