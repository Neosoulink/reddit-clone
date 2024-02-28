import { SignUp } from "@clerk/nextjs";
import { unstable_noStore as noStore } from "next/cache";

const SignUpPage = () => {
  noStore();

  return (
    <main className="fixed left-0 top-0 flex h-dvh w-screen items-center justify-center bg-[white]">
      <SignUp
        appearance={{
          elements: {
            card: "shadow-none",
            footerAction__signIn: "text-gray-700 font-medium",
            footerAction__signUp: "text-gray-700 font-medium",
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
