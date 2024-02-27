import React, { type HTMLAttributes } from "react";

// COMPONENTS
import { HomeIcon } from "./Home";
import { CommentIcon } from "./CommentIcon";
import { LoginIcon } from "./LoginIcon";

export const Icon = (props: {
  type: "HOME" | "COMMENT" | "LOGIN" | "UP_VOTE" | "DOWN_VOTE";
  className?: HTMLAttributes<HTMLSpanElement>["className"];
}) => {
  return (
    <span className={props.className}>
      {props.type === "HOME" && <HomeIcon />}
      {props.type === "COMMENT" && <CommentIcon />}
      {props.type === "LOGIN" && <LoginIcon />}
    </span>
  );
};
