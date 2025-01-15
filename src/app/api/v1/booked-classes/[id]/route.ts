import { BookedClassesService } from "@domain/services/booked-classes/BookedClassesService";
import { verifyAccessToken } from "@/lib/jwt";
import logger from "@/lib/logger";

export const DELETE = async (
  request: Request,
  { params }: { params: { id: string } }
) => {
  try {
    const decodedToken = await verifyAccessToken();
    const email = decodedToken?.email;

    if (!params.id) {
      return Response.json({ error: "Class ID is required" }, { status: 400 });
    }

    const bookedClassesService = new BookedClassesService();
    await bookedClassesService.deleteBookedClassById(email, Number(params.id));

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
