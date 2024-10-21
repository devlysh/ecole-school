import { cookies } from "next/headers";

export const GET = async () => {
  const cookieStore = cookies();
  cookieStore.delete("token");

  return Response.json("Logged out", { status: 200 });
};
