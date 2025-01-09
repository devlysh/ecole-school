import { NextResponse } from "next/server";
import { BookClassesService } from "@domain/book-classes/BookClassesService";
import { verifyAccessToken } from "@/lib/jwt";
import logger from "@/lib/logger";

export const POST = async (request: Request) => {
  try {
    const decodedToken = await verifyAccessToken();
    const email = decodedToken?.email;

    if (!email) {
      return NextResponse.json(
        { error: "Unauthorized - no email in token" },
        { status: 401 }
      );
    }

    const { dates, isFixedSchedule } = await request.json();

    if (!dates || !Array.isArray(dates) || dates.length === 0) {
      return NextResponse.json(
        { error: "dates must be a non-empty array of ISO 8601 strings" },
        { status: 400 }
      );
    }

    const result = await BookClassesService.bookClasses(
      email,
      dates,
      isFixedSchedule
    );

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    logger.error(err, "Error creating booked classes");
    return NextResponse.json(
      { error: "Failed to create booked class" },
      { status: 500 }
    );
  }
};
