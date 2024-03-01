import React, { type PropsWithChildren } from "react";

// FONTS
import { Inter } from "next/font/google";

// DATA
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const MainLayout = async ({ children }: PropsWithChildren) => {
  return (
    <body
      className={`font-sans ${inter.variable} flex h-dvh flex-col overflow-hidden md:flex-row relative`}
    >
      {children}
    </body>
  );
};

export default MainLayout;
