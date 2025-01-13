import { NextResponse } from "next/server";
import { BookedClassesService } from "@domain/services/booked-classes/BookedClassesService";
import { verifyAccessToken } from "@/lib/jwt";
import logger from "@/lib/logger";

export const DELETE = async ({ params }: { params: { id: string } }) => {
  try {
    const decodedToken = await verifyAccessToken();
    const email = decodedToken?.email;

    if (!params.id) {
      return NextResponse.json(
        { error: "Class ID is required" },
        { status: 400 }
      );
    }

    const bookedClassesService = new BookedClassesService();
    await bookedClassesService.deleteBookedClassById(email, Number(params.id));

    return NextResponse.json(
      { message: "Class deleted successfully" },
      { status: 200 }
    );
  } catch (err) {
    logger.error(err, "Error deleting booked classes");
    return NextResponse.json(
      { error: "Failed to delete booked class" },
      { status: 500 }
    );
  }
};
