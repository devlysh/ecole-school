import { TeacherFormWithTimeSlots } from "@/lib/types";

export const addTeacher = async (teacher: TeacherFormWithTimeSlots) => {
  try {
    const response = await fetch("/api/v1/teachers/add", {
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
  } catch (error) {
    console.error("Error adding teacher:", error);
    throw error;
  }
};
