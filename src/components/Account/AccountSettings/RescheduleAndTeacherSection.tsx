import React from "react";
import { Button } from "@nextui-org/react";
import { toast } from "react-toastify";

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
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-row gap-4">
          <div className="flex flex-col w-3/4">
            <div className="text-md font-bold">Reset schedule</div>
            <div className="text-sm">
              Press the button if you want to clear your booked lessons
            </div>
          </div>
          <div className="w-1/4">
            <Button
              onClick={() => {
                deleteBookedClasses();
                toast.success("Schedule removed");
              }}
              className="block w-full"
            >
              Reset Schedule
            </Button>
          </div>
        </div>
        <div className="flex flex-row gap-4">
          <div className="flex flex-col w-3/4">
            <div className="text-md font-bold">Change teacher</div>
            <div className="text-sm">Change your current teacher</div>
          </div>
          <div className="w-1/4">
            <Button
              onClick={() => {
                resetAssignedTeacher();
                toast.success("Teacher unassigned");
              }}
              className="block w-full"
            >
              Change Teacher
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ScheduleTeacherSection;
