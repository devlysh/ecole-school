import logger from "@/lib/logger";

export async function bookClassesRequest(
  dates: number[],
  isRecurrent: boolean
) {
  logger.debug({ dates, isRecurrent }, "DEBUG1");
  const response = await fetch("/api/v1/booked-classes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      dates,
      isRecurrent,
    }),
  });

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error || "Failed to book classes");
  }

  return response.json();
}

export const fetchBookedClasses = async () => {
  try {
    const response = await fetch("/api/v1/booked-classes");
    if (!response.ok) {
      throw new Error("Failed to fetch booked classes");
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch booked classes");
  }
};
