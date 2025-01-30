"use client";

import { getPlansRequest } from "@/app/api/v1/stripe/plans/request";
import { Plan } from "@/lib/types";
import { useState, useEffect } from "react";

const usePlans = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<unknown | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const plans = await getPlansRequest();
        setPlans(plans);
      } catch (err: unknown) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  return { plans, plansLoading: loading, plansError: error };
};

export default usePlans;
