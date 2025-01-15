"use server";

import React from "react";
import AccountLayout from "@/components/Account/layout";
import AccountTeachersForm from "@/components/Account/AccountTeachers/AccountTeachersForm";

interface AccountTeachersEditPageProps {
  params: {
    email: string;
  };
}

export default async function AccountTeachersEditPage({
  params,
}: AccountTeachersEditPageProps) {
  const email = decodeURIComponent(params.email);

  return (
    <AccountLayout>
      <div className="flex w-full">
        <div className="w-full">
          <h1>Edit Teacher</h1>
          <AccountTeachersForm email={email} />
        </div>
      </div>
    </AccountLayout>
  );
}
