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
