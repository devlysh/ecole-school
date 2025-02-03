import {
  SlotAvailibilityContext,
  SlotAvailibilityStrategy,
} from "./SlotAvailibilityStrategy.interface";

export class IsLanguageMatchingStrategy implements SlotAvailibilityStrategy {
  public isAvailable(context: SlotAvailibilityContext): boolean {
    const { slot, teachersLanguages, studentLanguages } = context;

    if (!studentLanguages || !studentLanguages.length) {
      return false;
    }

    if (!slot || !teachersLanguages) {
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
