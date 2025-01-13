import logger from "@/lib/logger";

export const fetchVacations = async (email: string) => {
  try {
    const response = await fetch(
      `/api/v1/vacations?email=${encodeURIComponent(email)}`
    );
    if (!response.ok) throw new Error("Failed to fetch vacations");
    return await response.json();
  } catch (err) {
    logger.error({ err }, "Error fetching vacations");
    throw err;
  }
};

export const removeVacation = async (email: string, vacationId: number) => {
  try {
    const response = await fetch(
      `/api/v1/vacations?email=${encodeURIComponent(email)}&vacationId=${vacationId}`,
      { method: "DELETE" }
    );
    if (!response.ok) throw new Error("Failed to remove vacation");
    return await response.json();
  } catch (err) {
    logger.error({ err, email, vacationId }, "Error removing vacation");
    throw err;
  }
};
