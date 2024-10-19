import prisma from "@/lib/prisma";
import Stripe from "stripe";

export async function handlePriceUpdated(eventData: Stripe.Price) {
  const { id, unit_amount, currency, nickname, metadata } = eventData;
  const stripePriceId = id;
  const cost = unit_amount ?? 0;
  const name = nickname ?? "";
  const credits = parseInt(metadata.credits, 10) ?? 0;

  const updatedFields = {
    cost,
    discount: parseFloat(eventData.metadata.discount) ?? null,
    name,
    credits,
    currency: {
      connectOrCreate: {
        where: { code: currency.toUpperCase() },
        create: { code: currency, name: currency.toUpperCase() },
      },
    },
  };

  await prisma.subscriptionPlan.update({
    where: { stripePriceId },
    data: updatedFields,
  });
}
