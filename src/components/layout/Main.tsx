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
      className={`font-sans ${inter.variable} min:h-dvh relative flex flex-col overflow-x-hidden md:flex-row`}
    >
      {children}
    </body>
  );
};

export default MainLayout;
