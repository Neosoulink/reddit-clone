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
      className={`justify-start px-2 hover:bg-gray-50 sm:py-3 sm:text-base md:px-4 ${pathName === url ? "dark:text-white text-indigo-600 dark:bg-gray-50/5" : ""}`}
      onClick={async () => {
        if (url) router.push(url, { scroll: false });
      }}
    >
      <>
        <Icon type={iconType} className="mr-1 sm:mr-4" />
        {label}
      </>
    </Button>
  );
};
