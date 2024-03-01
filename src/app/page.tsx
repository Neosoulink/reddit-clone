"use client";

import { unstable_noStore as noStore } from "next/cache";
import NextError from "next/error";
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";

// HELPERS
import { api } from "~/trpc/react";

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

  useEffect(() => {
    if (getPostList.error) {
      throw new NextError({
        title: getPostList.error.message ?? "Something went wrong!",
        statusCode: getPostList.error.data?.httpStatus ?? 500,
        withDarkMode: false,
      });
    }
  }, [getPostList.error, getPostList.error?.data]);

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
