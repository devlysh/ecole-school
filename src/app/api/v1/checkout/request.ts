const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

if (!NEXT_PUBLIC_BASE_URL) {
  throw new Error("NEXT_PUBLIC_BASE_URL is not set");
}

export const submitCheckoutRequest = async () => {
  const response = await fetch(`${NEXT_PUBLIC_BASE_URL}/api/v1/checkout`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(response.statusText ?? "Failed to submit checkout");
  }

  return await response.json();
};
