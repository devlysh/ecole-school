import React from "react";
import AccountSidebarItem from "./AccountSidebarItem";
import { RoleName } from "@/lib/types";
import clsx from "clsx";

interface SidebarProps {
  name: string;
  roles: string[];
  className?: string;
}

const AccountSidebar: React.FC<SidebarProps> = ({ name, roles, className }) => {
  const isAdmin = roles.includes(RoleName.ADMIN);
  const isStudent = roles.includes(RoleName.STUDENT);
  const isTeacher = roles.includes(RoleName.TEACHER);
  return (
    <aside className={clsx("w-1/4 bg-gray-200 p-4", className)}>
      <h2 className="text-lg font-bold">Welcome, {name}!</h2>
      <ul className="mt-4">
        {isAdmin && (
          <AccountSidebarItem href="/account/teachers" label="Teachers" />
        )}

        {isTeacher && (
          <AccountSidebarItem
            href="/account/teachers-guide"
            label="How to use Ecole"
          />
        )}

        {isStudent && (
          <AccountSidebarItem href="/account/my-classes" label="My Classes" />
        )}
        {isStudent && (
          <AccountSidebarItem
            href="/account/book-classes"
            label="Book Classes"
          />
        )}

        {isStudent && (
          <AccountSidebarItem
            href="/account/how-to-use"
            label="How to use Ecole"
          />
        )}

        <AccountSidebarItem href="/account/settings" label="Settings" />
      </ul>
    </aside>
  );
};

export default AccountSidebar;
