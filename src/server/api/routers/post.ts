import { VoteEnum } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

// HELPERS

export const postRouter = createTRPCRouter({
  create: protectedProcedure
    .meta({ description: "Create a post" })
    .input(z.object({ title: z.string().min(1), text: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.post.create({
        data: {
          ...input,
          authorId: ctx.auth.userId,
        },
      });
    }),

  getAll: publicProcedure
    .meta({ description: "Get all posts" })
    .query(({ ctx }) => {
      return ctx.db.post.findMany({
        orderBy: { createdAt: "desc" },
      });
    }),

  getOne: publicProcedure
    .meta({ description: "Get a post and comments" })
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.db.post.findUnique({
        where: { id: input.id },
        include: {
          comments: {
            include: {
              comments: {
                include: { comments: { include: { comments: true } } },
              },
            },
          },
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

      return post;
    }),

  vote: protectedProcedure
    .meta({ description: "Upvote or Downvote" })
    .input(
      z.object({
        postId: z.number(),
        type: z.enum([VoteEnum.UP, VoteEnum.DOWN]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const currentVote = await ctx.db.vote.findFirst({
        where: { userId: ctx.auth.userId, postId: input.postId },
      });

      if (currentVote && input.type === currentVote.voteType)
        return ctx.db.vote.delete({ where: { id: currentVote.id } });

      if (currentVote)
        return ctx.db.vote.update({
          data: { voteType: input.type },
          where: { id: currentVote.id },
        });

      return ctx.db.vote.create({
        data: {
          userId: ctx.auth.userId,
          postId: input.postId,
          voteType: input.type,
        },
      });
    }),

  edit: protectedProcedure
    .meta({ description: "Edit a vote" })
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
      const deleteVotes = ctx.db.vote.deleteMany({
        where: {
          postId: input.id,
        },
      });

      const deletePost = ctx.db.post.delete({
        where: {
          id: input.id,
        },
      });

      return ctx.db.$transaction([deleteVotes, deletePost]);
    }),
});
