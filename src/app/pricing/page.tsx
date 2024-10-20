import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import Pricing from "@/components/Pricing";
import { CookiesPayload } from "@/lib/types";

const PricingPage = async () => {
  const cookieStore = cookies();
  const token = cookieStore.get("token");

  if (!token) {
    redirect("/quiz");
  }

  const decodedToken = (await verifyToken(token.value)) as CookiesPayload;

  if (!decodedToken || !decodedToken.name || !decodedToken.email) {
    redirect("/quiz");
  }

  return <Pricing />;
};

export default PricingPage;
