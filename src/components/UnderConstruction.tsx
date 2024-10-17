"use client";

import logger from "@/lib/logger";
import { Card } from "@nextui-org/card";
import { Spinner } from "@nextui-org/spinner";
import { useState, useEffect } from "react";

const UnderConstruction = () => {
  const [localStorageDump, setLodalStorageDump] = useState<Storage>();

  useEffect(() => {
    try {
      setLodalStorageDump(localStorage);
    } catch (err) {
      logger.error(err, "Failed to parse quiz answers from localStorage");
    }
  }, []);

  return (
    <main className="text-center px-5 py-12 text-gray-800">
      {/* Header Section */}
      <h1 className="text-4xl md:text-6xl font-bold mb-6">
        ECOLE Language School
      </h1>
      <h2 className="text-2xl md:text-3xl mb-8">
        Unlock a World of Languages Coming Soon!
      </h2>
      <p className="text-lg max-w-3xl mx-auto mb-3 leading-relaxed">
        We are busy crafting an immersive language-learning experience just for
        you!
      </p>
      <p className="text-lg max-w-3xl mx-auto mb-6 leading-relaxed">
        Our new website is currently under construction and will be launching
        soon.
      </p>

      {/* Newsletter Subscription */}
      <h3 className="text-xl md:text-2xl">
        Want to be the first to know when we launch? Follow the updates!
      </h3>
      <Card className="p-8 m-8">
        {localStorageDump ? (
          <>
            {Object.entries(localStorageDump)?.map(([key, value]) => (
              <div key={key}>
                <div className="p-4">
                  <div className="italic">{key}</div>
                  <div className="font-bold">{value}</div>
                </div>
              </div>
            ))}
          </>
        ) : (
          <Spinner size="sm" color="secondary" />
        )}
      </Card>
    </main>
  );
};

export default UnderConstruction;
