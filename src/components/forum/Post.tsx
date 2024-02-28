"use client";

import Link from "next/link";
import React from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import { formatDistance } from "date-fns";

// HELPERS
import { api } from "~/trpc/react";
import { type api as apiServer } from "~/trpc/server";

// COMPONENTS
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Icon } from "../Icon";

const Post: React.FC<{
  post: Awaited<ReturnType<typeof apiServer.post.getAll.query>>[0];
}> = ({ post }) => {
  const { isSignedIn } = useUser();
  const clerk = useClerk();

  // HOOKS
  const voteMutation = api.post.vote.useMutation({
    onSuccess: async (data) => {
      if (!data) return;

      post.upVotes = data?.upVotes;
      post.downVotes = data?.downVotes;
      post._count = data?._count;
    },
  });

  // METHODS
  const onVote = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    type: "UP" | "DOWN",
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isSignedIn) return clerk.redirectToSignIn({});

    try {
      if (voteMutation.isLoading) return;

      voteMutation.mutate({ type, postId: post.id });
    } catch (error) {}
  };

  return (
    <Card className="flex border-x-0 transition-colors hover:bg-gray-50">
      <div className="flex flex-col items-center justify-center">
        <Button
          size="icon"
          variant="ghost"
          className={`h-8 w-8 cursor-pointer rounded-full stroke-gray-700 hover:stroke-indigo-600 ${post?.upVotes?.length ? "!stroke-indigo-600" : ""}`}
          type="button"
          disabled={voteMutation.isLoading}
          onClick={(e) => onVote(e, "UP")}
        >
          <Icon type="UP_VOTE" />
        </Button>

        <span className="text-base">
          {post._count.upVotes - post._count.downVotes}
        </span>

        <Button
          size="icon"
          variant="ghost"
          className={`h-8 w-8 cursor-pointer rounded-full stroke-gray-700 hover:stroke-indigo-600 ${post?.downVotes?.length ? "!stroke-indigo-600" : ""}`}
          type="button"
          disabled={voteMutation.isLoading}
          onClick={(e) => onVote(e, "DOWN")}
        >
          <Icon type="DOWN_VOTE" />
        </Button>
      </div>

      <Link href={`/post/${post.id}`}>
        <CardHeader className="mb-2 flex-1 space-y-0 py-0 pl-4 pt-6">
          <CardDescription className="mb-2 flex items-center text-gray-600">
            <Link
              href={post.author.id ? `/user/${post.author.id}` : ""}
              className="mr-2 rounded-full"
            >
              <Avatar>
                <AvatarImage
                  src={post.author?.imageUrl}
                  alt={post.author?.username ?? "Unknown"}
                />
                <AvatarFallback>
                  {(post.author?.username ?? "X")[0]}
                </AvatarFallback>
              </Avatar>
            </Link>
            Posted by {post.author?.username ?? "Unknown"}{" "}
            {formatDistance(post.createdAt, new Date(), {
              addSuffix: true,
            }).replace(/about/gi, "")}
          </CardDescription>

          <CardTitle>{post.title}</CardTitle>
        </CardHeader>

        <CardContent className="pb-10 pl-4 text-gray-700">
          {post.text}
        </CardContent>
      </Link>
    </Card>
  );
};

export default Post;
