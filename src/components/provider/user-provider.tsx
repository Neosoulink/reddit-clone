"use client";

import { useUser } from "@clerk/nextjs";
import { type User } from "@clerk/nextjs/server";
import { createContext } from "react";

export const ContextContext = createContext<
  | Pick<User, "id" | "imageUrl" | "username" | "firstName" | "lastName">
  | undefined
  | null
>(null);

const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser();

  return (
    <ContextContext.Provider
      value={
        user
          ? {
              id: user.id,
              imageUrl: user.imageUrl,
              username: user.username,
              firstName: user.firstName,
              lastName: user.lastName,
            }
          : user
      }
    >
      {children}
    </ContextContext.Provider>
  );
};

export default UserProvider;
