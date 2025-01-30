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
      include: {
        student: true,
      },
    });

    if (!existingUser) {
      logger.warn(
        { email, stripeCustomerId },
        "Received customer.updated event for non-existent user"
      );
      return;
    }

    if (!existingUser.student) {
      logger.warn(
        { email, stripeCustomerId },
        "Received customer.updated event for user without student record"
      );
      return;
    }

    // Only update if the stripeCustomerId has changed
    if (existingUser.student.stripeCustomerId !== stripeCustomerId) {
      await prisma.student.update({
        where: { userId: existingUser.id },
        data: {
          stripeCustomerId,
        },
      });
      logger.info(
        { email, stripeCustomerId },
        "Updated student's Stripe customer ID"
      );
    }
  } catch (err: unknown) {
    logger.error({ err, email }, "Error handling customer update");
  }
};
