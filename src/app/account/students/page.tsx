import React from "react";
import AccountLayout from "@/components/Account/layout";
import AccountStudents from "@/components/Account/AccountStudents";

const AccountStudentsPage = async () => {
  return (
    <AccountLayout>
      <AccountStudents />
    </AccountLayout>
  );
};

export default AccountStudentsPage;
