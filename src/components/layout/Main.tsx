import React, { type PropsWithChildren } from "react";

// PROVIDERS
import UserProvider from "../provider/user-provider";
import ThemeProvider from "../provider/theme-provider";

// FONTS
import { Inter } from "next/font/google";

// DATA
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const MainLayout = async ({ children }: PropsWithChildren) => {
  return (
    <UserProvider>
      <ThemeProvider>
        <body
          className={`font-sans ${inter.variable} min:h-dvh relative flex flex-col overflow-x-hidden md:flex-row`}
        >
          {children}
        </body>
      </ThemeProvider>
    </UserProvider>
  );
};

export default MainLayout;
