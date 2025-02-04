const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

if (!NEXT_PUBLIC_BASE_URL) {
  throw new Error("NEXT_PUBLIC_BASE_URL is not set");
}

export const getStudentsRequest = async () => {
  const response = await fetch(`${NEXT_PUBLIC_BASE_URL}/api/v1/students`);
  if (!response.ok) {
    throw new Error("Failed to fetch students");
  }
  return await response.json();
};
