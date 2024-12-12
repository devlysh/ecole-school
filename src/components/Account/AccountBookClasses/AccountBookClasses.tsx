import { Button, Switch } from "@nextui-org/react";
import React from "react";
import { AccountBookClassesCalendar } from "./AccountBookClassesCalendar";

const AccountBookClasses: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex flex-row justify-between">
        <div className="flex flex-col gap-2">
          <div className="text-2xl font-bold">Book your classes:</div>
          <div className="text-sm text-gray-500">
            Choose days and times you would like to have your classes
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Button>Book</Button>
          <Switch>Fixed schedule</Switch>
        </div>
      </div>
      <AccountBookClassesCalendar />
    </div>
  );
};

export default AccountBookClasses;
