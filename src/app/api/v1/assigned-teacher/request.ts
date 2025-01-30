export const resetAssignedTeacherRequest = async () => {
  const response = await fetch("/api/v1/assigned-teacher", {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch teachers");
  }
  return await response.json();
};
