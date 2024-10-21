import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import Checkout from "@/components/Checkout";
import { IntroTokenPayload } from "@/lib/types";

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

  return <Checkout />;
};

export default ChecokutPage;
