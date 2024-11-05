import React from "react";
import AccountLayout from "@/components/Account/layout";
import AccountTeachersForm from "@/components/Account/AccountTeachers/AccountTeachersForm";

const AccountTeachersAddPage = async () => {
  return (
    <AccountLayout>
      <div className="flex w-full">
        <div className="w-full">
          <h1>Add New Teacher</h1>
          <AccountTeachersForm />
        </div>
      </div>
    </AccountLayout>
  );
};

export default AccountTeachersAddPage;
