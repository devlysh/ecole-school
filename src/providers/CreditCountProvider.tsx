"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { fetchCreditCountRequest } from "@/app/api/v1/credits/request";
import logger from "@/lib/logger";
import { toast } from "react-toastify";

interface CreditCountContextType {
  creditCount: number;
  refreshCreditCount: () => void;
}

const CreditCountContext = createContext<CreditCountContextType | undefined>(
  undefined
);

interface CreditCountProviderProps {
  children: ReactNode;
}

export const CreditCountProvider = ({ children }: CreditCountProviderProps) => {
  const [creditCount, setCreditCount] = useState(0);

  const refreshCreditCount = async () => {
    try {
      const count = await fetchCreditCountRequest();
      setCreditCount(count);
    } catch (error: unknown) {
      toast.error("Failed to fetch credit count");
      logger.error(error, "Failed to fetch credit count");
    }
  };

  useEffect(() => {
    refreshCreditCount();
  }, []);

  return (
    <CreditCountContext.Provider value={{ creditCount, refreshCreditCount }}>
      {children}
    </CreditCountContext.Provider>
  );
};

export const useCreditCountContext = () => {
  const context = useContext(CreditCountContext);
  if (context === undefined) {
    throw new Error(
      "useCreditCountContext must be used within a CreditCountProvider"
    );
  }
  return context;
};
