import React from "react";
import { Button } from "@nextui-org/react";
import logger from "@/lib/logger";
import { toast, ToastContainer } from "react-toastify";

interface ScheduleTeacherSectionProps {
  resetAssignedTeacher: () => Promise<void>;
  deleteBookedClasses: () => Promise<void>;
}

const ScheduleTeacherSection: React.FC<ScheduleTeacherSectionProps> = ({
  resetAssignedTeacher,
  deleteBookedClasses,
}) => {
  return (
    <>
      <ToastContainer />
      <div>
        <Button
          onClick={() => {
            logger.debug("DEBUG RESET SCHEDULE");
            deleteBookedClasses();
            toast.success("Teacher classes deleted");
          }}
        >
          Reset Schedule
        </Button>
        <Button
          onClick={() => {
            logger.debug("DEBUG CHANGE TEACHER");
            resetAssignedTeacher();
            toast.success("Teacher unassigned");
          }}
        >
          Change Teacher
        </Button>
      </div>
    </>
  );
};

export default ScheduleTeacherSection;
