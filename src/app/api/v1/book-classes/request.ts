export async function bookClassesRequest(dates: number[], isFixedSchedule: boolean) {
  const response = await fetch("/api/v1/book-classes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      dates,
      isFixedSchedule,
    }),
  });

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error || "Failed to book classes");
  }

  return response.json();
}
