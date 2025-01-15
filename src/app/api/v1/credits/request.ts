import logger from "@/lib/logger";

export const fetchCreditCount = async () => {
  try {
    const response = await fetch(`/api/v1/credits`);
    if (!response.ok) throw new Error("Failed to fetch credit count");
    return await response.json();
  } catch (err) {
    logger.error({ err }, "Error fetching credit count");
    throw err;
  }
};
