import logger from "@/lib/logger";

const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

if (!NEXT_PUBLIC_BASE_URL) {
  throw new Error("NEXT_PUBLIC_BASE_URL is not set");
}

export const setPasswordRequest = async (password: string, token: string) => {
  try {
    const response = await fetch(
      `${NEXT_PUBLIC_BASE_URL}/api/v1/password/set`,
      {
        method: "POST",
        body: JSON.stringify({ token, password }),
      }
    );

    if (!response.ok) {
      return Response.json(
        { error: "Failed to set password" },
        { status: 500 }
      );
    }

    return response;
  } catch (err: unknown) {
    logger.error({ error: err }, "Error during setting password");
    return Response.json({ error: "Failed to set password" }, { status: 401 });
  }
};
