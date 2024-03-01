"use client";

import React, { type PropsWithChildren } from "react";
import { UserButton, useUser } from "@clerk/nextjs";

// COMPONENTS
import { Button } from "~/components/ui/button";
import { SidebarButton } from "~/components/common/SidebarButton";

export const Page: React.FC<PropsWithChildren> = ({ children }) => {
  // DATA
  const { user } = useUser();

  return (
    <>
      <aside className="flex w-full justify-between border-r-[1px] border-r-gray-200 p-4 shadow-md dark:border-r-gray-900 dark:shadow-none md:h-full md:w-64 md:flex-col md:justify-normal md:py-10">
        <div className="flex md:flex-1 md:flex-col md:space-y-1">
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

        {!!user && (
          <Button
            variant="ghost"
            className="justify-start hover:bg-gray-50 hover:text-gray-700"
          >
            <>
              <UserButton afterSignOutUrl="/" />
              <span className="ml-4 hidden sm:inline-block">
                {user.firstName} {user.lastName}
              </span>
            </>
          </Button>
        )}
      </aside>

      <section className="flex h-full max-h-full flex-1 flex-col overflow-y-auto overflow-x-hidden py-10">
        <div className="flex w-full flex-1 flex-col px-3 md:mx-auto md:max-w-[600px]">
          <main className="flex flex-1 flex-col">{children}</main>
        </div>
      </section>
    </>
  );
};
