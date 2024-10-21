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

export const syncStripeCustomers = async () => {
  try {
    let hasMore = true;
    let startingAfter: string | undefined;

    while (hasMore) {
      const customers = await stripe.customers.list({
        limit: 100,
        starting_after: startingAfter,
      });

      for (const customer of customers.data) {
        const { id: stripeCustomerId, email, name } = customer;

        if (!email) {
          console.warn(
            `Customer ${stripeCustomerId} has no email, skipping...`
          );
          continue;
        }

        await prisma.user.upsert({
          where: { email },
          update: {
            stripeCustomerId,
            name: name ?? "Unknown",
          },
          create: {
            email,
            passwordHash: "",
            name: name ?? "Unknown",
            dateJoined: new Date(),
            isActive: false,
            stripeCustomerId,
          },
        });
        console.log(`Synced customer: ${email} (${stripeCustomerId})`);
      }

      hasMore = customers.has_more;
      startingAfter = customers.data[customers.data.length - 1]?.id;
    }

    console.log("Stripe customers synced successfully.");
  } catch (error) {
    console.error("Error syncing Stripe customers:", error);
  } finally {
    await prisma.$disconnect();
  }
};

syncStripeCustomers();
