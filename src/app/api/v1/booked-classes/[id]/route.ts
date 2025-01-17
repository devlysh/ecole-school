import { BookedClassesService } from "@domain/services/BookedClasses.service";
import { verifyAccessToken } from "@/lib/jwt";
import logger from "@/lib/logger";
import { NextRequest } from "next/server";
import { expandTime } from "@/lib/utils";

export const DELETE = async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const decodedToken = await verifyAccessToken();
    const email = decodedToken?.email;
    if (!params.id) {
      return Response.json({ error: "Class ID is required" }, { status: 400 });
    }

    const id = Number(params.id);
    const dateParam = request.nextUrl.searchParams.get("date");

    if (!dateParam) {
      return Response.json({ error: "Date is required" }, { status: 400 });
    }

    const compressedTime = Number(dateParam);
    const date = new Date(expandTime(compressedTime));

    const bookedClassesService = new BookedClassesService();
    await bookedClassesService.deleteBookedClassById(email, id, date);

    return Response.json(
      { message: "Class deleted successfully" },
      { status: 200 }
    );
  } catch (err) {
    logger.error(err, "Error deleting booked classes");
    return Response.json(
      { error: "Failed to delete booked class" },
      { status: 500 }
    );
  }
};
