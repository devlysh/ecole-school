const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

if (!NEXT_PUBLIC_BASE_URL) {
  throw new Error("NEXT_PUBLIC_BASE_URL is not set");
}

export const submitPlanRequest = async () => {
  const response = await fetch(`${NEXT_PUBLIC_BASE_URL}/api/v1/plans`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(response.statusText ?? "Failed to submit plan");
  }

  return await response.json();
};
