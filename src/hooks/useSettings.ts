import { deleteBookedClassesRequest } from "@/app/api/v1/booked-classes/request";
import { resetAssignedTeacherRequest } from "@/app/api/v1/reset-assigned-teacher/request";
import { getSettingsRequest } from "@/app/api/v1/settings/request";
import logger from "@/lib/logger";
import { Settings } from "@/lib/types";
import { useCallback, useEffect, useState } from "react";

export const useSettings = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);

  const resetAssignedTeacher = useCallback(async () => {
    try {
      await resetAssignedTeacherRequest();
    } catch (error) {
      logger.error({ error }, "Failed to reset assigned teacher");
      setError("Failed to reset assigned teacher");
    }
  }, []);

  const deleteBookedClasses = useCallback(async () => {
    try {
      await deleteBookedClassesRequest();
    } catch (error) {
      logger.error({ error }, "Failed to delete booked classes");
      setError("Failed to delete booked classes");
    }
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await getSettingsRequest();
        setSettings(settings);
      } catch (err) {
        logger.error({ err }, "Failed to fetch settings");
        setError("Failed to load settings. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    resetAssignedTeacher,
    deleteBookedClasses,
  };
};
