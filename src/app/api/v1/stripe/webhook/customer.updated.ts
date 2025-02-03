import logger from "@/lib/logger";
import { StudentsRepository } from "@domain/repositories/Students.repository";
import { UsersRepository } from "@domain/repositories/Users.repository";
import Stripe from "stripe";

export const handleCustomerUpdated = async (eventData: Stripe.Customer) => {
  const { email, id: stripeCustomerId } = eventData;

  if (!email) {
    logger.error("Email is missing from the Stripe customer data");
    return;
  }

  try {
    const existingStudent = await new UsersRepository().findStudentByEmail(
      email
    );

    if (!existingStudent) {
      logger.warn(
        { email, stripeCustomerId },
        "Received customer.updated event for non-existent user"
      );
      return;
    }

    if (!existingStudent.student) {
      logger.warn(
        { email, stripeCustomerId },
        "Received customer.updated event for user without student record"
      );
      return;
    }

    // Only update if the stripeCustomerId has changed
    if (existingStudent.student.stripeCustomerId !== stripeCustomerId) {
      await new StudentsRepository().updateStripeCustomerId(
        existingStudent.id,
        stripeCustomerId
      );
      logger.info(
        { email, stripeCustomerId },
        "Updated student's Stripe customer ID"
      );
    }
  } catch (err: unknown) {
    logger.error({ err, email }, "Error handling customer update");
  }
};
