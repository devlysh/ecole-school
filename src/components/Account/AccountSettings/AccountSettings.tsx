"use client";

import React from "react";
import NameAndEmailForm from "./NameAndEmailForm";
import RescheduleAndTeacherSection from "./RescheduleAndTeacherSection";
import PasswordChangeForm from "./PasswordChangeForm";
import TimeSetupForm from "./TimeSetupForm";
import SubscriptionDetails from "./SubscriptionDetails";
import { useSettings } from "@/hooks/useSettings";

const AccountSettingsPage: React.FC = () => {
  const {
    settings,
    loading,
    resetAssignedTeacher,
    deleteBookedClasses,
    setName,
  } = useSettings();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!settings || !settings.name || !settings.email) {
    return <div>No settings available.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1>Account Settings</h1>
      <NameAndEmailForm
        name={settings.name}
        email={settings.email}
        setName={setName}
      />
      <RescheduleAndTeacherSection
        resetAssignedTeacher={resetAssignedTeacher}
        deleteBookedClasses={deleteBookedClasses}
      />
      <PasswordChangeForm />
      <TimeSetupForm />
      <SubscriptionDetails />
    </div>
  );
};

export default AccountSettingsPage;
