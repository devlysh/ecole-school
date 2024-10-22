"use client";

import { logoutRequest } from "@/app/api/v1/logout/request";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Logout = () => {
  const router = useRouter();

  useEffect(() => {
    logoutRequest().then(() => router.push("/"));
  }, []);

  return null;
};

export default Logout;
