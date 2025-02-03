import { AddUpdateTeacherRequest } from "@/lib/types";

const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

if (!NEXT_PUBLIC_BASE_URL) {
  throw new Error("NEXT_PUBLIC_BASE_URL is not set");
}
export const fetchTeachersRequest = async () => {
  const response = await fetch(`${NEXT_PUBLIC_BASE_URL}/api/v1/teachers`);

  if (!response.ok) {
    throw new Error("Failed to fetch teachers");
  }

  return await response.json();
};

export const addTeacherRequest = async (teacher: AddUpdateTeacherRequest) => {
  const response = await fetch(`${NEXT_PUBLIC_BASE_URL}/api/v1/teachers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(teacher),
  });

  if (!response.ok) {
    throw new Error("Failed to add teacher");
  }

  return await response.json();
};
