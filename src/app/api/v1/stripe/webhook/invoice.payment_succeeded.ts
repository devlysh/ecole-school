import logger from "@/lib/logger";
import Stripe from "stripe";

export async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  // Implement your logic here
  logger.info("Invoice payment succeeded:", invoice.id);
}
