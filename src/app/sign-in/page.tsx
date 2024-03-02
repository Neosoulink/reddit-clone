"use client";

import { useContext, useEffect, useRef } from "react";
import { unstable_noStore as noStore } from "next/cache";
import { useRouter } from "next/navigation";
import { SignIn } from "@clerk/nextjs";

// PROVIDERS
import { UserContext } from "~/components/provider/user-provider";

const SignInPage = () => {
  noStore();

  // HOOKS
  const router = useRouter();
  const currentUser = useContext(UserContext);

  // REFS
  const mainRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Should refresh the page if the sign-in is not available...
    setTimeout(() => {
      if (!currentUser?.isSignedIn && !mainRef.current?.firstChild?.firstChild)
        location.reload();
    }, 2000);
  }, [currentUser?.isSignedIn, router]);

  return (
    <main
      className="fixed left-0 top-0 flex h-dvh w-screen items-center justify-center"
      ref={mainRef}
    >
      <SignIn
        appearance={{
          elements: {
            card: "shadow-none dark:bg-dark [&>.cl-internal-1wmikye]:hidden",
            headerTitle:
              "before:content-['Join_the_best_community._'] text-gray-700 dark:text-gray-50",
            headerSubtitle: "text-gray-700 dark:text-gray-50",
            socialButtonsBlockButton: "text-gray-700 dark:text-gray-50",
            footerActionText: "font-medium text-gray-700 dark:text-gray-50",
            footerActionLink:
              "font-bold text-gray-700 hover:text-gray-700 dark:text-gray-50 ring-0 border-none outline-0 !shadow-none",
          },
          layout: {},
          variables: { colorPrimary: "#6366F1" },
        }}
        signUpUrl="/sign-up"
        afterSignInUrl="/"
        afterSignUpUrl="/"
        redirectUrl="/"
      />
    </main>
  );
};

export default SignInPage;
