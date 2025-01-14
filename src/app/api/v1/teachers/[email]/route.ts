import { verifyAccessToken } from "@/lib/jwt";
import logger from "@/lib/logger";
import { AccessTokenPayload } from "@/lib/types";
import { TeacherRepository } from "@domain/repositories/Teacher.repository";
import { NextResponse } from "next/server";

export const GET = async (
  request: Request,
  { params }: { params: { email: string } }
) => {
  try {
    await verifyAndDecodeToken();
    const teachersRepository = new TeacherRepository();
    const teacher = await teachersRepository.findTeacherByEmail(params.email);
    return NextResponse.json(teacher);
  } catch (err) {
    logger.error({ err }, "Error fetching teacher by email");
    return NextResponse.json(
      { error: "Failed to fetch teachers" },
      { status: 500 }
    );
  }
};

const verifyAndDecodeToken = async (): Promise<AccessTokenPayload> => {
  try {
    return (await verifyAccessToken()) as AccessTokenPayload;
  } catch (err) {
    logger.error(err, "Error verifying access token");
    throw new Error("Unauthorized");
  }
};
