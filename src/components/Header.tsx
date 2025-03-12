"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { RoleName } from "@/lib/types";
import { CreditCountProvider } from "@/providers/CreditCountProvider";
import CreditCountBadge from "./CreditCountBadge";
import { fetchRolesRequest } from "@/app/api/v1/roles/request";
import { useEffect, useMemo, useState } from "react";

const Header: React.FC = () => {
  const { isLoggedIn } = useAuth();
  const [roles, setRoles] = useState<RoleName[]>([]);

  const isStudent = useMemo(() => roles.includes(RoleName.STUDENT), [roles]);

  useEffect(() => {
    const fetchRoles = async () => {
      const roles = await fetchRolesRequest();
      setRoles(roles);
    };
    fetchRoles();
  }, []);

  return (
    <header className="flex items-center justify-between max-w-screen-xl mx-auto p-4">
      <Link href="/">
        <Image
          src="/logo.png"
          alt="ECOLE school"
          width={126}
          height={50}
          style={{ width: "auto", height: "auto" }}
          priority
        />
      </Link>
      {isLoggedIn && (
        <>
          <div className="flex w-full justify-end gap-4 px-8">
            <div>
              {isStudent && (
                <CreditCountProvider>
                  <CreditCountBadge />
                </CreditCountProvider>
              )}
            </div>
          </div>
          <Link href="/logout">LOG&nbsp;OUT</Link>
        </>
      )}
    </header>
  );
};

export default Header;
