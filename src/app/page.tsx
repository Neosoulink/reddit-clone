"use client";

import { unstable_noStore as noStore } from "next/cache";
import { api } from "~/trpc/react";
import { useUser } from "@clerk/nextjs";

// COMPONENTS
import { Page } from "~/components/layout/Page";
import { Post } from "~/components/common/Post";
import { Comment } from "~/components/common/Comment";
import { SkeletonLoader } from "~/components/common/SkeletonLoader";

const Home = () => {
  noStore();

  // DATA
  const getPostList = api.post.getAll.useQuery(null);

  // HOOKS
  const { user } = useUser();

  return (
    <Page>
      {getPostList.isLoading ? (
        <SkeletonLoader />
      ) : (
        <>
          {user?.id && (
            <Comment onPostAdded={async () => await getPostList.refetch()} />
          )}

          {getPostList.data?.map((item) => (
            <Post
              post={item}
              key={item.id.toString()}
              onPostDeleted={() => getPostList.refetch()}
            />
          ))}
        </>
      )}
    </Page>
  );
};

export default Home;
