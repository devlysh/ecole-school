"use client";

import { getLanguagesRequest } from "@/app/api/v1/languages/request";
import { Language } from "@/lib/types";
import { useState, useEffect } from "react";

const useLanguages = () => {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<unknown | null>(null);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const languages = await getLanguagesRequest();
        setLanguages(languages);
      } catch (err: unknown) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLanguages();
  }, []);

  return { languages, languagesLoading: loading, languagesError: error };
};

export default useLanguages;
