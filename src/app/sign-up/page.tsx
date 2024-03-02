"use client";

import { useContext, useEffect, useRef } from "react";
import { unstable_noStore as noStore } from "next/cache";
import { useRouter } from "next/navigation";
import { SignUp } from "@clerk/nextjs";

// PROVIDERS
import { UserContext } from "~/components/provider/user-provider";

const SignUpPage = () => {
  noStore();

  // HOOKS
  const router = useRouter();
  const currentUser = useContext(UserContext);

  // REFS
  const mainRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Should refresh the page if the sign-up is not available...
    setTimeout(() => {
      if (!currentUser?.isSignedIn && !mainRef.current?.firstChild?.firstChild)
        location.reload();
    }, 2000);
  }, [currentUser?.isSignedIn, router]);

  return (
    <main
      className="flex h-dvh w-screen items-center justify-center"
      ref={mainRef}
    >
      <SignUp
        appearance={{
          elements: {
            card: "shadow-none dark:bg-dark [&>.cl-internal-1wmikye]:hidden",
            headerTitle:
              "after:content-['and_join_the_community._'] text-gray-700 dark:text-gray-50",
            headerSubtitle: "text-gray-700 dark:text-gray-50",
            socialButtonsBlockButton: "text-gray-700 dark:text-gray-50",
            footerActionText: "font-medium text-gray-700 dark:text-gray-50",
            footerActionLink:
              "font-bold text-gray-700 hover:text-gray-700 dark:text-gray-50 ring-0 border-none outline-0 !shadow-none",
          },
          layout: {},
          variables: { colorPrimary: "#6366F1" },
        }}
        signInUrl="/sign-in"
        afterSignInUrl="/"
        afterSignUpUrl="/"
        redirectUrl="/"
      />
    </main>
  );
};

export default SignUpPage;
