import { Plan, PlansMap } from "./types";

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

export const getNextWeeklyOccurrence = (originalDate: Date): Date => {
  const now = new Date();
  // Make a copy so we don't mutate the originalDate
  let nextDate = new Date(originalDate);

  // Keep adding one week while nextDate is in the past
  while (nextDate < now) {
    nextDate.setDate(nextDate.getDate() + 7);
  }

  return nextDate;
};
