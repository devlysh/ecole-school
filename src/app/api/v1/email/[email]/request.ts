const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

if (!NEXT_PUBLIC_BASE_URL) {
  throw new Error("NEXT_PUBLIC_BASE_URL is not set");
}

export const checkEmailRequest = async (
  email: string
): Promise<{ error: unknown; isTaken?: boolean }> => {
  const url = new URL(`${NEXT_PUBLIC_BASE_URL}/api/v1/email/${email}`);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(response.statusText ?? "Failed to check if email is taken");
  }

  return await response.json();
};
