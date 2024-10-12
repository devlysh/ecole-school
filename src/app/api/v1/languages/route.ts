import prisma from "@/lib/prisma";

export const GET = async () => {
  try {
    const languages = await prisma.language.findMany();
    return Response.json(languages);
  } catch (error) {
    console.error("Error fetching languages:", error);
    return Response.json("Failed to fetch languages", { status: 500 });
  }
};
