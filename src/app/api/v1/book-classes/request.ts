import logger from "@/lib/logger";

const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

if (!NEXT_PUBLIC_BASE_URL) {
  throw new Error("NEXT_PUBLIC_BASE_URL is not set");
}

export async function bookClasses(
  selectedSlots: Date[],
  isFixedSchedule: boolean
) {
  try {
    const dates = selectedSlots.map((slot) => slot.toISOString());

    const response = await fetch(
      `${NEXT_PUBLIC_BASE_URL}/api/v1/book-classes`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dates, isFixedSchedule }),
      }
    );

    if (!response.ok) {
      const { error } = await response.json();
      logger.error(error, "Failed to book classes");
    }

    return response.json();
  } catch (error) {
    logger.error(error, "Failed to book classes");
    throw error;
  }
}
