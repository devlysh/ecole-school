"use client";

import React, { useEffect, useState } from "react";
import AccountSidebarItem from "./AccountSidebarItem";
import { RoleName } from "@/lib/types";
import clsx from "clsx";
import { fetchRolesRequest } from "@/app/api/v1/roles/request";

interface SidebarProps {
  name: string;
  className?: string;
}

const AccountSidebar: React.FC<SidebarProps> = ({ name, className }) => {
  const [roles, setRoles] = useState<RoleName[]>([]);
  const isAdmin = roles.includes(RoleName.ADMIN);
  const isStudent = roles.includes(RoleName.STUDENT);
  const isTeacher = roles.includes(RoleName.TEACHER);

  useEffect(() => {
    const fetchRoles = async () => {
      const roles = await fetchRolesRequest();
      setRoles(roles);
    };
    fetchRoles();
  }, []);

  return (
    <aside className={clsx("w-1/4 bg-gray-200 p-4", className)}>
      <h2 className="text-lg font-bold">Welcome, {name}!</h2>
      <ul className="mt-4">
        {isAdmin && (
          <AccountSidebarItem href="/account/teachers" label="Teachers" />
        )}

        {isAdmin && (
          <AccountSidebarItem href="/account/students" label="Students" />
        )}

        {(isStudent || isTeacher) && (
          <AccountSidebarItem href="/account/my-classes" label="My Classes" />
        )}

        {isStudent && (
          <AccountSidebarItem
            href="/account/book-classes"
            label="Book Classes"
          />
        )}

        {isStudent && (
          <AccountSidebarItem href="/account/settings" label="Settings" />
        )}
      </ul>
    </aside>
  );
};

export default AccountSidebar;
