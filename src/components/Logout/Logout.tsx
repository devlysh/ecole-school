"use client";

import { logoutRequest } from "@/app/api/v1/logout/request";
import { useEffect } from "react";

const Logout = () => {
  useEffect(() => {
    logoutRequest();
  }, []);

  return <div>Logout</div>;
};

export default Logout;
