import prisma from "../src/lib/prisma";

prisma.user
  .create({
    data: {
      email: "test@test.com",
      passwordHash: "",
      name: "Test User",
      dateJoined: new Date(),
      isActive: true,
      stripeCustomerId: "cus_PZ555555555555555",
    },
  })
  .then(console.log)
  .catch(console.error);
