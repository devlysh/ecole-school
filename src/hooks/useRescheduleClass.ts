"use client";

import { useState, useCallback } from "react";

const useRescheduleClass = () => {
  const [rescheduleDate, setRescheduleDate] = useState<Date | null>(null);

  const handleChangeRescheduleDate = useCallback((date: Date) => {
    setRescheduleDate(date);
  }, []);

  return {
    rescheduleDate,
    handleChangeRescheduleDate,
  };
};

export default useRescheduleClass;
