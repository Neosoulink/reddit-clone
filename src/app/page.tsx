"use client";

import { unstable_noStore as noStore } from "next/cache";
import { api } from "~/trpc/react";
import { useUser } from "@clerk/nextjs";

// COMPONENTS
import { Post } from "~/components/common/Post";
import { Comment } from "~/components/common/Comment";
import SkeletonLoader from "~/components/common/SkeletonLoader";

const Home = () => {
  noStore();

  // DATA
  const getPostList = api.post.getAll.useQuery(null);

  // HOOKS
  const { user } = useUser();

  return (
    <main className="min-h-screen">
      {getPostList.isLoading ? (
        <div className="space-y-4">
          {["1", "2", "3", "4", "5"].map((n) => (
            <SkeletonLoader key={n} />
          ))}
        </div>
      ) : (
        <>
          {user?.id && (
            <Comment onPostAdded={async () => await getPostList.refetch()} />
          )}

          {getPostList.data?.map((item) => (
            <Post post={item} key={item.id.toString()} />
          ))}
        </>
      )}
    </main>
  );
};

export default Home;
