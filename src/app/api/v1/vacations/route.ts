import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import logger from "@/lib/logger";
import { verifyAccessToken } from "@/lib/jwt";

// Retrieves vacations for a given teacher email
export const GET = async (request: Request) => {
  try {
    // Verify the access token
    const decodedToken = await verifyAccessToken();
    const requesterEmail = decodedToken?.email;

    if (!requesterEmail) {
      return NextResponse.json(
        { error: "Unauthorized - no email in token" },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const email = url.searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email query parameter is required" },
        { status: 400 }
      );
    }

    // Find the teacher by email
    const teacher = await prisma.user.findUnique({
      where: { email },
      include: {
        teacher: true,
      },
    });

    if (!teacher || !teacher.teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // Fetch vacations for the teacher
    const vacations = await prisma.vacation.findMany({
      where: {
        teacherId: teacher.teacher.userId,
      },
    });

    return NextResponse.json(vacations, { status: 200 });
  } catch (err) {
    logger.error("Error fetching vacations:", err);
    return NextResponse.json(
      { error: "Failed to fetch vacations" },
      { status: 500 }
    );
  }
};

// Deletes a specific vacation by ID
export const DELETE = async (request: Request) => {
  try {
    const decodedToken = await verifyAccessToken();
    const requesterEmail = decodedToken?.email;

    if (!requesterEmail) {
      return NextResponse.json(
        { error: "Unauthorized - no email in token" },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const vacationId = url.searchParams.get("vacationId");
    const email = url.searchParams.get("email");

    if (!vacationId || !email) {
      return NextResponse.json(
        { error: "vacationId and email query parameters are required" },
        { status: 400 }
      );
    }

    // Find teacher
    const teacher = await prisma.user.findUnique({
      where: { email },
      include: {
        teacher: true,
      },
    });

    if (!teacher || !teacher.teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    const teacherId = teacher.teacher.userId;

    // Ensure the vacation belongs to the same teacher
    const vacation = await prisma.vacation.findUnique({
      where: { id: Number(vacationId) },
    });

    if (!vacation || vacation.teacherId !== teacherId) {
      return NextResponse.json(
        { error: "Vacation not found or not yours" },
        { status: 404 }
      );
    }

    // Delete the vacation
    await prisma.vacation.delete({
      where: { id: vacation.id },
    });

    return NextResponse.json({ message: "Vacation deleted" }, { status: 200 });
  } catch (err) {
    logger.error("Error deleting vacation:", err);
    return NextResponse.json(
      { error: "Failed to delete vacation" },
      { status: 500 }
    );
  }
};
