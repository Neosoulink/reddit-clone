import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

// UTILS
import {
  addUserDataToPosts,
  addUserDataToRecursivePosts,
  generateNestedComments,
  getVotes,
  ratelimiter,
  textSanitizer,
  type RecursivePostRes,
} from "~/lib/server-utils";

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
      const rateRes = await ratelimiter.limit(ctx.auth.userId);
      if (!rateRes.success)
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
        });
      return await ctx.db.post.create({
        data: {
          ...input,
          ...(input.title ? { title: textSanitizer(input.title) } : {}),
          text: textSanitizer(input.text),
          authorId: ctx.auth.userId,
        },
      });
    }),

  getAll: publicProcedure
    .meta({ description: "Get all posts" })
    .input(z.object({ byAuthorId: z.string().nullable() }).nullable())
    .query(async ({ ctx, input }) => {
      return addUserDataToPosts(
        await ctx.db.post.findMany({
          orderBy: { createdAt: "desc" },
          where: {
            postId: null,
            ...(input?.byAuthorId ? { authorId: input.byAuthorId } : {}),
            deletedAt: null,
          },
          include: getVotes(ctx.auth),
        }),
        input?.byAuthorId,
      );
    }),

  getOne: publicProcedure
    .meta({ description: "Get a post and comments" })
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.db.post.findUnique({
        where: { id: input.id, deletedAt: null },
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
          ...(input.title ? { title: textSanitizer(input.title) } : undefined),
          ...(input.text ? { text: textSanitizer(input.text) } : undefined),
        },
      });
    }),

  delete: protectedProcedure
    .meta({ description: "Delete a vote" })
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.post.delete({
        where: {
          id: input.id,
        },
      });
    }),

  softDelete: protectedProcedure
    .meta({ description: "Soft delete a vote" })
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.post.update({
        where: {
          id: input.id,
        },
        data: {
          deletedAt: new Date(),
        },
      });
    }),
});
