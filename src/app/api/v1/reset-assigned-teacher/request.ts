import logger from "@/lib/logger";

export const resetAssignedTeacherRequest = async () => {
  try {
    const response = await fetch("/api/v1/reset-assigned-teacher", {
      method: "PUT",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch teachers");
    }
    return await response.json();
  } catch (error) {
    logger.error("Error fetching teachers:", error);
    throw error;
  }
};
