import { Poppins } from "next/font/google";
import { NextUIProvider } from "@nextui-org/react";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "@/providers/AuthProvider";

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
  return (
    <html lang="en">
      <body className={pippin.className}>
        <AuthProvider>
          <NextUIProvider>{children}</NextUIProvider>
          <ToastContainer />
        </AuthProvider>
      </body>
    </html>
  );
};

export default RootLayout;
