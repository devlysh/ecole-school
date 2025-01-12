import {
  SlotAvailibilityContext,
  SlotAvailibilityStrategy,
} from "./SlotAvailibilityStrategy.interface";

export enum PermittedTimeUnit {
  HOURS = "hours",
  DAYS = "days",
}

export enum PermittedTimeDirection {
  BEFORE = "before",
  AFTER = "after",
}

export class IsAtPermittedTimeStrategy implements SlotAvailibilityStrategy {
  constructor(
    private timeThreshold: number,
    private timeThresholdUnit: PermittedTimeUnit,
    private timeThresholdDirection: PermittedTimeDirection,
    private date: Date
  ) {}

  isAvailable(context: SlotAvailibilityContext): boolean {
    const { dateTime } = context;

    if (!dateTime) {
      return false;
    }

    const compareDate = new Date(this.date);

    switch (this.timeThresholdDirection) {
      case PermittedTimeDirection.BEFORE: {
        switch (this.timeThresholdUnit) {
          case PermittedTimeUnit.HOURS: {
            compareDate.setHours(compareDate.getHours() - this.timeThreshold);
            break;
          }

          case PermittedTimeUnit.DAYS: {
            compareDate.setDate(compareDate.getDate() - this.timeThreshold);
            break;
          }
        }
        return dateTime <= compareDate;
      }

      case PermittedTimeDirection.AFTER: {
        switch (this.timeThresholdUnit) {
          case PermittedTimeUnit.HOURS: {
            compareDate.setHours(compareDate.getHours() + this.timeThreshold);
            break;
          }

          case PermittedTimeUnit.DAYS: {
            compareDate.setDate(compareDate.getDate() + this.timeThreshold);
            break;
          }
        }
        return compareDate <= dateTime;
      }
    }
  }
}
