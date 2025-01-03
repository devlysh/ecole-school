import React, { ChangeEvent, useCallback, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import rrulePlugin from "@fullcalendar/rrule";
import { ALL_WEEKDAYS, RRule } from "rrule";
import {
  DateSelectArg,
  EventApi,
  EventInput,
} from "@fullcalendar/core/index.js";
import RecurrenceOptions from "./RecurrenceOptions";
import { Checkbox } from "@nextui-org/react";
import { convertToRruleDate } from "@/lib/utils";
import useRecurrenceRule from "@/hooks/useRecurrenceRule";

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

const ScheduleCalendar = ({
  timeSlots,
  setTimeSlots,
}: ScheduleCalendarProps) => {
  const [isRecurrent, setIsRecurrent] = useState<boolean>(true);
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

      const dtStart = convertToRruleDate(selectInfo.start);
      const rrule = `${recurrenceRule.toString()}`;
      const rruleWithStart = `DTSTART:${dtStart}\n${rrule}`;

      const event: EventInput = {
        id: String(timeSlots.length + 1),
        title: isRecurrent ? "Recurring Event" : "Single Event",
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        ...(isRecurrent && {
          rrule: rruleWithStart,
          duration: {
            hours: Math.floor(
              (new Date(selectInfo.endStr).getTime() -
                new Date(selectInfo.startStr).getTime()) /
                (1000 * 60 * 60)
            ),
          },
        }),
        extendedProps: {
          ...(isRecurrent && {
            rrule,
          }),
        },
      };

      setTimeSlots([...timeSlots, event]);
    },
    [isRecurrent, recurrenceRule, setTimeSlots, timeSlots]
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
          defaultSelected={isRecurrent}
          onChange={(e) => setIsRecurrent(e.target.checked)}
        >
          Recurrent event
        </Checkbox>
      </div>
      <RecurrenceOptions
        makeRecurrent={isRecurrent}
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
          events={timeSlots.map((slot) => {
            if (slot.rrule && slot.extendedProps?.dtStart) {
              slot.rrule = `DTSTART:${slot.extendedProps?.dtStart}\n${slot.rrule}`;
            }
            return slot;
          })}
          eventClick={handleEventClick}
          allDaySlot={true}
          timeZone="UTC"
          nowIndicator
          firstDay={0}
          selectOverlap={false}
          locale="en-US"
        />
      </div>
    </>
  );
};

export default ScheduleCalendar;
