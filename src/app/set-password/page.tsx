import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import SetPasswordStep from "@/components/Quiz/Steps/SetPasswordStep";
import { CookiesPayload } from "@/lib/types";

const CreatePasswordPage = async () => {
  const cookieStore = cookies();
  const token = cookieStore.get("registrationToken");

  if (!token) {
    redirect("/quiz");
  }

  const decodedToken = (await verifyToken(token.value)) as CookiesPayload;

  if (!decodedToken.subscriptionId) {
    redirect("/checkout");
  }

  return <SetPasswordStep />;
};

export default CreatePasswordPage;
