import React from "react";
import AccountLayout from "@/components/Account/layout";
import AccountTeachersForm from "@/components/Account/AccountTeachers/AccountTeachersForm";
import { LanguagesRepository } from "@domain/repositories/Languages.repository";

const AccountTeachersAddPage = async () => {
  const languages = await new LanguagesRepository().findAll();

  return (
    <AccountLayout>
      <div className="flex w-full">
        <div className="w-full">
          <h1>Add New Teacher</h1>
          <AccountTeachersForm languages={languages} />
        </div>
      </div>
    </AccountLayout>
  );
};

export default AccountTeachersAddPage;
