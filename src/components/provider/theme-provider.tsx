"use client";

import { type PropsWithChildren } from "react";
import { ThemeProvider as Provider } from "next-themes";

const ThemeProvider: React.FC<PropsWithChildren> = ({ children }) => {
  return <Provider attribute="class">{children}</Provider>;
};

export default ThemeProvider;
