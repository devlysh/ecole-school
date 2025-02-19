import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import Pricing from "@/components/Pricing";
import { PreAuthTokenPayload, TokenType } from "@/lib/types";
import logger from "@/lib/logger";

const PricingPage = async () => {
  const cookieStore = cookies();
  const preAuthToken = cookieStore.get(TokenType.PRE_AUTH);

  if (!preAuthToken) {
    redirect("/quiz");
  }

  try {
    const decodedPreAuthToken = (await verifyToken(
      preAuthToken.value
    )) as unknown as PreAuthTokenPayload;

    if (!decodedPreAuthToken.name || !decodedPreAuthToken.email) {
      redirect("/quiz");
    }

    return <Pricing />;
  } catch (err: unknown) {
    logger.error(err, "Error in PricingPage");
    redirect("/quiz");
  }
};

export default PricingPage;
