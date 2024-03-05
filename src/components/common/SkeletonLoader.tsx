"use client";

import React, { useEffect, useState } from "react";
import { mathClamp } from "~/lib/utils";

export const SkeletonLoaderCard: React.FC = () => {
  return (
    <div className="rounded-md border dark:border-gray-50/5 px-4 py-6 shadow">
      <div className="flex animate-pulse space-x-4">
        <div className="h-6 w-6 rounded-full bg-gray-300 dark:bg-gray-50/20"></div>
        <div className="flex-1 space-y-6 py-1">
          <div className="h-2 rounded bg-gray-300 dark:bg-gray-50/20"></div>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 h-2 rounded bg-gray-300 dark:bg-gray-50/20"></div>
              <div className="col-span-1 h-2 rounded bg-gray-300 dark:bg-gray-50/20"></div>
            </div>
            <div className="h-2 rounded bg-gray-300 dark:bg-gray-50/20"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SkeletonLoader: React.FC = () => {
  const [cardToDisplay, setCardToDisplay] = useState(0);

  useEffect(() => {
    if (window) {
      const max = window.innerHeight / 210;
      setCardToDisplay(mathClamp(max, 1, max) + 1);
    }
  }, []);

  return (
    <div className="relative flex-1 space-y-4 overflow-hidden">
      {Array.from(Array(Math.round(cardToDisplay)).keys()).map((n) => (
        <SkeletonLoaderCard key={n} />
      ))}
    </div>
  );
};
