export const fetchVacations = async (email: string) => {
  try {
    const response = await fetch(`/api/v1/vacations?email=${encodeURIComponent(email)}`);
    if (!response.ok) throw new Error("Failed to fetch vacations");
    return await response.json();
  } catch (error) {
    console.error("Error fetching vacations:", error);
    throw error;
  }
};

export const removeVacation = async (email: string, vacationId: number) => {
  try {
    const response = await fetch(
      `/api/v1/vacations?email=${encodeURIComponent(email)}&vacationId=${vacationId}`,
      { method: "DELETE" }
    );
    if (!response.ok) throw new Error("Failed to remove vacation");
    return await response.json();
  } catch (error) {
    console.error("Error removing vacation:", error);
    throw error;
  }
};
