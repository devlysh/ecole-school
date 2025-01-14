import logger from "@/lib/logger";

export const fetchTeachers = async () => {
  try {
    const response = await fetch("/api/v1/teachers");
    if (!response.ok) {
      throw new Error("Failed to fetch teachers");
    }
    return await response.json();
  } catch (error) {
    logger.error("Error fetching teachers:", error);
    throw error;
  }
};