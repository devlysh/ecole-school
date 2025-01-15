import React, { ChangeEvent, useCallback, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
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
  email: string;
  timeSlots: EventInput[];
  vacations: EventInput[];
  setTimeSlots?: React.Dispatch<React.SetStateAction<EventInput[]>>;
  setVacations?: React.Dispatch<React.SetStateAction<EventInput[]>>;
}

const DEFAULT_RECURRENCE_RULE = new RRule({
  freq: RRule.WEEKLY,
  byweekday: [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR],
});

/**
 * Creates an all-day vacation event.
 */
function createVacationEvent(startDate: string, endDate: string): EventInput {
  return {
    id: String(Date.now()),
    title: "Vacation",
    start: startDate,
    end: endDate,
    allDay: true,
    color: "tomato",
    vacation: true,
  };
}

/**
 * Creates a recurring event based on an RRule string
 */
function createRecurringEvent(
  startDate: string,
  endDate: string,
  recurrenceRule: RRule
): EventInput {
  const dtStart = convertToRruleDate(new Date(startDate));
  const rruleString = recurrenceRule.toString();
  const rruleWithStart = `DTSTART:${dtStart}\n${rruleString}`;

  const durationHours =
    (new Date(endDate).getTime() - new Date(startDate).getTime()) /
    (1000 * 60 * 60);

  return {
    id: String(Date.now()),
    title: "Recurring Event",
    start: startDate,
    end: endDate,
    rrule: rruleWithStart,
    duration: { hours: durationHours },
    extendedProps: {
      rrule: rruleString,
      dtStart,
    },
  };
}

/**
 * Creates a single, non-recurring event.
 */
function createSingleEvent(startDate: string, endDate: string): EventInput {
  return {
    id: String(Date.now()),
    title: "Single Event",
    start: startDate,
    end: endDate,
  };
}

/**
 * Ensures a selected time range is at least 1 hour and snaps up to the nearest full hour.
 */
function enforceHourlyIncrement(start: Date, end: Date): [string, string] {
  const msInHour = 60 * 60 * 1000;
  let duration = end.getTime() - start.getTime();

  // Enforce minimum 1 hour
  if (duration < msInHour) {
    duration = msInHour;
  } else {
    // Snap up to integral hours
    const hours = Math.ceil(duration / msInHour);
    duration = hours * msInHour;
  }
  const newEnd = new Date(start.getTime() + duration);
  return [start.toISOString(), newEnd.toISOString()];
}

