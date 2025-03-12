import { MIN_BOOKING_DAYS } from "./constants";
import { DisplayBookedClass, Plan, PlansMap, TeacherClass } from "./types";
import { addDays, addMonths, addWeeks } from "date-fns";

// Groups an array of plans by their currency and returns a map
export const groupByCurrency = (plans: Plan[]): PlansMap => {
  return plans.reduce((plansMap, item) => {
    const currency = item.currency;

    // If the currency is not already a key in the map, add it with an empty array
    if (!plansMap.has(currency)) {
      plansMap.set(currency, []);
    }

    // Add the current plan to the array for its currency
    plansMap.get(currency).push(item);

    return plansMap;
  }, new Map());
};

// Capitalizes the first letter of a string
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Converts a Date object to a string formatted for RRULE
export const convertToRruleDate = (date: Date): string =>
  date
    .toISOString() // Convert date to ISO string
    .replace(/[.:-]/g, "") // Remove dots, colons, and dashes
    .replace(/...(?=Z)/, ""); // Remove milliseconds before the 'Z'

// Compresses time from milliseconds to a smaller number for storage or transmission efficiency
export const compressTime = (timeInMilliseconds: number): number => {
  return timeInMilliseconds / Math.pow(10, 5);
};

// Expands time from the compressed form back to milliseconds
export const expandTime = (timeInCompressedForm: number): number => {
  return timeInCompressedForm * Math.pow(10, 5);
};

export const getWeeklyOccurencesForPeriod = (
  startDate: Date,
  endDate: Date
): Date[] => {
  const occurences = [];
  for (
    let date = new Date(startDate);
    date <= endDate;
    date.setDate(date.getDate() + 7)
  ) {
    occurences.push(new Date(date));
  }
  return occurences;
};

export const determineBookedClassId = (
  selectedClass: DisplayBookedClass | TeacherClass
) => {
  return selectedClass.recurring
    ? decodeClassId(selectedClass.id.toString()).bookedClassId
    : Number(selectedClass.id);
};

export const expandClasses = (classes: DisplayBookedClass[]) => {
  return classes.flatMap((classItem: DisplayBookedClass) => {
    const classDate = new Date(classItem.date);
    const isRecurring = classItem.recurring === true;
    const classes = [];

    if (isRecurring) {
      const occurencesForMonth = getWeeklyOccurencesForPeriod(
        classDate,
        addMonths(new Date(), 1)
      );

      for (let i = 0; i < occurencesForMonth.length; i++) {
        const recurringClassDate = addWeeks(classDate, i);

        const recurringClassItem = {
          ...classItem,
          id: encodeClassId(classItem.id.toString(), i),
        };

        classes.push({
          ...recurringClassItem,
          date: recurringClassDate,
        });
      }
    } else {
      classes.push({
        ...classItem,
        date: new Date(classItem.date),
        id: classItem.id.toString(),
      });
    }

    return classes;
  });
};

export const filterClasses = (classes: DisplayBookedClass[]) => {
  return classes.filter((classItem) => {
    return (
      addDays(classItem.createdAt, MIN_BOOKING_DAYS) < new Date(classItem.date)
    );
  });
};

export const sortClasses = (classes: DisplayBookedClass[]) => {
  return classes.sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
};

export const markClassesWithCredit = (
  classes: DisplayBookedClass[],
  creditCount: number
) => {
  return classes.map((classItem, index) => {
    if (creditCount > index) {
      return { ...classItem, hasCredit: true };
    }
    return { ...classItem, hasCredit: false };
  });
};

export const encodeClassId = (classId: string, index: number) => {
  return encodeURIComponent(`recurring-${classId}-${index}`);
};

export const decodeClassId = (
  classId: string
): { bookedClassId: number; index: number } => {
  const [, bookedClassId, index] = classId.split("-");
  return { bookedClassId: Number(bookedClassId), index: Number(index) };
};
