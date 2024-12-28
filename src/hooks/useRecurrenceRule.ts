import { ChangeEvent, useCallback, useState } from "react";
import { Options, RRule, WeekdayStr } from "rrule";

const useRecurrenceRule = (initialRule: RRule) => {
  const [recurrenceRule, setRecurrenceRule] = useState<RRule>(initialRule);
  const [savedWeekdays, setSavedWeekdays] = useState<WeekdayStr[]>([]);

  const updateRecurrenceRule = (options: Partial<Options>) => {
    setRecurrenceRule((prev) => new RRule({ ...prev.origOptions, ...options }));
  };

  const handleFrequencyChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const value = Number(event.target.value);
      updateRecurrenceRule({ freq: value });
      if (value !== RRule.WEEKLY) {
        setSavedWeekdays(recurrenceRule.origOptions.byweekday as WeekdayStr[]);
        updateRecurrenceRule({ byweekday: undefined });
      } else {
        updateRecurrenceRule({ byweekday: savedWeekdays });
      }
    },
    [recurrenceRule, savedWeekdays]
  );

  return {
    recurrenceRule,
    updateRecurrenceRule,
    handleFrequencyChange,
  };
};

export default useRecurrenceRule;
