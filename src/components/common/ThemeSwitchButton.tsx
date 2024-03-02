"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { MoonIcon, SunIcon, SunMoon } from "lucide-react";

// COMPONENTS
import { Button } from "../ui/button";

const ThemeSwitchButton: React.FC = () => {
  // HOOKS
  const { theme, setTheme } = useTheme();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => setIsReady(true), []);

  return (
    <Button
      variant="ghost"
      className="justify-start rounded-full hover:bg-gray-50 hover:text-gray-700 md:rounded-md"
      onClick={() => {
        setTheme(
          theme === "dark" ? "light" : theme === "light" ? "system" : "dark",
        );
      }}
      suppressHydrationWarning
      suppressContentEditableWarning
    >
      {!isReady || theme === "system" ? (
        <SunMoon className="md:ml-1" />
      ) : theme === "light" ? (
        <SunIcon className="md:ml-1" />
      ) : (
        <MoonIcon className="md:ml-1" />
      )}
      <span className="ml-5 hidden capitalize sm:inline-block">
        {!isReady ? "system" : theme}
      </span>
    </Button>
  );
};

export default ThemeSwitchButton;
