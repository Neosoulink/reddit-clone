"use client";

import React, { useContext, type PropsWithChildren } from "react";
import { UserButton } from "@clerk/nextjs";

// PROVIDERS
import { UserContext } from "../provider/user-provider";

// COMPONENTS
import { Button } from "../ui/button";
import { SidebarButton } from "../common/SidebarButton";
import { SkeletonLoader } from "../common/SkeletonLoader";
import ThemeSwitchButton from "../common/ThemeSwitchButton";

export const Page: React.FC<PropsWithChildren<{ isLoading?: boolean }>> = ({
  children,
  isLoading,
}) => {
  // HOOKS
  const currentUser = useContext(UserContext);

  return (
    <>
      <div className="bg-white dark:bg-dark fixed z-50 flex w-full justify-between border-r-[1px] border-r-gray-200 p-4 shadow-md  dark:border-r-gray-50/5 dark:shadow-none md:h-dvh md:w-64 md:flex-col md:justify-normal md:py-10">
        <div className="flex space-x-1 md:flex-1 md:flex-col md:space-x-0 md:space-y-1">
          <SidebarButton label="Home" iconType="HOME" url="/" />

          {currentUser ? (
            <SidebarButton
              label="My Posts"
              iconType="COMMENT"
              url={`/user/${currentUser.id}`}
            />
          ) : (
            <SidebarButton label="Log In" iconType="LOGIN" url="/sign-in" />
          )}
        </div>

        <div className="flex md:flex-col md:space-y-2">
          <ThemeSwitchButton />

          {!!currentUser && (
            <Button
              variant="ghost"
              className="hover:bg-transparent dark:hover:bg-transparent justify-start  hover:text-gray-700 dark:hover:text-gray-50"
            >
              <>
                <UserButton afterSignOutUrl="/" />
                <span className="ml-4 hidden sm:inline-block">
                  {currentUser.firstName} {currentUser.lastName}
                </span>
              </>
            </Button>
          )}
        </div>
      </div>

      <section className="mt-14 flex flex-1 flex-col overflow-y-auto overflow-x-hidden py-10 md:ml-64 md:mt-0">
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
