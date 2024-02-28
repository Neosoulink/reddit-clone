import React, { type PropsWithChildren } from "react";
import { UserButton, currentUser } from "@clerk/nextjs";

// FONTS
import { Inter } from "next/font/google";

// COMPONENTS
import { Button } from "~/components/ui/button";
import { SidebarButton } from "~/components/common/SidebarButton";

// DATA
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const MainLayout = async ({ children }: PropsWithChildren) => {
  // DATA
  const user = await currentUser();

  return (
    <body
      className={`font-sans ${inter.variable} flex h-dvh flex-col overflow-hidden md:flex-row`}
    >
      <aside className="flex w-full justify-between border-r-[1px] border-r-gray-200 p-4 shadow-md md:h-full md:w-64 md:flex-col md:justify-normal md:py-10 dark:border-r-gray-900 dark:shadow-none">
        <div className="flex md:flex-1 md:flex-col md:space-y-1">
          <SidebarButton label="Home" iconType="HOME" url="/" />

          {user ? (
            <SidebarButton
              label="My Posts"
              iconType="COMMENT"
              url={`/user/${user.id}`}
            />
          ) : (
            <SidebarButton label="Log In" iconType="LOGIN" triggerLogin />
          )}
        </div>

        {!!user && (
          <Button
            variant="ghost"
            className="justify-start hover:bg-gray-50 hover:text-gray-700"
          >
            <>
              <UserButton />
              <span className="ml-4 hidden sm:inline-block">
                {user.firstName} {user.lastName}
              </span>
            </>
          </Button>
        )}
      </aside>

      <section className="max-h-full flex-1 overflow-y-auto overflow-x-hidden py-10">
        <div className="mx-3 w-full md:mx-auto md:max-w-[600px]">
          {children}
        </div>
      </section>
    </body>
  );
};

export default MainLayout;
