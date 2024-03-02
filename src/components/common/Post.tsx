"use client";

import Link from "next/link";
import NextError from "next/error";
import React, { useContext, useEffect, useState } from "react";
import { formatDistance } from "date-fns";
import { Edit3Icon, Trash2Icon, XIcon } from "lucide-react";

// HELPERS
import { api } from "~/trpc/react";
import { type api as apiServer } from "~/trpc/server";

// TYPES
import { type RecursivePostRes } from "~/server/api/routers/post";

// PROVIDERS
import { UserContext } from "../provider/user-provider";

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
import { useRouter } from "next/navigation";

export const Post: React.FC<{
  post:
    | Awaited<ReturnType<typeof apiServer.post.getAll.query>>[0]
    | RecursivePostRes;
  asPostComment?: boolean;
  displayComment?: boolean;
  clickable?: boolean;
  onPostAdded?: Parameters<typeof Comment>["0"]["onPostAdded"];
  onPostDeleted?: () => unknown;
}> = ({
  post,
  asPostComment,
  displayComment,
  onPostAdded,
  onPostDeleted,
  clickable,
}) => {
  // DATA
  const currentUser = useContext(UserContext);

  // HOOKS
  const router = useRouter();
  const voteMutation = api.post.vote.useMutation({
    onSuccess: async (data) => {
      if (!data) return;

      post.upVotes = data?.upVotes;
      post.downVotes = data?.downVotes;
      post._count = data?._count;
    },
  });
  const [isCommentOpen, setIsCommentOpen] = useState(!!displayComment);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const deletePost = api.post.delete.useMutation({
    onSuccess: () => {
      setIsDeleted(true);
      onPostDeleted?.();
    },
  });

  // METHODS
  const onVote = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    type: "UP" | "DOWN",
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser?.isSignedIn)
      return router.push("/sign-in", { scroll: false });

    try {
      if (voteMutation.isLoading) return;

      voteMutation.mutate({ type, postId: post.id });
    } catch (_) {}
  };

  const toggleReply = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser?.isSignedIn)
      return router.push("/sign-in", { scroll: false });

    setIsCommentOpen(!isCommentOpen);
  };

  const onPostAddedAddon: typeof onPostAdded = (val) => {
    onPostAdded?.(val);
    setIsEditing(false);

    setIsCommentOpen(!!displayComment);
  };

  const onClickContent = () => {
    if (!clickable || deletePost.isLoading) return;
    router.push(`/post/${post.id}`, { scroll: false });
  };

  const onClickAvatar = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ) => {
    if (deletePost.isLoading) return;
    e.stopPropagation();
  };

  const onClickEdit = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    setIsCommentOpen(false);
    setIsEditing(true);
  };

  const onClickCancel = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.stopPropagation();
    setIsEditing(false);
  };

  const onClickDelete = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.stopPropagation();
    setIsCommentOpen(false);
    setIsEditing(false);
    deletePost.mutate({ id: post.id });
  };

  useEffect(() => {
    if (deletePost.error) {
      throw new NextError({
        title: deletePost.error.message ?? "Something went wrong!",
        statusCode: deletePost.error.data?.httpStatus ?? 500,
      });
    }
  }, [deletePost.error, deletePost.error?.data]);

  return (
    <div>
      <Card
        aria-disabled={deletePost.isLoading || isDeleted}
        className={`flex border-x-0 border-t-0 px-1 transition-colors hover:bg-gray-50 aria-disabled:pointer-events-none aria-disabled:opacity-80 ${asPostComment ? "flex-col-reverse border-0" : ""}`}
      >
        {!isEditing && (
          <div
            className={`flex items-center ${asPostComment ? "flex-row space-x-2" : "flex-col justify-center"}`}
          >
            <Button
              size="icon"
              variant="ghost"
              className={`h-8 w-8 cursor-pointer rounded-full ${currentUser?.isSignedIn && post?.upVotes?.length ? "text-indigo-500 dark:text-indigo-500" : ""}`}
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
              className={`h-8 w-8 cursor-pointer rounded-full ${currentUser?.isSignedIn && post?.downVotes?.length ? "text-indigo-500 dark:text-indigo-500" : ""}`}
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
                className="[open=true]:text-indigo-600 px-1 text-gray-700 hover:text-indigo-600 dark:hover:text-indigo-500 dark:data-[open=true]:text-indigo-500"
                data-open={isCommentOpen ? "true" : "false"}
                onClick={toggleReply}
              >
                <Icon type="REPLY" className="mr-2" /> Reply
              </Button>
            )}
          </div>
        )}

        <div onClick={onClickContent} className="flex-1 cursor-pointer">
          <CardHeader className="mb-2 flex-1 space-y-0 px-4 py-0 pt-6">
            <CardDescription className="mb-2 flex w-full items-center justify-between text-gray-600">
              <span className="flex">
                {!isEditing && (
                  <Link
                    href={post.author?.id ? `/user/${post.author.id}` : ""}
                    className="mr-2 rounded-full"
                    onClick={onClickAvatar}
                    scroll={false}
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
                )}
                {!asPostComment && "Posted by"}{" "}
                {post.authorId === currentUser?.id
                  ? "You"
                  : post.author?.username ?? "Unknown"}{" "}
                {formatDistance(post.createdAt, new Date(), {
                  addSuffix: true,
                }).replace(/about/gi, "")}{" "}
                {post.updatedAt &&
                post.updatedAt.toString() !== post.createdAt.toString()
                  ? "(edited)"
                  : ""}
              </span>

              {currentUser?.id === post.authorId && (
                <span className="flex items-center space-x-2 ">
                  {isEditing && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 cursor-pointer rounded-full"
                      disabled={deletePost.isLoading}
                      onClick={onClickCancel}
                    >
                      <XIcon size={16} />
                    </Button>
                  )}

                  {!isEditing && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 cursor-pointer rounded-full"
                        disabled={deletePost.isLoading}
                        onClick={onClickEdit}
                      >
                        <Edit3Icon size={16} />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 cursor-pointer rounded-full hover:bg-red-600/15 dark:hover:bg-red-600/15"
                        disabled={deletePost.isLoading}
                        onClick={onClickDelete}
                      >
                        {deletePost.isLoading ? (
                          <Icon
                            type="SPINNER"
                            className="h-4 w-4 text-red-600"
                          />
                        ) : (
                          <Trash2Icon size={16} className="text-red-600" />
                        )}
                      </Button>
                    </>
                  )}
                </span>
              )}
            </CardDescription>

            {!isEditing && <CardTitle>{post.title}</CardTitle>}
          </CardHeader>

          {!isEditing && (
            <CardContent className={`pl-4 ${asPostComment ? "pb-3" : "pb-10"}`}>
              {post.text}
            </CardContent>
          )}
        </div>
      </Card>

      {(isCommentOpen || isEditing) && (
        <Comment
          forPost={post}
          forEdition={isEditing}
          onPostAdded={onPostAddedAddon}
        />
      )}
    </div>
  );
};

export default Post;
