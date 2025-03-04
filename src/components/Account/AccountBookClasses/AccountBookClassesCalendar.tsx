"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { AvailableCalendarSlot } from "@/lib/types";
import { addDays, format, startOfWeek, getDay } from "date-fns";

interface AccountBookClassesCalendarProps {
  availableSlots: AvailableCalendarSlot[];
  selectedSlots: Date[];
  hours: number[];
  setSelectedSlots: React.Dispatch<React.SetStateAction<Date[]>>;
  isRecurrentSchedule: boolean;
  fetchAvailableSlots: (startDate: Date, endDate: Date) => void;
  clearAvailableSlots: () => void;
}

export const AccountBookClassesCalendar: React.FC<
  AccountBookClassesCalendarProps
> = ({
  availableSlots,
  selectedSlots,
  hours,
  setSelectedSlots,
  isRecurrentSchedule,
  fetchAvailableSlots,
  clearAvailableSlots,
}) => {
  const baselineDate = useMemo(() => {
    return isRecurrentSchedule
      ? startOfWeek(new Date())
      : addDays(new Date(), 1);
  }, [isRecurrentSchedule]);

  const [weekOffset, setWeekOffset] = useState<number>(0);

  const weekStart = useMemo(
    () => addDays(baselineDate, weekOffset * 7),
    [baselineDate, weekOffset]
  );
  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart]);

  const [hourRange, setHourRange] = useState<number[]>(() => hours);

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      fetchAvailableSlots(weekStart, weekEnd);
      isFirstRender.current = false;
    }
  }, [weekStart, weekEnd, fetchAvailableSlots]);

  const handleWeekChange = useCallback(
    (direction: number) => {
      setWeekOffset((prev) => prev + direction);
      clearAvailableSlots();
    },
    [clearAvailableSlots]
  );

  const handleHourScroll = useCallback((direction: number) => {
    setHourRange((prev) => {
      const newRange = prev.map((h) => h + direction);
      return newRange[0] < 0 || newRange[newRange.length - 1] > 23
        ? prev
        : newRange;
    });
  }, []);

  const weekDates = useMemo(() => {
    const dates: Date[] = [];
    for (let d = new Date(weekStart); d <= weekEnd; d = addDays(d, 1)) {
      dates.push(new Date(d));
    }
    return dates;
  }, [weekStart, weekEnd]);

  const renderHour = (hour: number) => (
    <div
      className="h-8 flex justify-center items-center text-xs whitespace-nowrap"
      key={hour}
    >
      {convertTo12Hours(hour)}
    </div>
  );

  const renderDayHeader = (date: Date) => (
    <div
      className="w-full h-8 flex justify-center items-center"
      key={date.getTime()}
    >
      {getDayLabel(date, isRecurrentSchedule)}
    </div>
  );

  const renderSlot = (originalDate: Date, hour: number) => {
    const date = new Date(originalDate.getTime());
    date.setHours(hour, 0, 0, 0);

    const isAvailable = availableSlots.some(
      (slot) => slot.day === date.getDay() && slot.hour === date.getHours()
    );

    const isSelected = selectedSlots.some(
      (slot) => slot.getTime() === date.getTime()
    );

    const slotClasses = [
      "w-full h-8 text-xs flex justify-center items-center rounded-lg",
      isSelected
        ? "bg-green-100 border border-green-200"
        : isAvailable
          ? "bg-blue-100 border border-gray-200 rounded-lg cursor-pointer"
          : "bg-gray-100 border border-gray-200",
    ].join(" ");

    const handleSlotClick = () => {
      if (!isAvailable) return;

      setSelectedSlots((prev) => {
        const alreadySelected = prev.some(
          (slot) => slot.getTime() === date.getTime()
        );

        return alreadySelected
          ? prev.filter((slot) => slot.getTime() !== date.getTime())
          : [...prev, date];
      });
    };

    return (
      <div
        className={slotClasses}
        key={`${date.getTime()}-${hour}`}
        onClick={handleSlotClick}
      >
        {`${format(date, "HH:mm")}-${format(date, "HH:55")}`}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <WeekNavigation
        handlePrevWeek={() => handleWeekChange(-1)}
        handleNextWeek={() => handleWeekChange(1)}
        currentWeekStart={weekStart}
        oneWeek={isRecurrentSchedule}
      />
      <div className="flex gap-8 w-full">
        <HourScroller
          hourRange={hourRange}
          handleHourScrollUp={() => handleHourScroll(-1)}
          handleHourScrollDown={() => handleHourScroll(1)}
          renderHour={renderHour}
        />
        <CalendarGrid
          weekDates={weekDates}
          hourRange={hourRange}
          renderDayHeader={renderDayHeader}
          renderSlot={renderSlot}
        />
      </div>
    </div>
  );
};

const WeekNavigation: React.FC<{
  handlePrevWeek: () => void;
  handleNextWeek: () => void;
  currentWeekStart: Date;
  oneWeek: boolean;
}> = ({ handlePrevWeek, handleNextWeek, currentWeekStart, oneWeek }) => (
  <div className="flex justify-between items-center">
    {!oneWeek && (
      <button onClick={handlePrevWeek} disabled={oneWeek}>
        &larr; Prev Week
      </button>
    )}
    <div>
      {!oneWeek &&
        `${format(currentWeekStart, "yyyy-MM-dd")} - ${format(
          addDays(currentWeekStart, 6),
          "yyyy-MM-dd"
        )}`}
    </div>
    {!oneWeek && <button onClick={handleNextWeek}>Next Week &rarr;</button>}
  </div>
);

const HourScroller: React.FC<{
  hourRange: number[];
  handleHourScrollUp: () => void;
  handleHourScrollDown: () => void;
  renderHour: (hour: number) => JSX.Element;
}> = ({ hourRange, handleHourScrollUp, handleHourScrollDown, renderHour }) => (
  <div className="flex flex-col gap-2">
    <div
      className="w-full h-8 flex justify-center items-center cursor-pointer"
      onClick={handleHourScrollUp}
    >
      ↑
    </div>
    <div className="flex flex-col gap-2">{hourRange.map(renderHour)}</div>
    <div
      className="w-full h-8 flex justify-center items-center cursor-pointer"
      onClick={handleHourScrollDown}
    >
      ↓
    </div>
  </div>
);

const CalendarGrid: React.FC<{
  weekDates: Date[];
  hourRange: number[];
  renderDayHeader: (date: Date) => JSX.Element;
  renderSlot: (date: Date, hour: number) => JSX.Element;
}> = ({ weekDates, hourRange, renderDayHeader, renderSlot }) => (
  <div className="flex flex-col gap-2 w-full">
    <div className="flex gap-2 text-xs">{weekDates.map(renderDayHeader)}</div>
    <div className="flex flex-row gap-2 w-full">
      {weekDates.map((date) => (
        <div className="flex flex-col gap-2 w-full" key={date.getTime()}>
          {hourRange.map((hour) => renderSlot(date, hour))}
        </div>
      ))}
    </div>
  </div>
);

function convertTo12Hours(hour: number): string {
  return `${hour % 12 || 12} ${hour < 12 ? "am" : "pm"}`;
}

function getDayLabel(date: Date, hideDates = false): string {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  if (hideDates) {
    return dayNames[getDay(date)];
  }
  return `${dayNames[getDay(date)]} ${format(date, "M/d")}`;
}
