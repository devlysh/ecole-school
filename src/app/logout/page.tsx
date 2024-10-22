import Logout from "@/components/Logout";
import { TokenType } from "@/lib/types";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const LogoutPage = async () => {
  const cookieStore = cookies();

  const accessToken = cookieStore.get(TokenType.ACCESS);

  if (!accessToken) {
    redirect("/");
  }

  return <Logout />;
};

export default LogoutPage;
