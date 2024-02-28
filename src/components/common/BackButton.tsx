import React from "react";
import Link from "next/link";

// COMPONENTS
import { Button } from "../ui/button";
import { Icon } from "../Icon";

export const BackButton: React.FC = () => (
  <div className="mb-4">
    <Button asChild variant="destructive" className="text-gray-700">
      <Link href="/">
        <Icon type="ARROW_BACK" className="mr-4" /> Back to posts
      </Link>
    </Button>
  </div>
);
