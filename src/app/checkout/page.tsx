import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import Checkout from "@/components/Checkout";
import { IntroTokenPayload } from "@/lib/types";
import { getLanguagesRequest } from "../api/v1/languages/request";

const ChecokutPage = async () => {
  const cookieStore = cookies();
  const token = cookieStore.get("token");

  if (!token) {
    redirect("/quiz");
  }

  const decodedToken = (await verifyToken(token.value)) as IntroTokenPayload;

  if (!decodedToken.selectedPrice) {
    redirect("/pricing");
  }

  const languages = await getLanguagesRequest();

  return <Checkout languages={languages} />;
};

export default ChecokutPage;
