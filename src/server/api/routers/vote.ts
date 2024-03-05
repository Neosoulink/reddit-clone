import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

// UTILS
import { VoteType } from "@prisma/client";
import { getVotes } from "~/lib/server-utils";
import { TRPCError } from "@trpc/server";

export const voteRouter = createTRPCRouter({
  set: protectedProcedure
    .meta({ description: "Upvote or Downvote" })
    .input(
      z.object({
        postId: z.number(),
        type: z.enum([VoteType.UP, VoteType.DOWN]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.post.findUnique({
        where: { id: input.postId },
        select: {
          id: true,
          ...getVotes(ctx.auth),
        },
      });
      const initialPost = JSON.parse(JSON.stringify(post)) as typeof post;

      if (!post)
        throw new TRPCError({
          message: "Post Not Found",
          code: "NOT_FOUND",
        });

      if (post?.upVotes[0]) {
        await ctx.db.upVote.delete({
          where: { id: post.upVotes[0].id },
        });

        post.upVotes = [];
        post._count.upVotes -= 1;
      }

      if (post?.downVotes[0]) {
        await ctx.db.downVote.delete({
          where: { id: post.downVotes[0].id },
        });

        post.downVotes = [];
        post._count.downVotes -= 1;
      }

      if (!initialPost?.upVotes[0] && input.type === "UP") {
        post.upVotes = [
          await ctx.db.upVote.create({
            data: {
              userId: ctx.auth.userId,
              postId: input.postId,
            },
          }),
        ];
        post._count.upVotes += 1;
      }

      if (!initialPost?.downVotes[0] && input.type === "DOWN") {
        post.downVotes = [
          await ctx.db.downVote.create({
            data: {
              userId: ctx.auth.userId,
              postId: input.postId,
            },
          }),
        ];
        post._count.downVotes += 1;
      }

      return post;
    }),
});
