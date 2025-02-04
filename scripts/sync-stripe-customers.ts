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
        expand: ["data.subscriptions"],
      });

      for (const customer of customers.data) {
        const { id: stripeCustomerId, email, name } = customer;

        if (!email) {
          console.warn(
            `Customer ${stripeCustomerId} has no email, skipping...`
          );
          continue;
        }

        const existingUser = await prisma.user.findUnique({
          where: { email },
          include: { student: true },
        });

        if (!existingUser) {
          // Create new user and student
          await prisma.user.create({
            data: {
              email,
              passwordHash: "",
              name,
              dateJoined: new Date(),
              isActive: false,
              settings: {},
              student: {
                create: {
                  stripeCustomerId,
                },
              },
            },
          });
        } else if (!existingUser.student) {
          // User exists but is not a student yet
          await prisma.student.create({
            data: {
              userId: existingUser.id,
              stripeCustomerId,
            },
          });
        } else {
          // Update existing student
          await prisma.student.update({
            where: { userId: existingUser.id },
            data: {
              stripeCustomerId,
            },
          });
        }

        console.log(`Synced customer: ${email} (${stripeCustomerId})`);
      }

      hasMore = customers.has_more;
      startingAfter = customers.data[customers.data.length - 1]?.id;
    }

    console.log("Stripe customers synced successfully.");
  } catch (err: unknown) {
    console.error("Error syncing Stripe customers:", err);
  } finally {
    await prisma.$disconnect();
  }
};

syncStripeCustomers();
