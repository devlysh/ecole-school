import logger from "@/lib/logger";

export const setPassword = async (password: string, token: string) => {
  try {
    const response = await fetch(`/api/v1/set-password`, {
      method: "POST",
      body: JSON.stringify({ token, password }),
    });

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
