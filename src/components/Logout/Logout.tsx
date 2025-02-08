"use client";

import { logoutRequest } from "@/app/api/v1/logout/request";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";

const Logout = () => {
  const router = useRouter();
  const { isLoggedIn, setIsLoggedIn } = useAuth();

  useEffect(() => {
    logoutRequest()
      .then(() => {
        setIsLoggedIn(false);
        router.push("/");
      })
      .catch((err) => toast.error(err.message));
  }, [router, setIsLoggedIn, isLoggedIn]);

  return null;
};

export default Logout;
