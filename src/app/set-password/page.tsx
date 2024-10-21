import { verifyToken } from "@/lib/jwt";
import { redirect } from "next/navigation";

import SetPasswordStep from "@/components/Quiz/Steps/SetPasswordStep";
import { CookiesPayload } from "@/lib/types";
import logger from "@/lib/logger";

const SetPasswordPage = async ({
  searchParams,
}: {
  searchParams: { token: string };
}) => {
  const token = searchParams.token;

  console.debug({ token });

  if (!token) {
    redirect("/quiz");
  }

  try {
    const decodedToken = (await verifyToken(token)) as CookiesPayload;

    if (!decodedToken.email || !decodedToken.name) {
      redirect("/quiz");
    }

    return <SetPasswordStep />;
  } catch (err: unknown) {
    logger.error({ err }, "Invalid token");
    redirect("/quiz");
  }
};

export default SetPasswordPage;
