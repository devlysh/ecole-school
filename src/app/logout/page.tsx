import Logout from "@/components/Logout";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const LogoutPage = async () => {
  const cookieStore = cookies();

  const token = cookieStore.get("token");

  if (!token) {
    redirect("/");
  }

  return <Logout />;
};

export default LogoutPage;
