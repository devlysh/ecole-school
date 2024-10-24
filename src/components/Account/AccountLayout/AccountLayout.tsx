import React from "react";
import AccountSidebar from "../AccountSidebar";
import { redirect } from "next/navigation";
import { verifyAccessToken } from "@/lib/jwt";

const AccountLayout = async ({ children }: { children: React.ReactNode }) => {
  const { name, roles } = await verifyAccessToken();

  if (!name || !roles) {
    redirect("/logout");
  }
  return (
    <div className="flex justify-center max-w-screen-xl mx-auto">
      <AccountSidebar name={name} roles={roles} />
      <main className="flex-1 p-4">{children}</main>
    </div>
  );
};

export default AccountLayout;
