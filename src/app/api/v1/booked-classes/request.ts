import logger from "@/lib/logger";

export const bookClassesRequest = async (
  dates: number[],
  isRecurrent: boolean
) => {
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
};

export const fetchBookedClassesRequest = async () => {
  try {
    const response = await fetch("/api/v1/booked-classes");
    if (!response.ok) {
      throw new Error("Failed to fetch booked classes");
    }
    return await response.json();
  } catch (err) {
    logger.error({ err }, "Failed to fetch booked classes");
    throw new Error("Failed to fetch booked classes");
  }
};

export const deleteBookedClassesRequest = async () => {
  const response = await fetch("/api/v1/booked-classes", {
    method: "DELETE",
  });
  return response.json();
};
