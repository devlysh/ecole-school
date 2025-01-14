import React from "react";
import AccountLayout from "@/components/Account/layout";
import AccountTeachers from "@/components/Account/AccountTeachers";

const AccountTeachersPage = async () => {
  return (
    <AccountLayout>
      <AccountTeachers />
    </AccountLayout>
  );
};

export default AccountTeachersPage;
