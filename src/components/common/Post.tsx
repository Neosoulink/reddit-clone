"use client";

import NextError from "next/error";
import { useRouter } from "next/navigation";
import React, { useContext, useEffect, useState } from "react";
import { formatDistance } from "date-fns";
import { Edit3Icon, Trash2Icon, XIcon } from "lucide-react";

// TYPES
import { type Post as ServerPost } from "@prisma/client";
import { type api as apiServer } from "~/trpc/server";

// HELPERS
import { api } from "~/trpc/react";

// TYPES
import { type RecursivePostRes } from "~/lib/server-utils";

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
import { AccordionTrigger } from "../ui/accordion";

export const Post: React.FC<{
  post:
    | Awaited<ReturnType<typeof apiServer.post.getAll.query>>[0]
    | RecursivePostRes;
  asPostComment?: boolean;
  displayComment?: boolean;
  clickable?: boolean;
  useAccordion?: boolean;
  onPostAdded?: Parameters<typeof Comment>["0"]["onPostAdded"];
  onPostEdited?: (post: ServerPost) => void;
  onPostDeleted?: (post: ServerPost) => void;
}> = ({
  post,
  asPostComment,
  displayComment,
  clickable,
  useAccordion,
  onPostAdded,
  onPostEdited,
  onPostDeleted,
}) => {
  // DATA
  const currentUser = useContext(UserContext);

  // HOOKS
  const router = useRouter();
  const [isCommentOpen, setIsCommentOpen] = useState(!!displayComment);
  const [isEditing, setIsEditing] = useState(false);
  const voteMutation = api.vote.set.useMutation({
    onSuccess: async (data) => {
      if (!data) return;

      post.upVotes = data?.upVotes;
      post.downVotes = data?.downVotes;
      post._count = data?._count;
    },
  });
  const deletePost = api.post.delete.useMutation({
    onSuccess: () => {
      onPostDeleted?.(post);
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

  const onPostAddedAddon: typeof onPostAdded = (newPost) => {
    onPostAdded?.(newPost);

    setIsCommentOpen(!!displayComment);
  };

  const onPostEditedAddon: typeof onPostAdded = (editedPost) => {
    onPostEdited?.(editedPost);

    post.title = editedPost.title;
    post.text = editedPost.text;
    post.updatedAt = editedPost.updatedAt;

    setIsEditing(false);
    setIsCommentOpen(!!displayComment);
  };

  const onClickContent = () => {
    if (!clickable || isEditing || deletePost.isLoading) return;
    router.push(`/post/${post.id}`, { scroll: false });
  };

  const onClickAvatar = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ) => {
    if (deletePost.isLoading) return;
    e.stopPropagation();

    router.push(post.author?.id ? `/user/${post.author.id}` : "", {
      scroll: false,
    });
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

  // LOCAL COMPONENTS
  const PostCard: React.FC = () => (
    <Card
      aria-disabled={deletePost.isLoading}
      className={`flex border-x-0 border-t-0 px-1 transition-colors hover:bg-gray-50 dark:hover:bg-gray-50/10 aria-disabled:pointer-events-none aria-disabled:opacity-80 ${asPostComment ? "flex-col-reverse border-0" : ""} flex-1 text-left`}
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
            <span
              className="flex flex-wrap items-center justify-start"
              onClick={onClickAvatar}
            >
              <span className="group mr-1 flex flex-wrap  items-center">
                {!isEditing && (
                  <Avatar className="mr-2 rounded-full transition-transform duration-200 group-hover:scale-110">
                    <AvatarImage
                      src={post.author?.imageUrl}
                      alt={post.author?.username ?? "Unknown"}
                    />
                    <AvatarFallback delayMs={600}>
                      {(post.author?.username ?? "X")[0]}
                    </AvatarFallback>
                  </Avatar>
                )}
                <span className="group-hover:text-indigo-500">
                  {!asPostComment && "Posted by"}{" "}
                  {post.authorId === currentUser?.id
                    ? "You"
                    : post.author?.username ?? "Unknown"}
                </span>
              </span>
              <span className="mr-1">
                {formatDistance(post.createdAt, new Date(), {
                  addSuffix: true,
                }).replace(/about/gi, "")}
              </span>
              <span className="mr-1">
                {post.updatedAt &&
                post.updatedAt.toString() !== post.createdAt.toString()
                  ? "(edited)"
                  : ""}
              </span>
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
                        <Icon type="SPINNER" className="h-4 w-4 text-red-600" />
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
          <CardContent
            className={`pl-4 text-base ${asPostComment ? "pb-3" : "pb-10"}`}
          >
            <span
              dangerouslySetInnerHTML={{
                __html: post.text.replace(/\n/g, "<br>"),
              }}
            />
          </CardContent>
        )}
      </div>
    </Card>
  );

  return (
    <div>
      {useAccordion ? (
        <AccordionTrigger
          className="items-start py-0"
          aria-details="absolute right-0 top-0 mr-1 mt-1"
        >
          <PostCard />
        </AccordionTrigger>
      ) : (
        <PostCard />
      )}

      {(isCommentOpen || isEditing) && (
        <Comment
          forPost={post}
          forEdition={isEditing}
          onPostAdded={onPostAddedAddon}
          onPostEdited={onPostEditedAddon}
        />
      )}
    </div>
  );
};

export default Post;
