import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import Checkout from "@/components/Checkout";
import { Plan, PreAuthTokenPayload, TokenType } from "@/lib/types";
import { LanguagesRepository } from "@domain/repositories/Languages.repository";

const ChecokutPage = async () => {
  const cookieStore = cookies();
  const preAuthToken = cookieStore.get(TokenType.PRE_AUTH);

  if (!preAuthToken) {
    redirect("/quiz");
  }

  const { selectedPrice, name, email } = (await verifyToken(
    preAuthToken.value
  )) as unknown as PreAuthTokenPayload;

  if (!name || !email) {
    redirect("/quiz");
  }

  if (!selectedPrice) {
    redirect("/pricing");
  }

  const languages = await new LanguagesRepository().findAll();

  return (
    <Checkout
      languages={languages}
      name={name}
      email={email}
      selectedPrice={JSON.parse(selectedPrice) as Plan}
    />
  );
};

export default ChecokutPage;
