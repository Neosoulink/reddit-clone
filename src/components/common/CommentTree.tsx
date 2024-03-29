import React, { useContext } from "react";

// TYPES
import { type Post as ServerPost } from "@prisma/client";
import { type PostUser, type RecursivePostRes } from "~/lib/server-utils";

// PROVIDERS
import { UserContext } from "../provider/user-provider";

// COMPONENTS
import Post from "./Post";
import { Accordion, AccordionContent, AccordionItem } from "../ui/accordion";

const CommentTree: React.FC<{
  props: {
    comments?: RecursivePostRes[];
    users: Record<string, PostUser>;
  };
  onStateChange?: () => void;
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
    onStateChange?.();
  };

  const onCommentDeleted: Parameters<typeof Post>[0]["onPostDeleted"] = (
    oldPost,
  ) => {
    if (props.comments) {
      const clone = JSON.parse(
        JSON.stringify(props.comments.filter((p) => oldPost.id !== p.id)),
      ) as typeof props.comments;
      props.comments.length = 0;
      props.comments.push(...clone);
      onStateChange?.();
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
            <Post
              post={post}
              useAccordion={!!post.comments?.length}
              asPostComment
              onPostAdded={(newReply) => onReplyAdded(newReply, post)}
              onPostDeleted={onCommentDeleted}
            />

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
