import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const main = async () => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error(
      "ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment variables"
    );
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  // Create or update admin user
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      isActive: true,
    },
    create: {
      email: adminEmail,
      passwordHash,
      name: "Admin",
      isActive: true,
      roles: {
        create: {
          role: {
            connect: {
              name: "admin",
            },
          },
        },
      },
    },
  });

  console.log(`Admin user ${admin.email} has been created/updated`);
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
