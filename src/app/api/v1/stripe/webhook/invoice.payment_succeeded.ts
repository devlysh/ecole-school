import logger from "@/lib/logger";
import { CreditsRepository } from "@domain/repositories/Credits.repository";
import { UsersRepository } from "@domain/repositories/Users.repository";
import { CreditsService } from "@domain/services/Credits.service";
import Stripe from "stripe";

export async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const userRepository = new UsersRepository();
  const creditService = new CreditsService(new CreditsRepository());

  const email = getEmail(invoice);

  if (!email) {
    logger.error("Email not found");
    return;
  }

  const user = await userRepository.findStudentByEmail(email);

  if (!user) {
    logger.error("User not found");
    return;
  }

  const creditsAmount = getCreditsAmount(invoice);
  await creditService.addCredits(user.id, creditsAmount);

  logger.info(`Added ${creditsAmount} credits to ${email}`);
}

const getCreditsAmount = (invoice: Stripe.Invoice) => {
  return Number(invoice.lines.data[0].price?.metadata.credits);
};

const getEmail = (invoice: Stripe.Invoice) => {
  return invoice.customer_email;
};
