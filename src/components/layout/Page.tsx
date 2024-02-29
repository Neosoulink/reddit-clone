import React, { type PropsWithChildren } from "react";

export const Page: React.FC<PropsWithChildren> = ({ children }) => {
  return <main className="flex flex-1 flex-col">{children}</main>;
};
