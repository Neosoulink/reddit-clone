import type * as trpc from "@trpc/server";
import {
  getAuth,
  type SignedInAuthObject,
  type SignedOutAuthObject,
} from "@clerk/nextjs/server";

import { db } from "../db";
import { type NextRequest } from "next/server";

interface AuthContext {
  auth: SignedInAuthObject | SignedOutAuthObject;
}

export const createContextInner = async (opts?: AuthContext) => {
  return {
    auth: opts?.auth,
    db,
  };
};

export const createContext = async (opts?: { req: NextRequest }) => {
  return await createContextInner(
    opts ? { auth: getAuth(opts.req) } : undefined,
  );
};

export type Context = trpc.inferAsyncReturnType<typeof createContext>;
