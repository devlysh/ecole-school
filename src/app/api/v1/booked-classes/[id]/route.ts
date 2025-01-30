import { BookedClassesService } from "@domain/services/BookedClasses.service";
import { verifyAccessToken } from "@/lib/jwt";
import logger from "@/lib/logger";
import { NextRequest } from "next/server";
import { expandTime } from "@/lib/utils";
import {
  BadRequestError,
  EmailIsMissingError,
  SlotIsNotAvailableError,
} from "@/lib/errors";
import { handleErrorResponse } from "@/lib/errorUtils";

export const DELETE = async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const dateParam = request.nextUrl.searchParams.get("date");
    const deleteFutureOccurencesParam = request.nextUrl.searchParams.get(
      "deleteFutureOccurences"
    );

    const decodedToken = await verifyAccessToken();
    const email = decodedToken?.email;

    if (!params.id) {
      throw new BadRequestError("Class ID is required");
    }

    if (!dateParam) {
      throw new BadRequestError("Date is required");
    }

    if (!deleteFutureOccurencesParam) {
      throw new BadRequestError("Delete future occurences is required");
    }

    if (!email) {
      throw new EmailIsMissingError();
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
  } catch (err: unknown) {
    if (err instanceof EmailIsMissingError) {
      return handleErrorResponse(err, 401);
    } else if (err instanceof BadRequestError) {
      return handleErrorResponse(err, 400, {
        ...err.metadata,
      });
    }
    logger.error(err, "Error deleting booked classes");
    return handleErrorResponse(new Error("Failed to delete booked class"), 500);
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
      throw new EmailIsMissingError();
    }

    const bookedClassesService = new BookedClassesService();
    const response = await bookedClassesService.rescheduleBookedClass(
      email,
      id,
      new Date(body.oldDate),
      new Date(body.newDate)
    );

    return Response.json(response, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof EmailIsMissingError) {
      return handleErrorResponse(err, 401);
    } else if (err instanceof SlotIsNotAvailableError) {
      return handleErrorResponse(err, 400);
    }
    return handleErrorResponse(
      new Error("Failed to reschedule booked class"),
      500
    );
  }
};
