import React from "react";
import AccountLayout from "@/components/Account/layout";
import AccountTeachersAdd from "@/components/Account/AccountTeachers/AccountTeachersAdd";

const AccountTeachersAddPage = async () => {
  return (
    <AccountLayout>
      <AccountTeachersAdd />
    </AccountLayout>
  );
};

export default AccountTeachersAddPage;
