import {
  type User,
  clerkClient,
  type SignedInAuthObject,
  type SignedOutAuthObject,
} from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { type DownVote, type UpVote, type Post } from "@prisma/client";

// TYPES
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
const getVotes = (auth?: SignedInAuthObject | SignedOutAuthObject) => {
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

const generateNestedComments = (
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

/**
 * @originalAuthor t3dotgg | https://github.com/t3dotgg
 * @source https://github.com/t3dotgg/chirp/blob/main/src/server/api/routers/posts.ts#L16
 */
const addUserDataToPosts = async <T extends Post>(posts: T[]) => {
  const userIds = posts.map((post) => post.authorId);

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

const addUserDataToRecursivePosts = async (post: RecursivePostRes) => {
  const userIds: string[] = [];

  const postMapper = (_: RecursivePostRes) => {
    if (
      typeof _.authorId === "string" &&
      !userIds.includes(_.authorId as string)
    )
      userIds.push(_.authorId as string);

    if (_.comments && !!_.comments.length) _.comments.map(postMapper);

    return;
  };
  postMapper(post);

  const userById: Record<string, User> = {};
  (
    await clerkClient.users.getUserList({
      userId: userIds,
      limit: 110,
    })
  ).map((user) => {
    userById[user.id] = user;
    return user;
  });

  const postSetter = (_: RecursivePostRes) => {
    const user = userById[_.authorId];
    if (user)
      _.author = {
        id: user.id,
        imageUrl: user.imageUrl,
        username: user.username ?? user.firstName ?? "Unknown",
      };

    if (_.comments && !!_.comments.length) _.comments.map(postSetter);

    return;
  };
  postSetter(post);

  return post;
};

// Create a new ratelimiter, that allows 3 requests per 1 minute
// const ratelimit = new Ratelimit({
//   redis: Redis.fromEnv(),
//   limiter: Ratelimit.slidingWindow(3, "1 m"),
//   analytics: true,
// });

export const postRouter = createTRPCRouter({
  create: protectedProcedure
    .meta({ description: "Create a post/comment" })
    .input(
      z.object({
        title: z.string().min(1).nullable(),
        text: z.string().min(1),
        postId: z.number().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      console.log("PostID =====>", input.postId);

      const res = await ctx.db.post.create({
        data: {
          ...input,
          authorId: ctx.auth.userId,
        },
      });

      return (await addUserDataToPosts([res]))[0];
    }),

  getAll: publicProcedure
    .meta({ description: "Get all posts" })
    .query(async ({ ctx }) => {
      return addUserDataToPosts(
        await ctx.db.post.findMany({
          orderBy: { createdAt: "desc" },
          where: { postId: null },
          include: getVotes(ctx.auth),
        }),
      );
    }),

  getOne: publicProcedure
    .meta({ description: "Get a post and comments" })
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.db.post.findUnique({
        where: { id: input.id },
        include: {
          ...generateNestedComments(10, ctx.auth),
        },
      });

      // TODO: 🚧 IMPORTANT: Should use raw SQL recursion (much efficient).
      // const data = await ctx.db.$executeRaw`
      // SELECT
      //     id,
      //     post_id,
      //     @level := @level + 1 AS Level
      // FROM post
      // JOIN (SELECT @level := 0) AS init
      // WHERE post_id IS NULL AND id = ${input.id}

      // UNION ALL

      // SELECT p.id, p.post_id, @level := @level + 1
      // FROM post p
      // JOIN (SELECT @level := 0) AS init
      // JOIN (SELECT id FROM post WHERE post_id IS NULL) AS root
      //     ON p.post_id = root.id
      // ORDER BY Level, id;
      // `;
      // console.log(data);

      if (!post) throw new TRPCError({ code: "NOT_FOUND" });

      return addUserDataToRecursivePosts(post as RecursivePostRes);
    }),

  vote: protectedProcedure
    .meta({ description: "Upvote or Downvote" })
    .input(
      z.object({
        postId: z.number(),
        type: z.enum(["UP", "DOWN"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const currentUpvote = await ctx.db.upVote.findFirst({
        where: { userId: ctx.auth.userId, postId: input.postId },
      });
      const currentDownvote = await ctx.db.downVote.findFirst({
        where: { userId: ctx.auth.userId, postId: input.postId },
      });

      if (currentUpvote && currentDownvote)
        await Promise.all([
          ctx.db.upVote.delete({ where: { id: currentUpvote.id } }),
          ctx.db.downVote.delete({ where: { id: currentDownvote.id } }),
        ]);

      if (currentUpvote) {
        await ctx.db.upVote.delete({
          where: { id: currentUpvote.id },
        });

        if (input.type === "UP")
          return ctx.db.post.findUnique({
            where: { id: input.postId },
            include: getVotes(ctx.auth),
          });
      }
      if (currentDownvote) {
        await ctx.db.downVote.delete({
          where: { id: currentDownvote.id },
        });

        if (input.type === "DOWN")
          return ctx.db.post.findUnique({
            where: { id: input.postId },
            include: getVotes(ctx.auth),
          });
      }

      if (input.type === "UP")
        await ctx.db.upVote.create({
          data: {
            userId: ctx.auth.userId,
            postId: input.postId,
          },
        });

      if (input.type === "DOWN")
        await ctx.db.downVote.create({
          data: {
            userId: ctx.auth.userId,
            postId: input.postId,
          },
        });

      return ctx.db.post.findUnique({
        where: { id: input.postId },
        include: getVotes(ctx.auth),
      });
    }),

  edit: protectedProcedure
    .meta({ description: "Edit a post" })
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).nullable(),
        text: z.string().min(1).nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.post.update({
        where: { id: input.id, authorId: ctx.auth.userId },
        data: {
          ...(input.title ? { title: input.title } : undefined),
          ...(input.text ? { text: input.text } : undefined),
        },
      });
    }),

  delete: protectedProcedure
    .meta({ description: "Delete a vote" })
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const deleteUpvotes = ctx.db.upVote.deleteMany({
        where: {
          postId: input.id,
        },
      });

      const deleteDownvotes = ctx.db.upVote.deleteMany({
        where: {
          postId: input.id,
        },
      });

      const deletePost = ctx.db.post.delete({
        where: {
          id: input.id,
        },
      });

      return ctx.db.$transaction([deleteUpvotes, deleteDownvotes, deletePost]);
    }),
});
