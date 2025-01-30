"use client";

import { logoutRequest } from "@/app/api/v1/logout/request";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";

const Logout = () => {
  const router = useRouter();

  useEffect(() => {
    logoutRequest()
      .then(() => router.push("/"))
      .catch((err) => toast.error(err.message));
  }, [router]);

  return null;
};

export default Logout;
