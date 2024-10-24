import React from "react";
import Link from "next/link";

const AccountSidebarItem = ({
  href,
  label,
}: {
  href: string;
  label: string;
}) => {
  return (
    <li className="py-2">
      <Link href={href} className="text-blue-600 hover:underline">
        {label}
      </Link>
    </li>
  );
};

export default AccountSidebarItem;
