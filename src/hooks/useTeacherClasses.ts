import { fetchBookedClassesRequest } from "@/app/api/v1/booked-classes/request";
import logger from "@/lib/logger";
import { TeacherClass } from "@/lib/types";
import { expandClasses, filterClasses, sortClasses } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const useTeacherClasses = () => {
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchClasses = useCallback(async () => {
    try {
      let { teacher } = await fetchBookedClassesRequest();

      teacher = expandClasses(teacher);
      teacher = filterClasses(teacher);
      teacher = sortClasses(teacher);

      setClasses(teacher);
      setLoading(false);
    } catch (err: unknown) {
      toast.error("Failed to fetch classes");
      logger.error(err, "Failed to fetch classes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  return {
    classes,
    loading,
    setClasses,
    fetchClasses,
  };
};
