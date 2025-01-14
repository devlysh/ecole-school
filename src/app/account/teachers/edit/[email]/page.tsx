"use server";

import React from "react";
import AccountLayout from "@/components/Account/layout";
import AccountTeachersForm from "@/components/Account/AccountTeachers/AccountTeachersForm";
import logger from "@/lib/logger";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { convertToRruleDate } from "@/lib/utils";

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
