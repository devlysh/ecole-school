"use client";

import { logoutRequest } from "@/app/api/v1/logout/request";
import { useRouter } from "next/router";

const Logout = async () => {
  const router = useRouter();
  await logoutRequest();

  return router.push("/");
};

export default Logout;
