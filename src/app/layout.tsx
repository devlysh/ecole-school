import { Poppins } from "next/font/google";
import { NextUIProvider } from "@nextui-org/react";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import Header from "@/components/Header";
import { AuthProvider } from "@/providers/AuthProvider";
import { verifyAccessToken } from "@/lib/jwt";

const pippin = Poppins({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "ECOLE school",
  description: "Best Online Language Courses",
};

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  const roles = await getRoles();

  return (
    <html lang="en">
      <body className={pippin.className}>
        <AuthProvider>
          <Header roles={roles} />
          <NextUIProvider>{children}</NextUIProvider>
          <ToastContainer />
        </AuthProvider>
      </body>
    </html>
  );
};

export default RootLayout;

export const getRoles = async (): Promise<string[]> => {
  try {
    const { roles } = await verifyAccessToken();
    return roles;
  } catch {
    return [];
  }
};
