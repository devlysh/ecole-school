const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

if (!NEXT_PUBLIC_BASE_URL) {
  throw new Error("NEXT_PUBLIC_BASE_URL is not set");
}

export const fetchRolesRequest = async () => {
  try {
    const response = await fetch(`${NEXT_PUBLIC_BASE_URL}/api/v1/roles`);
    if (!response.ok) {
      throw new Error("Failed to fetch roles");
    }
    const data = await response.json();
    return data.roles;
  } catch (error) {
    console.error(error);
    return [];
  }
};
