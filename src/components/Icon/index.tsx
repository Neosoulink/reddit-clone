import React, { type HTMLAttributes } from "react";

// COMPONENTS
import { HomeIcon } from "./Home";
import { CommentIcon } from "./CommentIcon";
import { LoginIcon } from "./LoginIcon";
import { UpvoteIcon } from "./UpvoteIcon";
import { DownvoteIcon } from "./DownvoteIcon";
import { SpinnerIcon } from "./SpinnerIcon";
import { ArrowBackIcon } from "./ArrowBackIcon";
import { ReplyIcon } from "./ReplyIcon";
export const Icon = (props: {
  type:
    | "HOME"
    | "COMMENT"
    | "LOGIN"
    | "UP_VOTE"
    | "DOWN_VOTE"
    | "SPINNER"
    | "ARROW_BACK"
    | "REPLY";
  className?: HTMLAttributes<HTMLSpanElement>["className"];
}) => {
  return (
    <span className={props.className}>
      {props.type === "HOME" && <HomeIcon />}
      {props.type === "COMMENT" && <CommentIcon />}
      {props.type === "LOGIN" && <LoginIcon />}
      {props.type === "UP_VOTE" && <UpvoteIcon />}
      {props.type === "DOWN_VOTE" && <DownvoteIcon />}
      {props.type === "SPINNER" && <SpinnerIcon />}
      {props.type === "ARROW_BACK" && <ArrowBackIcon />}
      {props.type === "REPLY" && <ReplyIcon />}
    </span>
  );
};
