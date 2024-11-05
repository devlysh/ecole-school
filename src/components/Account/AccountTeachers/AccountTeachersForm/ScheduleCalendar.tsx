import React, { ChangeEvent, useCallback, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import rrulePlugin from "@fullcalendar/rrule";
import { ALL_WEEKDAYS, Options, RRule, WeekdayStr } from "rrule";
import {
  DateSelectArg,
  EventApi,
  EventInput,
} from "@fullcalendar/core/index.js";
import RecurrenceOptions from "./RecurrenceOptions"; // Import the new component
import { Checkbox } from "@nextui-org/react";

export enum EndCondition {
  NEVER = "never",
  ON = "on",
  AFTER = "after",
}

interface ScheduleCalendarProps {
  timeSlots: EventInput[];
  setTimeSlots: (timeSlots: EventInput[]) => void;
}

const DEFAULT_RECURRENCE_RULE = new RRule({
  freq: RRule.WEEKLY,
  byweekday: [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR],
});

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

const ScheduleCalendar = ({
  timeSlots,
  setTimeSlots,
}: ScheduleCalendarProps) => {
  const [makeRecurrent, setMakeRecurrent] = useState<boolean>(true);
  const [endCondition, setEndCondition] = useState<EndCondition>(
    EndCondition.NEVER
  );

  const { recurrenceRule, updateRecurrenceRule, handleFrequencyChange } =
    useRecurrenceRule(DEFAULT_RECURRENCE_RULE);

  const handleEndConditionChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const newEndCondition = event.target.value as EndCondition;
      setEndCondition(newEndCondition);

      if (newEndCondition === EndCondition.NEVER) {
        updateRecurrenceRule({ until: undefined, count: undefined });
      }
    },
    [updateRecurrenceRule]
  );

  const handleDateSelect = useCallback(
    (selectInfo: DateSelectArg) => {
      const calendarApi = selectInfo.view.calendar;
      calendarApi.unselect();

      const event: EventInput = {
        id: String(timeSlots.length + 1),
        title: makeRecurrent ? "Recurring Event" : "Single Event",
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        ...(makeRecurrent && {
          rrule: `DTSTART:${selectInfo.start
            .toISOString()
            .replace(/[.:-]/g, "")
            .replace(/...(?=Z)/, "")}\n${recurrenceRule.toString()}`,
          duration: {
            hours: Math.floor(
              (new Date(selectInfo.endStr).getTime() -
                new Date(selectInfo.startStr).getTime()) /
                (1000 * 60 * 60)
            ),
          },
        }),
      };

      setTimeSlots([...timeSlots, event]);
    },
    [makeRecurrent, recurrenceRule, setTimeSlots, timeSlots]
  );

  const handleEventClick = useCallback(
    (clickInfo: { event: EventApi }) => {
      setTimeSlots(
        timeSlots.filter((event) => event.id !== clickInfo.event.id)
      );
    },
    [setTimeSlots, timeSlots]
  );

  const untilValue = useMemo(
    () => recurrenceRule.options.until?.toISOString().split("T")[0],
    [recurrenceRule]
  );

  const byWeekDayDefaultValue = useMemo(
    () =>
      recurrenceRule.options.byweekday?.map((weekday) => ALL_WEEKDAYS[weekday]),
    [recurrenceRule]
  );

  const occurrencesValue = recurrenceRule.options.count?.toString();

  return (
    <>
      <div className="w-full p-2">
        <Checkbox
          defaultSelected={makeRecurrent}
          onChange={(e) => setMakeRecurrent(e.target.checked)}
        >
          Recurrent event
        </Checkbox>
      </div>
      <RecurrenceOptions
        makeRecurrent={makeRecurrent}
        recurrenceRule={recurrenceRule}
        updateRecurrenceRule={updateRecurrenceRule}
        handleFrequencyChange={handleFrequencyChange}
        endCondition={endCondition}
        handleEndConditionChange={handleEndConditionChange}
        untilValue={untilValue}
        occurrencesValue={occurrencesValue}
        byWeekDayDefaultValue={byWeekDayDefaultValue}
      />
      <div className="w-full p-2">
        <FullCalendar
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            interactionPlugin,
            rrulePlugin,
          ]}
          slotDuration="01:00:00"
          initialView="timeGridWeek"
          selectable={true}
          select={handleDateSelect}
          events={timeSlots}
          eventClick={handleEventClick}
          allDaySlot={false}
          timeZone="UTC"
          nowIndicator
          firstDay={1}
          selectOverlap={false}
        />
      </div>
    </>
  );
};

export default ScheduleCalendar;
