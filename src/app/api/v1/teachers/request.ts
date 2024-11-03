import logger from "@/lib/logger";

const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

if (!NEXT_PUBLIC_BASE_URL) {
  throw new Error("NEXT_PUBLIC_BASE_URL is not set");
}

export const getTeachersRequest = async () => {
  const response = await fetch(`${NEXT_PUBLIC_BASE_URL}/api/v1/teachers`);

  if (!response.ok) {
    logger.error({ response }, "Error fetching teachers");
    throw new Error(response.statusText ?? "Failed to fetch teachers");
  }

  return await response.json();
};

export const createTeacherRequest = async (teacherData: {
  email: string;
  name: string;
  languages: string[];
  password: string;
  availableHours: number[];
}) => {
  const response = await fetch(`${NEXT_PUBLIC_BASE_URL}/api/v1/teachers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(teacherData),
  });

  if (!response.ok) {
    logger.error({ response }, "Error creating teacher");
    throw new Error(response.statusText ?? "Failed to create teacher");
  }

  return await response.json();
};
