import React from "react";
import AccountLayout from "@/components/Account/layout";
import AccountTeachers from "@/components/Account/AccountTeachers";
import { Language, Role, Teacher } from "@/lib/types";
import prisma from "@/lib/prisma";

const AccountTeachersPage = async () => {
  const users = await prisma.user.findMany({
    where: {
      roles: {
        some: {
          role: {
            name: Role.TEACHER,
          },
        },
      },
      teacher: {
        isNot: null,
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      settings: true,
      teacher: {
        select: {
          languages: {
            select: {
              language: {
                select: {
                  name: true,
                  code: true,
                },
              },
            },
          },
        },
      },
      roles: {
        select: {
          role: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  const teachers: Teacher[] = users.map((user) => ({
    id: user.id,
    name: user.name || "",
    email: user.email,
    roles: user.roles.map((r) => r.role),
    languages: user.teacher?.languages.map((l) => l.language as Language),
  }));

  return (
    <AccountLayout>
      <AccountTeachers teachers={teachers} />
    </AccountLayout>
  );
};

export default AccountTeachersPage;
