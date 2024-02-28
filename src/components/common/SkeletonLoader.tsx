import React from "react";

export const SkeletonLoader: React.FC = () => {
  return (
    <div className="rounded-md border px-4 py-6 shadow">
      <div className="flex animate-pulse space-x-4">
        <div className="h-6 w-6 rounded-full bg-gray-300"></div>
        <div className="flex-1 space-y-6 py-1">
          <div className="h-2 rounded bg-gray-300"></div>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 h-2 rounded bg-gray-300"></div>
              <div className="col-span-1 h-2 rounded bg-gray-300"></div>
            </div>
            <div className="h-2 rounded bg-gray-300"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonLoader;
