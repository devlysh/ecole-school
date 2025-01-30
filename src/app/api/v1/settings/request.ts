import { Settings } from "@/lib/types";

const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

if (!NEXT_PUBLIC_BASE_URL) {
  throw new Error("NEXT_PUBLIC_BASE_URL is not set");
}

export const getSettingsRequest = async (): Promise<Settings | undefined> => {
  const response = await fetch(`${NEXT_PUBLIC_BASE_URL}/api/v1/settings`);

  if (!response.ok) {
    throw new Error("Failed to get settings");
  }

  return await response.json();
};

export const updateSettingsRequest = async (
  settings: Partial<Settings>
): Promise<Settings> => {
  const response = await fetch(`${NEXT_PUBLIC_BASE_URL}/api/v1/settings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    throw new Error("Failed to update settings");
  }

  return await response.json();
};
