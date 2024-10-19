import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import Checkout from "@/components/Checkout";

const ChecokutPage = async () => {
  const cookieStore = cookies();
  const token = cookieStore.get("token");

  if (!token) {
    redirect("/quiz");
  }

  const decodedToken = await verifyToken(token.value);

  if (!decodedToken) {
    redirect("/quiz");
  }

  return <Checkout />;
};

export default ChecokutPage;
