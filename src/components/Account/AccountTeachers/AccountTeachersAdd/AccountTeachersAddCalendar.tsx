import {
  Checkbox,
  CheckboxGroup,
  Input,
  Select,
  SelectItem,
} from "@nextui-org/react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import rrulePlugin from "@fullcalendar/rrule";
import { ALL_WEEKDAYS, Options, RRule, WeekdayStr } from "rrule";
import { ChangeEvent, useCallback, useMemo, useState } from "react";
import {
  DateSelectArg,
  EventApi,
  EventInput,
} from "@fullcalendar/core/index.js";

enum EndCondition {
  NEVER = "never",
  ON = "on",
  AFTER = "after",
}

interface AccountTeachersAddCalendarProps {
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

const AccountTeachersAddCalendar = ({
  timeSlots,
  setTimeSlots,
}: AccountTeachersAddCalendarProps) => {
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

  const intervalValue = recurrenceRule.options.interval.toString();
  const frequencyDefaultValue = recurrenceRule.options.freq.toString();
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
      {makeRecurrent && (
        <div className="w-full p-2">
          <div className="flex flex-row gap-2 w-1/2">
            <Input
              label="Repeat every"
              name="interval"
              type="number"
              min={1}
              value={intervalValue}
              onChange={(e) =>
                updateRecurrenceRule({ interval: Number(e.target.value) })
              }
            />
            <Select
              label="Repeats"
              name="freq"
              onChange={handleFrequencyChange}
              defaultSelectedKeys={[frequencyDefaultValue]}
            >
              <SelectItem key={RRule.DAILY.toString()}>Day</SelectItem>
              <SelectItem key={RRule.WEEKLY.toString()}>Week</SelectItem>
              <SelectItem key={RRule.MONTHLY.toString()}>Month</SelectItem>
            </Select>
          </div>
          {recurrenceRule.options.freq === RRule.WEEKLY && (
            <div className="flex flex-row gap-2 w-1/2">
              <CheckboxGroup
                label="Repeat on"
                name="byweekday"
                orientation="horizontal"
                defaultValue={byWeekDayDefaultValue}
                onChange={(weekdays) =>
                  updateRecurrenceRule({
                    byweekday: weekdays.map((day) => RRule[day as WeekdayStr]),
                  })
                }
              >
                <Checkbox value={RRule.MO.toString()}>MO</Checkbox>
                <Checkbox value={RRule.TU.toString()}>TU</Checkbox>
                <Checkbox value={RRule.WE.toString()}>WE</Checkbox>
                <Checkbox value={RRule.TH.toString()}>TH</Checkbox>
                <Checkbox value={RRule.FR.toString()}>FR</Checkbox>
                <Checkbox value={RRule.SA.toString()}>SA</Checkbox>
                <Checkbox value={RRule.SU.toString()}>SU</Checkbox>
              </CheckboxGroup>
            </div>
          )}
          <div className="flex flex-row gap-2 w-1/2 mt-4">
            <Select
              label="Ends"
              value={endCondition}
              onChange={handleEndConditionChange}
              defaultSelectedKeys={[endCondition]}
            >
              <SelectItem key={EndCondition.NEVER}>Never</SelectItem>
              <SelectItem key={EndCondition.ON}>On (date)</SelectItem>
              <SelectItem key={EndCondition.AFTER}>
                After (N occurrences)
              </SelectItem>
            </Select>
            {endCondition === "on" && (
              <Input
                label="End Date"
                name="until"
                type="date"
                value={untilValue}
                onChange={(e) =>
                  updateRecurrenceRule({ until: new Date(e.target.value) })
                }
              />
            )}
            {endCondition === "after" && (
              <Input
                label="Occurrences"
                type="number"
                min={1}
                defaultValue="1"
                value={occurrencesValue}
                onChange={(e) =>
                  updateRecurrenceRule({ count: Number(e.target.value) })
                }
              />
            )}
          </div>
          <div className="w-full p-2">
            <p className="text-gray-300">String: {recurrenceRule.toString()}</p>
            <p className="text-gray-900">Text: {recurrenceRule.toText()}</p>
          </div>
        </div>
      )}
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

export default AccountTeachersAddCalendar;
