const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

if (!NEXT_PUBLIC_BASE_URL) {
  throw new Error("NEXT_PUBLIC_BASE_URL is not set");
}

export const setPasswordRequest = async (password: string, token: string) => {
  const response = await fetch(`${NEXT_PUBLIC_BASE_URL}/api/v1/password`, {
    method: "POST",
    body: JSON.stringify({ token, password }),
  });

  if (!response.ok) {
    throw new Error(response.statusText ?? "Failed to set password");
  }

  return await response.json();
};
