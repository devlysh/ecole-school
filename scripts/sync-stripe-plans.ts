import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is missing!");
}

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-09-30.acacia",
});

async function syncSubscriptionPlans() {
  try {
    const prices = await stripe.prices.list({
      expand: ["data.product"],
      limit: 100,
    });

    const activePrices = prices.data.filter((price) => price.active);

    for (const price of activePrices) {
      const product = price.product as Stripe.Product;

      if (product.deleted) {
        console.warn(
          `Product ${product.id} is deleted or missing, skipping...`
        );
        continue;
      }

      const { id: stripeProductId } = product;
      const {
        id: stripePriceId,
        currency,
        unit_amount,
        nickname,
        metadata,
      } = price;

      const credits = parseInt(metadata.credits ?? "0", 10);
      const discount = parseFloat(metadata.discount ?? "0");
      const name = nickname ?? "";
      const cost = unit_amount ?? 0;

      await prisma.subscriptionPlan.upsert({
        where: { stripePriceId },
        update: {
          name,
          cost,
          credits,
          discount,
        },
        create: {
          name,
          cost,
          credits,
          discount,
          stripeProductId,
          stripePriceId,
          currency: {
            connectOrCreate: {
              where: { code: currency.toUpperCase() },
              create: { code: currency, name: currency.toUpperCase() },
            },
          },
        },
      });
      console.log(`Synced subscription plan: ${name} (${stripePriceId})`);
    }

    console.log("Subscription plans synced successfully.");
  } catch (error) {
    console.error("Error syncing subscription plans:", error);
  } finally {
    await prisma.$disconnect();
  }
}

syncSubscriptionPlans();
