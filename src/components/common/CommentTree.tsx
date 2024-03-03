import React, { useContext } from "react";

// TYPES
import { type Post as ServerPost } from "@prisma/client";
import { type PostUser, type RecursivePostRes } from "~/lib/server-utils";

// PROVIDERS
import { UserContext } from "../provider/user-provider";

// COMPONENTS
import Post from "./Post";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

const CommentTree: React.FC<{
  props: {
    comments?: RecursivePostRes[];
    users: Record<string, PostUser>;
  };
  onStateChange?: (newData: RecursivePostRes[]) => void;
}> = ({ props, onStateChange }) => {
  // HOOKS
  const currentUser = useContext(UserContext);

  // METHODS
  const onReplyAdded = (
    newReply: ServerPost,
    currentPost: RecursivePostRes,
  ) => {
    if (!currentUser || !props.comments) return;

    currentPost.comments = [
      {
        ...newReply,
        upVotes: [],
        downVotes: [],
        _count: {
          upVotes: 0,
          downVotes: 0,
        },
        author: {
          id: currentUser.id,
          imageUrl: currentUser.imageUrl,
          username:
            currentUser.username ??
            currentUser.firstName ??
            currentUser.lastName ??
            "Unknown",
        },
      },
      ...(currentPost.comments ?? []),
    ];
    props.comments = currentPost.comments;
    onStateChange?.(props.comments);
  };

  const onCommentDeleted: Parameters<typeof Post>[0]["onPostDeleted"] = (
    post,
  ) => {
    if (props.comments) {
      props.comments = props.comments.filter((p) => post.id !== p.id);
      onStateChange?.(props.comments);
    }
  };

  return (
    <Accordion
      type="multiple"
      defaultValue={Array.from(Array(props.comments?.length ?? 0).keys()).map(
        (key) => key.toString(),
      )}
      className="mb-0 py-0"
    >
      {props.comments?.map((post, id) => {
        if (props.users[post.authorId])
          post.author = props.users[post.authorId];

        return (
          <AccordionItem
            value={id.toString()}
            key={id}
            defaultChecked
            className="border-b-0"
            aria-expanded
          >
            <AccordionTrigger
              className="items-start py-0"
              aria-colcount={post.comments?.length ?? 0}
            >
              <div className="flex-1 text-left">
                <Post
                  post={post}
                  asPostComment
                  onPostAdded={(newReply) => onReplyAdded(newReply, post)}
                  onPostDeleted={onCommentDeleted}
                />
              </div>
            </AccordionTrigger>

            {!!post.comments?.length && (
              <AccordionContent className="ml-8 pb-0">
                <CommentTree
                  props={{
                    comments: post.comments,
                    users: props.users,
                  }}
                  onStateChange={onStateChange}
                />
              </AccordionContent>
            )}
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};

export default CommentTree;
