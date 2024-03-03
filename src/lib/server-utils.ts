import {
  type SignedInAuthObject,
  type SignedOutAuthObject,
} from "@clerk/nextjs/server";
import dompurify from "dompurify";

// TYPES
import { type DownVote, type UpVote, type Post } from "@prisma/client";

export interface RecursivePost extends ReturnType<typeof getVotes> {
  comments?: {
    orderBy: { createdAt: "desc" | "asc" };
    include: RecursivePost | ReturnType<typeof getVotes>;
  };
}

export interface RecursivePostRes extends Post {
  _count: { upVotes: number; downVotes: number };
  upVotes: UpVote[];
  downVotes: DownVote[];
  comments?: RecursivePostRes[];
  author?: {
    id: string;
    username: string;
    imageUrl: string;
  };
}

// HELPERS
export const getVotes = (auth?: SignedInAuthObject | SignedOutAuthObject) => {
  return {
    ...(auth?.userId
      ? {
          upVotes: { where: { userId: auth.userId } },
          downVotes: { where: { userId: auth.userId } },
        }
      : {}),
    _count: { select: { upVotes: true, downVotes: true } },
  };
};

export const generateNestedComments = (
  depth: number,
  auth?: SignedInAuthObject | SignedOutAuthObject,
): RecursivePost => {
  if (depth === 0) return getVotes(auth);

  const include = generateNestedComments(depth - 1, auth);

  return {
    ...getVotes(auth),
    comments: {
      orderBy: { createdAt: "desc" },
      include,
    },
  };
};

export const textSanitizer = (text: string) => dompurify.sanitize(text);
