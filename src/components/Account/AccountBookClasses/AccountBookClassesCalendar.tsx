"use client";

export const AccountBookClassesCalendar: React.FC = () => {
  const props = {
    hours: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    days: [1, 2, 3, 4, 5, 6, 7],
  };

  return (
    <div className="flex gap-8 w-full">
      <div className="flex flex-col gap-2">
        <div className="w-full h-8 flex justify-center items-center">⬆️</div>
        <div className="flex flex-col gap-2">
          {props.hours.map((hour) => (
            <div
              className="h-8 flex justify-center items-center text-xs whitespace-nowrap"
              key={hour}
            >{`${convertTo12Hours(hour)}`}</div>
          ))}
        </div>
        <div className="w-full h-8 flex justify-center items-center">⬇️</div>
      </div>
      <div className="flex flex-col gap-2 w-full">
        <div className="flex gap-2">
          {props.days.map((day) => (
            <div
              className="w-full h-8 flex justify-center items-center"
              key={day}
            >
              {convertToDay(day)}
            </div>
          ))}
        </div>
        <div className="flex flex-row gap-2 w-full">
          {props.days.map((day) => (
            <div className="flex flex-col gap-2 w-full" key={day}>
              {props.hours.map((hour) => (
                <div
                  className="w-full h-8 text-xs flex justify-center items-center bg-gray-100 border border-gray-200 rounded-lg cursor-pointer"
                  key={`${day}-${hour}`}
                  onClick={() => {
                    console.log(`${day} ${hour}`);
                  }}
                >
                  {`${hour}:00-${hour}:55`}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

function convertTo12Hours(hour: number) {
  return `${hour % 12 || 12} ${hour < 12 ? "am" : "pm"}`;
}

function convertToDay(day: number) {
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][day - 1];
}
