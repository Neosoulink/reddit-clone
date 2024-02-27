import React, { type PropsWithChildren } from "react";
import Link from "next/link";
import { UserButton, currentUser } from "@clerk/nextjs";

// FONTS
import { Inter } from "next/font/google";

// COMPONENTS
import { Button } from "~/components/ui/button";
import { Icon } from "~/components/Icon";

// DATA
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const MainLayout = async ({ children }: PropsWithChildren) => {
  const user = await currentUser();

  return (
    <body
      className={`font-sans ${inter.variable} flex h-dvh flex-col overflow-hidden md:flex-row`}
    >
      <aside className="flex w-full justify-between border-r-[1px] border-r-gray-200 dark:border-r-gray-900 p-4 shadow-md dark:shadow-none md:h-full md:w-64 md:flex-col md:justify-normal md:py-10">
        <div className="flex md:space-y-1 md:flex-1 md:flex-col">
          <Button
            asChild
            variant="ghost"
            className="justify-start stroke-indigo-600 sm:py-3 sm:text-base  text-indigo-600 hover:stroke-indigo-500"
          >
            <Link href="/">
              <Icon type="HOME" className="mr-1 sm:mr-4" />
              Home
            </Link>
          </Button>

          {user ? (
            <Button
              asChild
              variant="ghost"
              className="justify-start sm:py-3 sm:text-base"
            >
              <Link
                href={`/user/${user.id}`}
                className="stroke-gray-700 hover:stroke-indigo-500"
              >
                <Icon type="COMMENT" className="mr-1 sm:mr-4" />
                My Posts
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              variant="ghost"
              className="justify-start sm:py-3 sm:text-base"
            >
              <Link
                href="/"
                className="stroke-gray-700 hover:stroke-indigo-500"
              >
                <Icon type="LOGIN" className="mr-1 sm:mr-4" />
                Log In
              </Link>
            </Button>
          )}
        </div>

        {!!user && (
          <Button variant="ghost" className="justify-start" asChild>
            <div className="">
              <UserButton />
              <span className="ml-4 hidden sm:inline-block">
                {user.firstName} {user.lastName}
              </span>
            </div>
          </Button>
        )}
      </aside>

      <section className="max-h-full flex-1 overflow-y-auto overflow-x-hidden">
        <div className="mx-auto w-full md:max-w-[600px] ">{children}</div>
      </section>
    </body>
  );
};

export default MainLayout;
