"use client";

import { useState, useCallback } from "react";

const useRescheduleDate = () => {
  const [rescheduleDate, setRescheduleDate] = useState<Date | null>(null);

  const handleChangeRescheduleDate = useCallback((date: Date) => {
    setRescheduleDate(date);
  }, []);

  return {
    rescheduleDate,
    handleChangeRescheduleDate,
  };
};

export default useRescheduleDate;
