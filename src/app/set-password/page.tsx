import { verifyToken } from "@/lib/jwt";
import { redirect } from "next/navigation";

import SetPasswordStep from "@/components/Quiz/Steps/SetPasswordStep";
import { PreAuthTokenPayload, TokenType } from "@/lib/types";
import logger from "@/lib/logger";

const SetPasswordPage = async ({
  searchParams,
}: {
  searchParams: { token: string };
}) => {
  const registrationToken = searchParams[TokenType.URL_TOKEN];

  if (!registrationToken) {
    redirect("/quiz");
  }

  try {
    const decodedPreAuthToken = (await verifyToken(
      registrationToken
    )) as PreAuthTokenPayload;

    if (!decodedPreAuthToken.email || !decodedPreAuthToken.name) {
      redirect("/quiz");
    }

    return <SetPasswordStep />;
  } catch (err: unknown) {
    logger.error({ err }, "Invalid token");
    redirect("/quiz");
  }
};

export default SetPasswordPage;
