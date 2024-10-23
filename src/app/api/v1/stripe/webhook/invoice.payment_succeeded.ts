import Stripe from "stripe";

export async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  // Implement your logic here
  console.log("Invoice payment succeeded:", invoice.id);
}
