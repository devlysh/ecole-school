import { BookedClassesService } from "../../../domain/services/BookedClasses.service";

export const handler = async () => {
  const bookedClassesService = new BookedClassesService();
  try {
    await bookedClassesService.refreshBookedClasses();
    console.log("Booked classes refreshed successfully.");
  } catch (error) {
    console.error("Error refreshing booked classes:", error);
  }
};
