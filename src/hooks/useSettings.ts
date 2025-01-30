import { deleteBookedClassesRequest } from "@/app/api/v1/booked-classes/request";
import { resetAssignedTeacherRequest } from "@/app/api/v1/assigned-teacher/request";
import {
  getSettingsRequest,
  updateSettingsRequest,
} from "@/app/api/v1/settings/request";
import logger from "@/lib/logger";
import { Settings } from "@/lib/types";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const useSettings = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);

  const resetAssignedTeacher = useCallback(async () => {
    try {
      await resetAssignedTeacherRequest();
      toast.success("Teacher reset successfully");
    } catch (err: unknown) {
      setError("Failed to reset assigned teacher");
      toast.error("Failed to reset assigned teacher");
      logger.error(err, "Failed to reset assigned teacher");
    }
  }, []);

  const deleteBookedClasses = useCallback(async () => {
    try {
      await deleteBookedClassesRequest();
      toast.success("Booked classes deleted successfully");
    } catch (err: unknown) {
      setError("Failed to delete booked classes");
      toast.error("Failed to delete booked classes");
      logger.error(err, "Failed to delete booked classes");
    }
  }, []);

  const setName = useCallback(async (name: string) => {
    try {
      await updateSettingsRequest({ name });
      setSettings((prevSettings) => ({
        ...(prevSettings as Settings),
        name,
      }));
      toast.success("Name updated successfully");
    } catch (err: unknown) {
      setError("Failed to set name");
      toast.error("Failed to set name");
      logger.error(err, "Failed to set name");
    }
  }, []);

  const fetchSettings = async () => {
    try {
      const settings = await getSettingsRequest();
      if (settings) {
        setSettings(settings);
      }
    } catch (err: unknown) {
      setError("Failed to load settings");
      toast.error("Failed to load settings");
      logger.error(err, "Failed to fetch settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    resetAssignedTeacher,
    deleteBookedClasses,
    setName,
  };
};
