"use client";

import logger from "@/lib/logger";
import { Answer, Language } from "@/lib/types";
import { Card } from "@nextui-org/card";
import { Spinner } from "@nextui-org/react";
import { Currency } from "@prisma/client";
import { useState, useEffect } from "react";

const UnderConstruction = () => {
  const [quizAnswers, setQuizAnswers] = useState<Answer[]>();
  const [language, setLanguage] = useState<Language["code"]>();
  const [currency, setCurrency] = useState<Currency["code"]>();

  useEffect(() => {
    try {
      const rawQuizAnswers = localStorage.getItem("quizAnswers");
      if (rawQuizAnswers) {
        setQuizAnswers(JSON.parse(rawQuizAnswers));
      }

      const rawLanguage = localStorage.getItem("language");
      if (rawLanguage) {
        setLanguage(rawLanguage);
      }

      const rawCurrency = localStorage.getItem("currency");
      if (rawCurrency) {
        setCurrency(rawCurrency);
      }
    } catch (e) {
      logger.error("Failed to parse quiz answers from localStorage", e);
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
        {quizAnswers ? (
          <>
            {quizAnswers?.map((answer, i) => (
              <div key={answer.id}>
                <div className="p-4">
                  <div className="italic">{answer.question}</div>
                  <div className="font-bold">{answer.text}</div>
                </div>
                {i < quizAnswers.length - 1 && <hr />}
              </div>
            ))}
            <hr />
            <div className="p-4">
              <div className="italic">Language</div>
              <div className="font-bold">{language}</div>
            </div>
            <hr />
            <div className="p-4">
              <div className="italic">Currency</div>
              <div className="font-bold">{currency}</div>
            </div>
          </>
        ) : (
          <Spinner size="sm" color="secondary" />
        )}
      </Card>
    </main>
  );
};

export default UnderConstruction;
