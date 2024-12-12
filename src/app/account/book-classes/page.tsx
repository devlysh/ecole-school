import React from "react";
import AccountLayout from "@/components/Account/layout";
import BookClasses from "@/components/Account/AccountBookClasses";

const AccountSettingsPage = async () => {
  return (
    <AccountLayout>
      <BookClasses />
    </AccountLayout>
  );
};

export default AccountSettingsPage;
