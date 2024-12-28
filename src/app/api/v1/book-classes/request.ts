import { AvailableHour } from "@/lib/types";

export async function bookClasses(data: AvailableHour[]) {
  const response = await fetch("/api/v1/book-classes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(`Failed to create class: ${errorBody.error}`);
  }

  return response.json();
}
