import { Language } from "@/lib/types";
import { useState, useEffect } from "react";

const useLanguages = () => {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<unknown | null>(null);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await fetch("/api/v1/languages");
        if (!response.ok) {
          throw new Error("Failed to fetch languages");
        }
        const data = await response.json();
        setLanguages(data);
      } catch (err) {
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
