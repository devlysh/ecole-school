"use server";

import React from "react";
import AccountLayout from "@/components/Account/layout";
import AccountTeachersForm from "@/components/Account/AccountTeachers/AccountTeachersForm";
import { LanguagesRepository } from "@domain/repositories/Languages.repository";

interface AccountTeachersEditPageProps {
  params: {
    email: string;
  };
}

export default async function AccountTeachersEditPage({
  params,
}: AccountTeachersEditPageProps) {
  const email = decodeURIComponent(params.email);
  const languages = await new LanguagesRepository().findAll();

  return (
    <AccountLayout>
      <div className="flex w-full">
        <div className="w-full">
          <h1>Edit Teacher</h1>
          <AccountTeachersForm email={email} languages={languages} />
        </div>
      </div>
    </AccountLayout>
  );
}
