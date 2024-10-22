import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import Pricing from "@/components/Pricing";
import { PreAuthTokenPayload, TokenType } from "@/lib/types";
import logger from "@/lib/logger";
import { getLanguagesRequest } from "../api/v1/languages/request";
import { getCurrenciesRequest } from "../api/v1/currencies/request";
import { getPlansRequest } from "../api/v1/stripe/plans/request";

const PricingPage = async () => {
  const cookieStore = cookies();
  const preAuthToken = cookieStore.get(TokenType.PRE_AUTH);

  if (!preAuthToken) {
    redirect("/quiz");
  }

  try {
    const decodedPreAuthToken = (await verifyToken(
      preAuthToken.value
    )) as PreAuthTokenPayload;

    if (!decodedPreAuthToken.name || !decodedPreAuthToken.email) {
      redirect("/quiz");
    }

    const { languages, currencies, plans } = await getPricingData();

    return (
      <Pricing languages={languages} currencies={currencies} plans={plans} />
    );
  } catch (err: unknown) {
    logger.error({ err }, "Error in PricingPage");
    redirect("/quiz");
  }
};

export default PricingPage;

const getPricingData = async () => {
  const languages = await getLanguagesRequest();
  const currencies = await getCurrenciesRequest();
  const plans = await getPlansRequest();

  return { languages, currencies, plans };
};
