import logger from "@/lib/logger";
import {
  SlotAvailibilityContext,
  SlotAvailibilityStrategy,
} from "./SlotAvailibilityStrategy.interface";

export class LanguageMatchingStrategy implements SlotAvailibilityStrategy {
  public isAvailable(context: SlotAvailibilityContext): boolean {
    const { slot, teachersLanguages, studentLanguages } = context;

    if (
      !studentLanguages ||
      !studentLanguages.length ||
      !slot ||
      !teachersLanguages
    ) {
      logger.warn("Missing context in LanguageMatchingStrategy");
      return false;
    }

    const currentTeacherLanguages = teachersLanguages.get(slot.teacherId);

    if (!currentTeacherLanguages) {
      return false;
    }

    return currentTeacherLanguages.some((teacherLanguage) =>
      studentLanguages.some(
        (studentLanguage) => teacherLanguage.id === studentLanguage.id
      )
    );
  }
}
