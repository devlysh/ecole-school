import { AddUpdateTeacherRequest } from "@/lib/types";

export const fetchTeacherByEmailRequest = async (email: string) => {
  const response = await fetch(`/api/v1/teachers/${email}`);

  if (!response.ok) {
    throw new Error("Failed to fetch teacher data");
  }

  return await response.json();
};

export const updateTeacherRequest = async (
  teacher: AddUpdateTeacherRequest
) => {
  const response = await fetch(`/api/v1/teachers/${teacher.email}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(teacher),
  });

  if (!response.ok) {
    throw new Error("Failed to update teacher");
  }

  return await response.json();
};
