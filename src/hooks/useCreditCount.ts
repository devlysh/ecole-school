import { fetchCreditCount } from "@/app/api/v1/credits/request";
import { useEffect, useState } from "react";

export const useCreditCount = () => {
  const [creditCount, setCreditCount] = useState(0);

  useEffect(() => {
    const loadCreditCount = async () => {
      const creditCount = await fetchCreditCount();
      setCreditCount(creditCount);
    };
    loadCreditCount();
  }, []);

  return creditCount;
};
