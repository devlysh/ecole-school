export async function bookClassesRequest(
  dates: number[],
  isRecurrent: boolean
) {
  const response = await fetch("/api/v1/book-classes", {
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
