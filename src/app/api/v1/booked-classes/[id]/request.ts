import logger from "@/lib/logger";

export const deleteBookedClass = async (classId: string) => {
  try {
    const response = await fetch(`/api/v1/booked-classes/${classId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete booked class");
    }
    return await response.json();
  } catch (err) {
    logger.error({ err, classId }, "Failed to delete booked class");
    throw new Error("Failed to delete booked class");
  }
};
