"use client";

import { fetchCreditCountRequest } from "@/app/api/v1/credits/request";
import logger from "@/lib/logger";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export const useCreditCount = () => {
  const [creditCount, setCreditCount] = useState(0);

  useEffect(() => {
    const loadCreditCount = async () => {
      try {
        const creditCount = await fetchCreditCountRequest();
        setCreditCount(creditCount);
      } catch (err: unknown) {
        toast.error("Failed to fetch credit count");
        logger.error(err, "Failed to fetch credit count");
      }
    };
    loadCreditCount();
  }, []);

  return creditCount;
};
