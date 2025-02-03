export const fetchBookedClassesRequest = async () => {
  const response = await fetch("/api/v1/booked-classes");
  if (!response.ok) {
    throw new Error("Failed to fetch booked classes");
  }
  return await response.json();
};

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
    const { message } = await response.json();
    throw new Error(message || "Failed to book classes");
  }

  return response.json();
};

export const deleteBookedClassesRequest = async () => {
  const response = await fetch("/api/v1/booked-classes", {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete booked classes");
  }

  return response.json();
};
