import logger from "@/lib/logger";
import { CreditRepository } from "@domain/repositories/Credit.repository";
import { UserRepository } from "@domain/repositories/User.repository";
import { CreditService } from "@domain/services/Credit.service";
import Stripe from "stripe";

export async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const userRepository = new UserRepository();
  const creditService = new CreditService(new CreditRepository());

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
