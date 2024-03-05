import React from "react";
import { useRouter } from "next/navigation";

// COMPONENTS
import { Button } from "../ui/button";
import { Icon } from "../Icon";

export const PageHeader: React.FC<{ label?: string }> = ({ label }) => {
  const router = useRouter();

  return (
    <div className="mb-4 flex flex-row items-center justify-between">
      <Button
        variant="destructive"
        className="text-gray-700"
        onClick={() => router.push("/")}
      >
        <Icon type="ARROW_BACK" className="mr-4" /> Back to posts
      </Button>

      {!!label && <h2 className="text-sm md:text-base">{label}</h2>}
    </div>
  );
};
