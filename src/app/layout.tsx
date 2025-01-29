import { Poppins } from "next/font/google";
import { NextUIProvider } from "@nextui-org/react";
import "./globals.css";
import { ToastContainer } from "react-toastify";

const pippin = Poppins({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "ECOLE school",
  description: "Best Online Language Courses",
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body className={pippin.className}>
        <NextUIProvider>{children}</NextUIProvider>
        <ToastContainer />
      </body>
    </html>
  );
};

export default RootLayout;
