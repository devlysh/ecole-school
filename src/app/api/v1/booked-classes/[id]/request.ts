import { compressTime } from "@/lib/utils";

const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

if (!NEXT_PUBLIC_BASE_URL) {
  throw new Error("NEXT_PUBLIC_BASE_URL is not set");
}

export const deleteBookedClassRequest = async (
  classId: number,
  date: Date,
  deleteFutureOccurences: boolean = false
) => {
  if (typeof classId !== "number") {
    throw new Error("Class id must be a number");
  }

  if (!(date instanceof Date)) {
    throw new Error("Date must be an instance of Date");
  }

  const url = new URL(
    `${NEXT_PUBLIC_BASE_URL}/api/v1/booked-classes/${classId}`
  );
  url.searchParams.set("date", compressTime(date.getTime()).toString());
  url.searchParams.set(
    "deleteFutureOccurences",
    deleteFutureOccurences.toString()
  );

  const response = await fetch(url.toString(), {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete booked class");
  }
  return await response.json();
};

export const rescheduleBookedClassRequest = async (
  classId: number,
  oldDate: Date,
  newDate: Date
) => {
  if (typeof classId !== "number") {
    throw new Error("Class id must be a number");
  }

  if (!(newDate instanceof Date)) {
    throw new Error("Date must be an instance of Date");
  }

  const url = new URL(
    `${NEXT_PUBLIC_BASE_URL}/api/v1/booked-classes/${classId}`
  );

  const response = await fetch(url.toString(), {
    method: "PUT",
    body: JSON.stringify({
      oldDate: oldDate.toISOString(),
      newDate: newDate.toISOString(),
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to delete booked class");
  }

  return await response.json();
};
