import React, { ChangeEvent } from "react";
import {
  Checkbox,
  CheckboxGroup,
  Input,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { RRule, WeekdayStr, Options } from "rrule";
import { EndCondition } from "./AccountTeachersAddCalendar";

interface RecurrenceOptionsProps {
  makeRecurrent: boolean;
  recurrenceRule: RRule;
  updateRecurrenceRule: (options: Partial<Options>) => void;
  handleFrequencyChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  endCondition: EndCondition;
  handleEndConditionChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  untilValue: string | undefined;
  occurrencesValue: string | undefined;
  byWeekDayDefaultValue: WeekdayStr[] | undefined;
}

const RecurrenceOptions: React.FC<RecurrenceOptionsProps> = ({
  makeRecurrent,
  recurrenceRule,
  updateRecurrenceRule,
  handleFrequencyChange,
  endCondition,
  handleEndConditionChange,
  untilValue,
  occurrencesValue,
  byWeekDayDefaultValue,
}) => {
  if (!makeRecurrent) return null;

  return (
    <div className="w-full p-2">
      <div className="flex flex-row gap-2 w-1/2">
        <Input
          label="Repeat every"
          name="interval"
          type="number"
          min={1}
          value={recurrenceRule.options.interval.toString()}
          onChange={(e) =>
            updateRecurrenceRule({ interval: Number(e.target.value) })
          }
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
  );
};

export default RecurrenceOptions;
