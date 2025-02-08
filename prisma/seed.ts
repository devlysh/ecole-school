/* eslint-disable @typescript-eslint/no-require-imports */
import { LanguageCode } from "@/lib/types";
import { PrismaClient } from "@prisma/client";

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

  // Seed roles
  const roles = [
    { name: "admin", description: "Administrator role" },
    { name: "student", description: "Student role" },
    { name: "teacher", description: "Teacher role" },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }

  console.log("Roles table populated!");

  // Seed languages
  const languages = [
    { code: LanguageCode.EN, name: "English" },
    { code: LanguageCode.ES, name: "Spanish" },
    { code: LanguageCode.FR, name: "French" },
    { code: LanguageCode.DE, name: "German" },
    { code: LanguageCode.IT, name: "Italian" },
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
