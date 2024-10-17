/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const main = async () => {
  // Seed currencies
  const currencies = [
    { code: "USD", name: "$ USD" },
    { code: "EUR", name: "€ EUR" },
    { code: "GBP", name: "£ GBP" },
    { code: "CAD", name: "$ CAD" },
    { code: "AUD", name: "$ AUD" },
  ];

  for (const currency of currencies) {
    await prisma.currency.upsert({
      where: { code: currency.code },
      update: {},
      create: currency,
    });
  }

  console.log("Currencies table populated!");

  // Seed languages
  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "it", name: "Italian" },
    { code: "uk", name: "Ukrainian" },
  ];

  for (const language of languages) {
    await prisma.language.upsert({
      where: { code: language.code },
      update: {},
      create: language,
    });
  }

  console.log("Languages table populated!");
};

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
