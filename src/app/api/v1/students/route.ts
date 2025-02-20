import { NextResponse } from "next/server";
import { UsersRepository } from "../../../../../domain/repositories/Users.repository";
import Stripe from "stripe";
import { verifyAccessToken } from "@/lib/jwt";
import { UnauthorizedError } from "@/lib/errors";
import { RoleName } from "@/lib/types";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-09-30.acacia",
});

type StudentRecord = {
  name: string | null;
  email: string;
  student: {
    stripeCustomerId: string;
    studentLanguages: Array<{
      language: {
        name: string;
      };
    }>;
  } | null;
};

export const GET = async () => {
  try {
    const decodedToken = await verifyAccessToken();

    if (!decodedToken.roles.includes(RoleName.ADMIN)) {
      throw new UnauthorizedError("You are not authorized to fetch teachers");
    }

    const repo = new UsersRepository();
    const students = await repo.findAllStudents();

    const enrichedStudents = await Promise.all(
      students.map(async (student: StudentRecord) => {
        let plan = "N/A";
        let subscriptionStatus = "unsubscribed";
        const stripeCustomerId = student.student?.stripeCustomerId;

        if (stripeCustomerId) {
          try {
            const subscriptions = await stripe.subscriptions.list({
              customer: stripeCustomerId,
            });
            if (subscriptions.data.length > 0) {
              const subscription = subscriptions.data[0];
              subscriptionStatus = subscription.status;
              const subscriptionItem = subscription.items?.data?.[0];
              if (subscriptionItem && subscriptionItem.plan) {
                plan =
                  subscriptionItem.plan.nickname ||
                  subscriptionItem.plan.id ||
                  "Unknown";
              }
            }
          } catch (error) {
            console.error(
              "Error retrieving stripe subscriptions for customer:",
              stripeCustomerId,
              error
            );
          }
        }

        const languages =
          student.student?.studentLanguages?.map(
            (entry) => entry.language.name
          ) || [];
        const languageDisplay =
          languages.length > 0 ? languages.join(", ") : "N/A";

        return {
          name: student.name || "N/A",
          email: student.email,
          language: languageDisplay,
          plan,
          subscriptionStatus,
        };
      })
    );

    return NextResponse.json({ data: enrichedStudents });
  } catch (error) {
    console.error("Error in GET /students:", error);
    return NextResponse.error();
  }
};
