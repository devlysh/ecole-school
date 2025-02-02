import React from "react";
import AccountLayout from "@/components/Account/layout";
import MyClassesStudent from "@/components/Account/AccountMyClassesStudent";
import MyClassesTeacher from "@/components/Account/AccountMyClassesTeacher";
import { verifyAccessToken } from "@/lib/jwt";
import { RoleName } from "@/lib/types";

const AccountMyClassesPage = async () => {
  const accessToken = await verifyAccessToken();

  const isTeacher = accessToken?.roles.includes(RoleName.TEACHER);
  const isStudent = accessToken?.roles.includes(RoleName.STUDENT);

  return (
    <AccountLayout>
      {isTeacher && <MyClassesTeacher />}
      {isStudent && <MyClassesStudent />}
    </AccountLayout>
  );
};

export default AccountMyClassesPage;
