"use client";

import { logoutRequest } from "@/app/api/v1/logout/request";

const Logout = async () => {
  await logoutRequest();

  return <div>Logged out</div>;
};

export default Logout;
