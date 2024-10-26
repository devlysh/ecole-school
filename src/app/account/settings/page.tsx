import React from "react";
import AccountLayout from "@/components/Account/layout";
import AccountSettings from "@/components/Account/AccountSettings";

const AccountSettingsPage = async () => {
  return (
    <AccountLayout>
      <AccountSettings />
    </AccountLayout>
  );
};

export default AccountSettingsPage;
