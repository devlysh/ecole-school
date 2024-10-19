import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import SetPasswordStep from "@/components/Quiz/Steps/SetPasswordStep";

const CreatePasswordPage = async () => {
  const cookieStore = cookies();
  const token = cookieStore.get("token");

  if (!token) {
    redirect("/quiz");
  }

  const decodedToken = await verifyToken(token.value);

  if (!decodedToken) {
    redirect("/quiz");
  }

  return <SetPasswordStep />;
};

export default CreatePasswordPage;
