"use client";

import React, { useCallback, useState } from "react";
import { AvailableHour } from "@/lib/types";
import { addDays, format, startOfWeek, getDay } from "date-fns";

interface AccountBookClassesCalendarProps {
  availableSlots: AvailableHour[];
  selectedSlots: AvailableHour[];
  hours: number[];
  setSelectedSlots: React.Dispatch<React.SetStateAction<AvailableHour[]>>;
  oneWeek: boolean;
}

export const AccountBookClassesCalendar: React.FC<
  AccountBookClassesCalendarProps
> = ({ availableSlots, selectedSlots, hours, setSelectedSlots, oneWeek }) => {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const now = new Date();
    return oneWeek ? startOfWeek(now) : addDays(now, 1);
  });

  const [hourRange, setHourRange] = useState<number[]>(() => hours);

  const handleNextWeek = useCallback(() => {
    if (!oneWeek) {
      setCurrentWeekStart((prev) => addDays(prev, 7));
    }
  }, [oneWeek]);

  const handlePrevWeek = useCallback(() => {
    if (!oneWeek) {
      setCurrentWeekStart((prev) => addDays(prev, -7));
    }
  }, [oneWeek]);

  const handleHourScrollUp = useCallback(() => {
    setHourRange((prev) => prev.map((h) => h - 1));
  }, []);

  const handleHourScrollDown = useCallback(() => {
    setHourRange((prev) => prev.map((h) => h + 1));
  }, []);

  const weekDates = Array.from({ length: 7 }, (_, i) =>
    addDays(currentWeekStart, i)
  );

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
      {getDayLabel(date, oneWeek)}
    </div>
  );

  const getWeekdayNumber = (date: Date) => getDay(date);

  const renderSlot = (date: Date, hour: number) => {
    const dayOfWeek = getWeekdayNumber(date);

    const isSelected = selectedSlots.some(
      (slot) => slot.day === dayOfWeek && slot.hour === hour
    );
    const isAvailable = availableSlots.some(
      (slot) => slot.day === dayOfWeek && slot.hour === hour
    );

    const baseClasses = "w-full h-8 text-xs flex justify-center items-center";
    const selectedClasses = "bg-green-100 border border-green-200 rounded-lg";
    const availableClasses =
      "bg-blue-100 border border-gray-200 rounded-lg cursor-pointer";
    const defaultClasses = "bg-gray-100 border border-gray-200 rounded-lg";

    let slotClasses = baseClasses;
    if (isSelected) {
      slotClasses += ` ${selectedClasses}`;
    } else if (isAvailable) {
      slotClasses += ` ${availableClasses}`;
    } else {
      slotClasses += ` ${defaultClasses}`;
    }

    const handleSlotClick = () => {
      if (!isAvailable) return;

      setSelectedSlots((prev) => {
        const alreadySelected = prev.some(
          (slot) => slot.day === dayOfWeek && slot.hour === hour
        );
        if (alreadySelected) {
          return prev.filter(
            (slot) => !(slot.day === dayOfWeek && slot.hour === hour)
          );
        } else {
          return [...prev, { day: dayOfWeek, hour }];
        }
      });
    };

    return (
      <div
        className={slotClasses}
        key={`${date.getTime()}-${hour}`}
        onClick={handleSlotClick}
      >
        {`${hour}:00-${hour}:55`}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <WeekNavigation
        handlePrevWeek={handlePrevWeek}
        handleNextWeek={handleNextWeek}
        currentWeekStart={currentWeekStart}
        oneWeek={oneWeek}
      />
      <div className="flex gap-8 w-full">
        <HourScroller
          hourRange={hourRange}
          handleHourScrollUp={handleHourScrollUp}
          handleHourScrollDown={handleHourScrollDown}
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
      {oneWeek &&
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
