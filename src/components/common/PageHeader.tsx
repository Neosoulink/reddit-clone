import React from "react";
import Link from "next/link";

// COMPONENTS
import { Button } from "../ui/button";
import { Icon } from "../Icon";

export const PageHeader: React.FC<{ label?: string }> = ({ label }) => {
  return (
    <div className="mb-4 flex flex-row items-center justify-between">
      <Button asChild variant="destructive" className="text-gray-700">
        <Link href="/" scroll={false}>
          <Icon type="ARROW_BACK" className="mr-4" /> Back to posts
        </Link>
      </Button>

      {!!label && <h2 className="text-sm md:text-base">{label}</h2>}
    </div>
  );
};
