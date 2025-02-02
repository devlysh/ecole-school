import { InvalidEmailOrPasswordError } from "@/lib/errors";

const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

if (!NEXT_PUBLIC_BASE_URL) {
  throw new Error("NEXT_PUBLIC_BASE_URL is not set");
}

export const loginRequest = async (email: string, password: string) => {
  const response = await fetch(`${NEXT_PUBLIC_BASE_URL}/api/v1/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();

    if (error.name === "InvalidEmailOrPasswordError") {
      throw new InvalidEmailOrPasswordError();
    }

    throw new Error(error.message);
  }

  return await response.json();
};
