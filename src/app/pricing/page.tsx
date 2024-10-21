import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import Pricing from "@/components/Pricing";
import { CookiesPayload } from "@/lib/types";
import logger from "@/lib/logger";

const PricingPage = async () => {
  const cookieStore = cookies();
  const token = cookieStore.get("token");

  if (!token) {
    redirect("/quiz");
  }

  try {
    const decodedToken = (await verifyToken(token.value)) as CookiesPayload;

    if (!decodedToken.name || !decodedToken.email) {
      redirect("/quiz");
    }

    return <Pricing />;
  } catch (err: unknown) {
    logger.error({ err }, "Error in PricingPage");
    redirect("/quiz");
  }
};

export default PricingPage;
