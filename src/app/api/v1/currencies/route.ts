import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const languages = await prisma.currency.findMany();
    return Response.json(languages);
  } catch (error) {
    console.error("Error fetching languages:", error);
    return Response.json("Failed to fetch languages", { status: 500 });
  }
}
