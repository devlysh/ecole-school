"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { RoleName } from "@/lib/types";
import logger from "@/lib/logger";
import { CreditCountProvider } from "@/providers/CreditCountProvider";
import CreditCountBadge from "./CreditCountBadge";

const Header: React.FC<{ roles: string[] }> = ({ roles }) => {
  const { isLoggedIn } = useAuth();

  logger.debug({ roles }, "DEBUG");

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
              {roles.includes(RoleName.STUDENT) && (
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
