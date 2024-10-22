import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import Checkout from "@/components/Checkout";
import { PreAuthTokenPayload, TokenType } from "@/lib/types";
import { getLanguagesRequest } from "../api/v1/languages/request";

const ChecokutPage = async () => {
  const cookieStore = cookies();
  const preAuthToken = cookieStore.get(TokenType.PRE_AUTH);

  if (!preAuthToken) {
    redirect("/quiz");
  }

  const decodedPreAuthToken = (await verifyToken(
    preAuthToken.value
  )) as PreAuthTokenPayload;

  if (!decodedPreAuthToken.selectedPrice) {
    redirect("/pricing");
  }

  const languages = await getLanguagesRequest();

  return <Checkout languages={languages} />;
};

export default ChecokutPage;
