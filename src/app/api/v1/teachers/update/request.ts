import { TeacherFormWithTimeSlots } from "@/lib/types";

export const updateTeacher = async (teacher: TeacherFormWithTimeSlots) => {
  try {
    const response = await fetch(`/api/v1/teachers/update/${teacher.email}`, {
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
  } catch (error) {
    console.error("Error updating teacher:", error);
    throw error;
  }
};
