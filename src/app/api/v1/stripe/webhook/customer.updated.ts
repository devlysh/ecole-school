import logger from "@/lib/logger";
import prisma from "@/lib/prisma";
import Stripe from "stripe";

export const handleCustomerUpdated = async (eventData: Stripe.Customer) => {
  const { email, id: stripeCustomerId } = eventData;

  if (!email) {
    logger.error("Email is missing from the Stripe customer data");
    return;
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      await prisma.user.create({
        data: {
          email,
          passwordHash: "",
          name: eventData.name ?? "Unknown",
          dateJoined: new Date(),
          isActive: false,
          stripeCustomerId,
        },
      });
    } else {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          stripeCustomerId,
          name: eventData.name ?? "Unknown",
        },
      });
    }
  } catch (err) {
    logger.error({ err, email }, "Error handling customer update");
  }
};