export default function ScheduleCalendar({
  timeSlots,
  vacations,
  setTimeSlots,
  setVacations,
}: ScheduleCalendarProps) {
  const [isRecurrent, setIsRecurrent] = useState<boolean>(true);
  const [endCondition, setEndCondition] = useState<EndCondition>(
    EndCondition.NEVER
  );

  const { recurrenceRule, updateRecurrenceRule, handleFrequencyChange } =
    useRecurrenceRule(DEFAULT_RECURRENCE_RULE);

  // Called when user changes how to end recurrence
  const handleEndConditionChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const newEnd = event.target.value as EndCondition;
      setEndCondition(newEnd);

      if (newEnd === EndCondition.NEVER) {
        updateRecurrenceRule({ until: undefined, count: undefined });
      }
    },
    [updateRecurrenceRule]
  );

  /**
   * Called when user drags to select multiple hours or days.
   */
  const handleDateSelect = useCallback(
    (selectInfo: DateSelectArg) => {
      if (!setTimeSlots || !setVacations) return;

      const { start, end, allDay, startStr, endStr, view } = selectInfo;

      // If zero-length, do nothing
      if (start.getTime() === end.getTime()) {
        return;
      }

      if (allDay) {
        // Multi-day vacation
        setVacations((prev) => [
          ...prev,
          createVacationEvent(startStr, endStr),
        ]);
      } else {
        // Enforce 1-hr increment in time selection
        const [sStr, eStr] = enforceHourlyIncrement(start, end);

        if (isRecurrent) {
          setTimeSlots((prev) => [
            ...prev,
            createRecurringEvent(sStr, eStr, recurrenceRule),
          ]);
        } else {
          setTimeSlots((prev) => [...prev, createSingleEvent(sStr, eStr)]);
        }
      }

      // Manually unselect so FullCalendar doesn't keep the selection
      view.calendar.unselect();
    },
    [isRecurrent, recurrenceRule, setTimeSlots, setVacations]
  );

  /**
   * Called when user single-clicks on a cell.
   */
  const handleDateClick = useCallback(
    (clickInfo: DateClickArg) => {
      if (!setTimeSlots || !setVacations) return;

      if (clickInfo.allDay) {
        // Single-day vacation
        setVacations((prev) => [
          ...prev,
          createVacationEvent(clickInfo.dateStr, clickInfo.dateStr),
        ]);
      } else {
        // Single hour timeslot
        const start = new Date(clickInfo.date);
        const end = new Date(start.getTime() + 60 * 60 * 1000);

        const [startStr, endStr] = enforceHourlyIncrement(start, end);

        if (isRecurrent) {
          setTimeSlots((prev) => [
            ...prev,
            createRecurringEvent(startStr, endStr, recurrenceRule),
          ]);
        } else {
          setTimeSlots((prev) => [
            ...prev,
            createSingleEvent(startStr, endStr),
          ]);
        }
      }
    },
    [isRecurrent, recurrenceRule, setTimeSlots, setVacations]
  );

  /**
   * Called when user clicks an existing event to remove it from the calendar.
   */
  const handleEventClick = useCallback(
    (clickInfo: { event: EventApi }) => {
      if (!setTimeSlots || !setVacations) return;
      const { event } = clickInfo;
      const isVacation = event.extendedProps?.vacation;

      if (isVacation) {
        setVacations((prev) => prev.filter((v) => v.id !== event.id));
      } else {
        setTimeSlots((prev) => prev.filter((t) => t.id !== event.id));
      }
    },
    [setTimeSlots, setVacations]
  );

  /**
   * Aggregate timeSlots + vacations for FullCalendar usage.
   */
  const calendarEvents = useMemo(() => {
    // For recurring events, ensure there's a DTSTART line in the rrule
    return [...timeSlots, ...vacations].map((evt) => {
      if (
        evt.rrule &&
        typeof evt.rrule === "string" &&
        evt.extendedProps?.dtStart &&
        !evt.rrule.includes("DTSTART:")
      ) {
        evt.rrule = `DTSTART:${evt.extendedProps.dtStart}\n${evt.rrule}`;
      }
      return evt;
    });
  }, [timeSlots, vacations]);

  return (
    <>
      <div style={{ marginBottom: "1rem" }}>
        <Checkbox
          defaultSelected={isRecurrent}
          onChange={(event) => setIsRecurrent(event.target.checked)}
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
        untilValue={recurrenceRule.options.until?.toISOString().split("T")[0]}
        occurrencesValue={recurrenceRule.options.count?.toString()}
        byWeekDayDefaultValue={recurrenceRule.options.byweekday?.map(
          (w) => ALL_WEEKDAYS[w]
        )}
      />

      <FullCalendar
        plugins={[
          dayGridPlugin,
          timeGridPlugin,
          interactionPlugin,
          rrulePlugin,
        ]}
        initialView="timeGridWeek"
        timeZone="UTC"
        locale="en-US"
        nowIndicator
        /*
          Requires user to drag at least 5px to create a selection,
          reducing accidental single-click triggers.
        */
        selectMinDistance={5}
        selectable
        selectMirror
        // We'll manually unselect after creating an event
        unselectAuto={false}
        select={handleDateSelect}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        // Force hour increments
        slotDuration="01:00:00"
        snapDuration="01:00:00"
        // This callback ensures the selection is at least 1 hour
        selectAllow={(selectRange) => {
          const diff = selectRange.end.getTime() - selectRange.start.getTime();
          return diff >= 60 * 60 * 1000 || selectRange.allDay;
        }}
        events={calendarEvents}
        allDaySlot
        allDayContent="Vacation"
        headerToolbar={{
          start: "prev,next today",
          center: "title",
          end: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
      />
      {/* 
        After editing, a parent-level "Save" button can commit changes to the DB.
      */}
    </>
  );
}
