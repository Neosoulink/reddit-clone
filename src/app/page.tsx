"use client";

import { unstable_noStore as noStore } from "next/cache";
import { api } from "~/trpc/react";
import { useUser } from "@clerk/nextjs";

// COMPONENTS
import { Post } from "~/components/common/Post";
import { Comment } from "~/components/common/Comment";

const Home = () => {
  noStore();

  // DATA
  const getPostList = api.post.getAll.useQuery();

  // HOOKS
  const { user } = useUser();

  return (
    <main className="min-h-screen">
      {user?.id && (
        <Comment onPostAdded={async () => await getPostList.refetch()} />
      )}

      {getPostList.data?.map((item) => (
        <Post post={item} key={item.id.toString()} />
      ))}
    </main>
  );
};

export default Home;
