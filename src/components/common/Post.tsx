"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import { formatDistance } from "date-fns";

// HELPERS
import { api } from "~/trpc/react";
import { type api as apiServer } from "~/trpc/server";

// TYPES
import { type RecursivePostRes } from "~/server/api/routers/post";

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
import { Comment } from "./Comment";

export const Post: React.FC<{
  post:
    | Awaited<ReturnType<typeof apiServer.post.getAll.query>>[0]
    | RecursivePostRes;
  asPostComment?: boolean;
  displayComment?: boolean;
  onPostAdded?: Parameters<typeof Comment>["0"]["onPostAdded"];
}> = ({ post, asPostComment, displayComment, onPostAdded }) => {
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
  const [isCommentOpen, setIsCommentOpen] = useState(!!displayComment);

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

  const toggleReply = () => {
    if (!isSignedIn) return clerk.redirectToSignIn({});

    setIsCommentOpen(!isCommentOpen);
  };

  const onPostAddedAddon: typeof onPostAdded = (val) => {
    onPostAdded?.(val);

    setIsCommentOpen(!!displayComment);
  };

  return (
    <div>
      <Card
        className={`flex border-x-0 border-t-0 transition-colors hover:bg-gray-50 ${asPostComment ? "flex-col-reverse border-0" : ""}`}
      >
        <div
          className={`flex items-center ${asPostComment ? "flex-row space-x-2" : "flex-col justify-center"}`}
        >
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

          {!!asPostComment && (
            <Button
              variant="destructive"
              size="sm"
              className="px-1 text-gray-700 hover:text-indigo-600 data-[open=true]:text-indigo-600"
              data-open={isCommentOpen ? "true" : "false"}
              onClick={toggleReply}
            >
              <Icon type="REPLY" className="mr-2" /> Reply
            </Button>
          )}
        </div>

        <Link href={`/post/${post.id}`}>
          <CardHeader className="mb-2 flex-1 space-y-0 py-0 pl-4 pt-6">
            <CardDescription className="mb-2 flex items-center text-gray-600">
              <Link
                href={post.author?.id ? `/user/${post.author.id}` : ""}
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
              {!asPostComment && "Posted by"}{" "}
              {post.author?.username ?? "Unknown"}{" "}
              {formatDistance(post.createdAt, new Date(), {
                addSuffix: true,
              }).replace(/about/gi, "")}
            </CardDescription>

            <CardTitle>{post.title}</CardTitle>
          </CardHeader>

          <CardContent
            className={`pl-4 text-gray-700 ${asPostComment ? "pb-3" : "pb-10"}`}
          >
            {post.text}
          </CardContent>
        </Link>
      </Card>

      {isCommentOpen && (
        <Comment forPost={post.id} onPostAdded={onPostAddedAddon} />
      )}
    </div>
  );
};

export default Post;
