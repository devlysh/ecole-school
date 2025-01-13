import React from "react";
import AccountLayout from "@/components/Account/layout";
import MyClasses from "@/components/Account/AccountMyClasses";

const AccountMyClassesPage = async () => {
  return (
    <AccountLayout>
      <MyClasses />
    </AccountLayout>
  );
};

export default AccountMyClassesPage;
