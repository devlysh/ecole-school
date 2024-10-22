import { TokenType } from "@/lib/types";
import { cookies } from "next/headers";

export const GET = async () => {
  const cookieStore = cookies();
  cookieStore.delete(TokenType.ACCESS);

  return Response.json("Logged out", { status: 200 });
};
