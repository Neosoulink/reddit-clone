"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";

// COMPONENTS
import { Button } from "../ui/button";
import { Icon } from "../Icon";

export const SidebarButton: React.FC<{
  iconType: Parameters<typeof Icon>[0]["type"];
  label: string;
  url?: string;
}> = ({ iconType, label, url }) => {
  const router = useRouter();
  const pathName = usePathname();

  return (
    <Button
      variant="ghost"
      className={`justify-start hover:bg-gray-50 px-2 md:px-4 sm:py-3 sm:text-base ${pathName === url ? "dark:text-white text-indigo-600 dark:bg-gray-50/5" : ""}`}
      onClick={async () => {
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
