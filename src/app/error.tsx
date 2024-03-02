"use client";

import Link from "next/link";
import type NextError from "next/error";

// COMPONENTS
import { Icon } from "~/components/Icon";
import { Button } from "~/components/ui/button";

export interface PageError {
  error: Error & NextError & { digest?: string };
  reset: () => unknown;
}

const Error = ({ error, reset }: PageError) => {
  return (
    <div className="absolute left-0 top-0 flex h-dvh w-dvw flex-col items-center justify-center space-y-2 text-center">
      <h2 className="text-3xl">
        {typeof error.message === "string"
          ? error.message
          : error.props?.title
            ? error.props?.title
            : "Something went wrong!"}{" "}
        ({error.props?.statusCode})
      </h2>

      <div className="flex items-center space-x-2">
        <Button variant="ghost" onClick={() => reset()}>
          Try again
        </Button>
        <span>or</span>
        <Button asChild variant="ghost">
          <Link href="/" className=" flex" scroll={false}>
            <Icon type="HOME" className="mr-2" /> Return Home
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default Error;
