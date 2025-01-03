import { Plan, PlansMap } from "./types";

export const groupByCurrency = (plans: Plan[]): PlansMap => {
  return plans.reduce((plansMap, item) => {
    const currency = item.currency;

    if (!plansMap.has(currency)) {
      plansMap.set(currency, []);
    }

    plansMap.get(currency).push(item);

    return plansMap;
  }, new Map());
};

export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const convertToRruleDate = (date: Date): string =>
  date
    .toISOString()
    .replace(/[.:-]/g, "")
    .replace(/...(?=Z)/, "");
