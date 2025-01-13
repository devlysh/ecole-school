import React from "react";
import AccountLayout from "@/components/Account/layout";
import BookClasses from "@/components/Account/AccountBookClasses";

const AccountBookClassesPage = async () => {
  return (
    <AccountLayout>
      <BookClasses />
    </AccountLayout>
  );
};

export default AccountBookClassesPage;
