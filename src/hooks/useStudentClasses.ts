"use client";

import logger from "@/lib/logger";
import { DisplayBookedClass } from "@/lib/types";
import { useEffect, useState, useCallback } from "react";
import { fetchBookedClassesRequest } from "src/app/api/v1/booked-classes/request";
import { toast } from "react-toastify";
import {
  expandClasses,
  filterClasses,
  markClassesWithCredit,
  sortClasses,
} from "@/lib/utils";

export const useStudentClasses = (creditCount: number) => {
  const [classes, setClasses] = useState<DisplayBookedClass[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchClasses = useCallback(async () => {
    try {
      let { student } = await fetchBookedClassesRequest();
      student = expandClasses(student);
      student = filterClasses(student);
      student = sortClasses(student);
      student = markClassesWithCredit(student, creditCount);

      setClasses(student);
    } catch (err: unknown) {
      toast.error("Failed to fetch classes");
      logger.error(err, "Failed to fetch classes");
    } finally {
      setLoading(false);
    }
  }, [creditCount]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  return { classes, loading, setClasses, fetchClasses };
};
