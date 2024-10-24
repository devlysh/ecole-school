import React from "react";
import AccountLayout from "@/components/Account/AccountLayout";
import Account from "@/components/Account";

const AccountPage = async () => {
  return (
    <AccountLayout>
      <Account />
    </AccountLayout>
  );
};

export default AccountPage;
