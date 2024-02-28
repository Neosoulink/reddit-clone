"use client";

import React from "react";
import { useClerk } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";

// COMPONENTS
import { Button } from "../ui/button";
import { Icon } from "../Icon";

export const SidebarButton: React.FC<{
  iconType: Parameters<typeof Icon>[0]["type"];
  label: string;
  triggerLogin?: boolean;
  url?: string;
}> = ({ iconType, label, triggerLogin, url }) => {
  const clerk = useClerk();
  const router = useRouter();
  const pathName = usePathname();

  return (
    <Button
      variant="ghost"
      className={`justify-start stroke-gray-700 hover:bg-gray-50 hover:stroke-indigo-500 sm:py-3 sm:text-base ${pathName === url ? "!stroke-indigo-600 !text-indigo-600" : ""}`}
      onClick={async () => {
        if (triggerLogin) return await clerk.redirectToSignIn();

        if (url) router.push(url);
      }}
    >
      <>
        <Icon type={iconType} className="mr-1 sm:mr-4" />
        {label}
      </>
    </Button>
  );
};
