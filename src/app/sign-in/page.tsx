import { SignIn } from "@clerk/nextjs";
import { unstable_noStore as noStore } from "next/cache";

const SignInPage = () => {
  noStore();

  return (
    <main className="fixed left-0 top-0 flex h-dvh w-screen items-center justify-center bg-[white]">
      <SignIn
        appearance={{
          elements: {
            card: "shadow-none",
            footerAction__signIn: "text-gray-700 font-medium",
            footerAction__signUp: "text-gray-700 font-medium",
            headerTitle: "before:content-['Join_the_best_community._']",
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
