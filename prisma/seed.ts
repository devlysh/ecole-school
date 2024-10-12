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

  // Seed subscription plans
  const plans = [
    {
      name: "5 Classes",
      cost: 185,
      durationMonths: 1,
      credits: 5,
      description: null,
      currencyId: (await prisma.currency.findUnique({ where: { code: "USD" } }))
        .id,
    },
    {
      name: "12 Classes",
      cost: 372,
      durationMonths: 1,
      credits: 12,
      description: "16% discount",
      currencyId: (await prisma.currency.findUnique({ where: { code: "USD" } }))
        .id,
    },
    {
      name: "20 Classes",
      cost: 518,
      durationMonths: 1,
      credits: 20,
      description: "30% discount",
      currencyId: (await prisma.currency.findUnique({ where: { code: "USD" } }))
        .id,
    },
    {
      name: "40 Classes",
      cost: 888,
      durationMonths: 1,
      credits: 40,
      description: "40% discount",
      currencyId: (await prisma.currency.findUnique({ where: { code: "USD" } }))
        .id,
    },
  ];

  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { name: plan.name },
      update: {},
      create: plan,
    });
  }

  console.log("Subscription plans table populated!");
};

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
