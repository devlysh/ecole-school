import logger from "@/lib/logger";
import { ClassItem } from "@/lib/types";
import { useEffect, useState } from "react";
import { addMonths, addWeeks } from "date-fns";
import { getWeeklyOccurencesForPeriod } from "@/lib/utils";
import { fetchBookedClasses } from "src/app/api/v1/booked-classes/request";

export const useClasses = (creditCount: number) => {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadClasses = async () => {
      try {
        let classes = await fetchBookedClasses();
        classes = expandClasses(classes);
        classes = filterClasses(classes);
        classes = sortClasses(classes);
        classes = markClassesWithCredit(classes, creditCount);

        setClasses(classes);
      } catch (err) {
        logger.error({ err }, "Failed to fetch classes");
      } finally {
        setLoading(false);
      }
    };
    loadClasses();
  }, [creditCount]);

  return { classes, loading, setClasses };
};

const expandClasses = (classes: ClassItem[]) => {
  return classes.flatMap((classItem: ClassItem) => {
    const classDate = new Date(classItem.date);
    const isRecurring = classItem.recurring === true;
    const classes = [];

    if (isRecurring) {
      const occurencesForMonth = getWeeklyOccurencesForPeriod(
        classDate,
        addMonths(classDate, 1)
      );

      for (let i = 0; i < occurencesForMonth.length; i++) {
        const recurringClassDate = addWeeks(classDate, i);

        const recurringClassItem = {
          ...classItem,
          id: encodeClassId(classItem.id, i),
        };

        classes.push({
          ...recurringClassItem,
          date: recurringClassDate,
        });
      }
    } else {
      classes.push({ ...classItem, id: classItem.id.toString() });
    }

    return classes;
  });
};

const filterClasses = (classes: ClassItem[]) => {
  return classes.filter((classItem) => {
    return new Date() < new Date(classItem.date);
  });
};

const sortClasses = (classes: ClassItem[]) => {
  return classes.sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
};

const markClassesWithCredit = (classes: ClassItem[], creditCount: number) => {
  return classes.map((classItem, index) => {
    if (creditCount > index) {
      return { ...classItem, hasCredit: true };
    }
    return { ...classItem, hasCredit: false };
  });
};

export const encodeClassId = (classId: string, index: number) => {
  return encodeURIComponent(`recurring-${classId}-${index}`);
};

export const decodeClassId = (
  classId: string
): { bookedClassId: number; index: number } => {
  const [, bookedClassId, index] = classId.split("-");
  return { bookedClassId: Number(bookedClassId), index: Number(index) };
};
