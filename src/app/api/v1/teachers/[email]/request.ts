import logger from "@/lib/logger";

export const fetchTeacherByEmail = async (email: string) => {
  try {
    const response = await fetch(`/api/v1/teachers/${email}`);
    if (!response.ok) {
      throw new Error("Failed to fetch teacher data");
    }
    return await response.json();
  } catch (error) {
    logger.error(error, "Error fetching teacher data by email");
    throw error;
  }
};
