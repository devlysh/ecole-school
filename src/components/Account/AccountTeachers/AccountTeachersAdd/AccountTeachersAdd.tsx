"use client";

import React, { useState, ChangeEvent, FC } from "react";
import {
  Button,
  Checkbox,
  CheckboxGroup,
  Input,
  Select,
  SelectItem,
} from "@nextui-org/react";
import logger from "@/lib/logger";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import rrulePlugin from "@fullcalendar/rrule";
import { EventApi, DateSelectArg, EventInput } from "@fullcalendar/core";
import { ALL_WEEKDAYS, ByWeekday, RRule, WeekdayStr } from "rrule";

enum EndCondition {
  NEVER = "never",
  ON = "on",
  AFTER = "after",
}

const DEFAULT_RECURRENCE_RULE = new RRule({
  freq: RRule.WEEKLY,
  byweekday: [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR],
});

const AccountTeachersAdd: FC = () => {
  const [timezone, setTimezone] = useState<string>("");
  const [events, setEvents] = useState<EventInput[]>([]);
  const [makeRecurrent, setMakeRecurrent] = useState<boolean>(true);
  const [endCondition, setEndCondition] = useState<string>(EndCondition.NEVER);
  const [recurrenceRule, setRecurrenceRule] = useState<RRule>(
    DEFAULT_RECURRENCE_RULE
  );
  const [savedWeekdays, setSavedWeekdays] = useState<ByWeekday[]>([]);

  const handleChangeTimezone = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = (event.target as HTMLSelectElement).value;
    if (value) {
      logger.debug({ value }, "Timezone");
      setTimezone(value);
    }
  };

  const handleIntervalChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    if (!isNaN(value)) {
      setRecurrenceRule(
        (prev) =>
          new RRule({
            ...prev.origOptions,
            interval: value,
          })
      );
    }
  };

  const handleFrequencyChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = Number(event.target.value);
    setRecurrenceRule((prev) => {
      const newOptions = { ...prev.origOptions, freq: value };
      if (value !== RRule.WEEKLY) {
        setSavedWeekdays(prev.origOptions.byweekday as ByWeekday[]);
        delete newOptions.byweekday;
      } else {
        newOptions.byweekday = savedWeekdays;
      }
      return new RRule(newOptions);
    });
  };

  const handleByweekdayChange = (weekdays: string[]) => {
    setRecurrenceRule(
      (prev) =>
        new RRule({
          ...prev.origOptions,
          byweekday: weekdays.map((day) => RRule[day as WeekdayStr]),
        })
    );
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect();

    if (!makeRecurrent) {
      const singleEvent: EventInput = {
        id: String(events.length + 1),
        title: "Single Event",
        start: selectInfo.startStr,
        end: selectInfo.endStr,
      };

      setEvents([...events, singleEvent]);
    } else {
      logger.debug(
        { recurrenceRule, selectInfo, string: recurrenceRule.toString() },
        "Recurrence Rule"
      );

      const recurringEvent: EventInput = {
        id: String(events.length + 1),
        title: "Recurring Event",
        start: selectInfo.startStr,
        end: selectInfo.endStr,
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
      };

      setEvents([...events, recurringEvent]);
    }
  };

  const handleEventClick = (clickInfo: { event: EventApi }) => {
    setEvents(events.filter((event) => event.id !== clickInfo.event.id));
  };

  const handleAddTeacher = () => {
    logger.debug({ events }, "Events");
  };

  const handleEndConditionChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const newEndCondition = event.target.value;
    setEndCondition(newEndCondition);

    if (newEndCondition === EndCondition.NEVER) {
      setRecurrenceRule(
        (prev) =>
          new RRule({
            ...prev.origOptions,
            until: undefined,
            count: undefined,
          })
      );
    }
  };

  return (
    <div className="flex w-full">
      <div className="w-full">
        <h1>Add New Teacher</h1>
        <div className="flex flex-row flex-wrap w-full">
          <div className="w-1/2 p-2">
            <Input name="firstName" label="First Name" className="w-full" />
          </div>
          <div className="w-1/2 p-2">
            <Input name="lastName" label="Last Name" className="w-full" />
          </div>
          <div className="w-1/2 p-2">
            <Input name="email" label="Email" className="w-full" />
          </div>
          <div className="w-1/2 p-2">
            <Input
              name="password"
              label="Password"
              type="password"
              className="w-full"
            />
          </div>
          <div className="w-full p-2">
            <Select
              placeholder="Select Timezone"
              value={timezone}
              onChange={handleChangeTimezone}
              label="Timezone"
              required
              isDisabled
            >
              <SelectItem key="utc" value="utc">
                UTC
              </SelectItem>
            </Select>
          </div>
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
                  value={recurrenceRule.options.interval.toString()}
                  onChange={handleIntervalChange}
                />
                <Select
                  label="Repeats"
                  name="freq"
                  onChange={handleFrequencyChange}
                  defaultSelectedKeys={[recurrenceRule.options.freq.toString()]}
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
                    defaultValue={recurrenceRule.options.byweekday?.map(
                      (weekday) => ALL_WEEKDAYS[weekday]
                    )}
                    onChange={handleByweekdayChange}
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
                    value={
                      recurrenceRule.options.until?.toISOString().split("T")[0]
                    }
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      const dateValue = new Date(event.target.value);
                      setRecurrenceRule(
                        (prev) =>
                          new RRule({
                            ...prev.origOptions,
                            until: dateValue,
                          })
                      );
                    }}
                  />
                )}
                {endCondition === "after" && (
                  <Input
                    label="Occurrences"
                    type="number"
                    min={1}
                    defaultValue="1"
                    value={recurrenceRule.options.count?.toString()}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      const countValue = Number(event.target.value);
                      if (!isNaN(countValue)) {
                        setRecurrenceRule(
                          (prev) =>
                            new RRule({
                              ...prev.origOptions,
                              count: countValue,
                            })
                        );
                      }
                    }}
                  />
                )}
              </div>
              <div className="w-full p-2">
                <p className="text-gray-300">
                  String: {recurrenceRule.toString()}
                </p>
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
              events={events}
              eventClick={handleEventClick}
              allDaySlot={false}
              timeZone="UTC"
              nowIndicator
              firstDay={1}
              selectOverlap={false}
            />
          </div>
          <div className="w-full p-2">
            <Button onClick={handleAddTeacher}>Add Teacher</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountTeachersAdd;
