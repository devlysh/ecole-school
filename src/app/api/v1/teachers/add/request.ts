import logger from "@/lib/logger";
import { TeacherFormValues } from "@/lib/types";
import { EventInput } from "@fullcalendar/core/index.js";

export const addTeacher = async (
  teacher: TeacherFormValues & {
    timeSlots: EventInput[];
    vacations: EventInput[];
  }
) => {
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
  } catch (err) {
    logger.error({ err, teacher }, "Error adding teacher");
    throw err;
  }
};
