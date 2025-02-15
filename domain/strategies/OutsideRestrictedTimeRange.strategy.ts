import logger from "@/lib/logger";
import {
  SlotAvailibilityContext,
  SlotAvailibilityStrategy,
} from "./SlotAvailibilityStrategy.interface";

export enum RestrictedTimeUnit {
  HOURS = "hours",
  DAYS = "days",
}
export enum RestrictedTimeDirection {
  BEFORE = "before",
  AFTER = "after",
}

export class OutsideRestrictedTimeRangeStrategy
  implements SlotAvailibilityStrategy
{
  constructor(
    private restrictedTime: number,
    private restrictedTimeUnit: RestrictedTimeUnit,
    private restrictedTimeDirection: RestrictedTimeDirection,
    private date: Date
  ) {}

  isAvailable(context: SlotAvailibilityContext): boolean {
    const { dateTime } = context;

    if (!dateTime) {
      logger.warn("Missing context in OutsideRestrictedTimeRangeStrategy");
      return false;
    }

    const restrictedTimeStart = new Date(this.date);
    const restrictedTimeEnd = new Date(this.date);

    switch (this.restrictedTimeUnit) {
      case RestrictedTimeUnit.HOURS:
        if (this.restrictedTimeDirection === RestrictedTimeDirection.BEFORE) {
          restrictedTimeStart.setHours(
            restrictedTimeStart.getHours() - this.restrictedTime
          );
        } else {
          restrictedTimeEnd.setHours(
            restrictedTimeEnd.getHours() + this.restrictedTime
          );
        }
        break;
      case RestrictedTimeUnit.DAYS:
        if (this.restrictedTimeDirection === RestrictedTimeDirection.BEFORE) {
          restrictedTimeStart.setDate(
            restrictedTimeStart.getDate() - this.restrictedTime
          );
        } else {
          restrictedTimeEnd.setDate(
            restrictedTimeEnd.getDate() + this.restrictedTime
          );
        }
        break;
    }

    return dateTime < restrictedTimeStart || dateTime > restrictedTimeEnd;
  }
}
