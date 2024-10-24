import { verifyToken } from "@/lib/jwt";
import { redirect } from "next/navigation";

import SetPasswordStep from "@/components/Quiz/Steps/SetPasswordStep";
import { RegistrationTokenPayload, TokenType } from "@/lib/types";
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
    const decodedRegistrationToken = (await verifyToken(
      registrationToken
    )) as unknown as RegistrationTokenPayload;

    if (!decodedRegistrationToken.email) {
      redirect("/quiz");
    }

    return <SetPasswordStep />;
  } catch (err: unknown) {
    logger.error({ err }, "Invalid token");
    redirect("/quiz");
  }
};

export default SetPasswordPage;
