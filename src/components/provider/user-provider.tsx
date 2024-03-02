"use client";

import { createContext } from "react";
import { useUser } from "@clerk/nextjs";
import { type User } from "@clerk/nextjs/server";

export const UserContext = createContext<
  | (Pick<User, "id" | "imageUrl" | "username" | "firstName" | "lastName"> & {
      isSignedIn?: boolean;
    })
  | undefined
  | null
>(null);

const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isSignedIn } = useUser();

  return (
    <UserContext.Provider
      value={
        user
          ? {
              id: user.id,
              imageUrl: user.imageUrl,
              username: user.username,
              firstName: user.firstName,
              lastName: user.lastName,
              isSignedIn,
            }
          : user
      }
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
