import {
  type SignedInAuthObject,
  type SignedOutAuthObject,
  type User,
  clerkClient,
} from "@clerk/nextjs/server";
import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

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
  author?: PostUser;
}

export interface PostUser extends Pick<User, "id" | "username" | "imageUrl"> {
  username: string;
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

export const textSanitizer = (text: string) => {
  const win = new JSDOM("").window as unknown as Window;
  const DOMPurify = createDOMPurify(win);

  return DOMPurify.sanitize(text);
};

/**
 * @originalAuthor t3dotgg | https://github.com/t3dotgg
 * @source https://github.com/t3dotgg/chirp/blob/main/src/server/api/routers/posts.ts#L16
 */
export const addUserDataToPosts = async <T extends Post>(
  posts: T[],
  userId?: string | null,
) => {
  const userIds = userId ? [userId] : posts.map((post) => post.authorId);

  const users = await clerkClient.users.getUserList({
    userId: userIds,
    limit: 110,
  });

  return posts.map((post) => {
    const author = users.find((user) => user.id === post.authorId);

    return {
      ...post,
      author: {
        id: author?.id,
        username: author?.username ?? author?.firstName,
        imageUrl: author?.imageUrl,
      },
    };
  });
};

export const addUserDataToRecursivePosts = async (post: RecursivePostRes) => {
  const userIds: string[] = [];

  const postMapper = (_: RecursivePostRes) => {
    if (typeof _.authorId === "string" && !userIds.includes(_.authorId))
      userIds.push(_.authorId);

    if (_.comments && !!_.comments.length) _.comments.map(postMapper);

    return;
  };
  postMapper(post);

  const users: Record<string, PostUser> = {};
  (
    await clerkClient.users.getUserList({
      userId: userIds,
      limit: 110,
    })
  ).map((user) => {
    users[user.id] = {
      id: user.id,
      imageUrl: user.imageUrl,
      username: user.username ?? user.firstName ?? "Unknown",
    };
  });
  return { post, users };
};

/**
 * @originalAuthor t3dotgg | https://github.com/t3dotgg
 * @source https://github.com/t3dotgg/chirp/blob/main/src/server/api/routers/posts.ts#L16
 *
 * @description Create a new ratelimiter, that allows 3 requests per 1 minute
 */
export const ratelimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
  prefix: "@upstash/ratelimit/reddit-clone",
});
