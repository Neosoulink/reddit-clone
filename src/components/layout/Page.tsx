"use client";

import React, { type PropsWithChildren } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { MoonIcon, SunIcon, SunMoon } from "lucide-react";

// COMPONENTS
import { Button } from "../ui/button";
import { SidebarButton } from "../common/SidebarButton";
import { SkeletonLoader } from "../common/SkeletonLoader";

export const Page: React.FC<PropsWithChildren<{ isLoading?: boolean }>> = ({
  children,
  isLoading,
}) => {
  // HOOKS
  const { user } = useUser();
  const { theme, setTheme } = useTheme();

  return (
    <>
      <div className="bg-white dark:bg-dark fixed z-50 flex w-full justify-between border-r-[1px] border-r-gray-200 p-4 shadow-md  dark:border-r-gray-50/5 dark:shadow-none md:h-dvh md:w-64 md:flex-col md:justify-normal md:py-10">
        <div className="flex space-x-1 md:flex-1 md:flex-col md:space-x-0 md:space-y-1">
          <SidebarButton label="Home" iconType="HOME" url="/" />

          {user ? (
            <SidebarButton
              label="My Posts"
              iconType="COMMENT"
              url={`/user/${user.id}`}
            />
          ) : (
            <SidebarButton label="Log In" iconType="LOGIN" url="/sign-in" />
          )}
        </div>

        <div className="flex md:flex-col md:space-y-2">
          <Button
            variant="ghost"
            className="justify-start rounded-full hover:bg-gray-50 hover:text-gray-700 md:rounded-md"
            onClick={() => {
              setTheme(
                theme === "dark"
                  ? "light"
                  : theme === "light"
                    ? "system"
                    : "dark",
              );
            }}
          >
            {theme === "dark" && <MoonIcon className="md:ml-1" />}
            {theme === "light" && <SunIcon className="md:ml-1" />}
            {theme === "system" && <SunMoon className="md:ml-1" />}

            <span className="ml-5 hidden capitalize sm:inline-block">
              {theme}
            </span>
          </Button>

          {!!user && (
            <Button
              variant="ghost"
              className="hover:bg-transparent dark:hover:bg-transparent justify-start  hover:text-gray-700 dark:hover:text-gray-50"
            >
              <>
                <UserButton afterSignOutUrl="/" />
                <span className="ml-4 hidden sm:inline-block">
                  {user.firstName} {user.lastName}
                </span>
              </>
            </Button>
          )}
        </div>
      </div>

      <section className="mt-20 flex flex-1 flex-col overflow-y-auto overflow-x-hidden py-10 md:ml-64 md:mt-0">
        <div className="flex w-full flex-1 flex-col px-3 md:mx-auto md:max-w-[600px]">
          {isLoading ? (
            <SkeletonLoader />
          ) : (
            <main className="flex flex-1 flex-col">{children}</main>
          )}
        </div>
      </section>
    </>
  );
};
