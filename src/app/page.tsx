"use client";

import { unstable_noStore as noStore } from "next/cache";
import NextError from "next/error";
import { useContext, useEffect } from "react";

// HELPERS
import { api } from "~/trpc/react";

// PROVIDERS
import { UserContext } from "~/components/provider/user-provider";

// COMPONENTS
import { Page } from "~/components/layout/Page";
import { Post } from "~/components/common/Post";
import { Comment } from "~/components/common/Comment";

const Home = () => {
  noStore();

  // DATA
  const getPostList = api.post.getAll.useQuery(null);

  // HOOKS
  const currentUser = useContext(UserContext);

  // METHODS
  const onPostDeleted = () => getPostList.refetch();

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
    <Page isLoading={getPostList.isLoading}>
      {currentUser?.id && (
        <div className="mb-10">
          <Comment onPostAdded={async () => await getPostList.refetch()} />
        </div>
      )}

      {getPostList.data?.map((item) => (
        <Post
          post={item}
          key={item.id.toString()}
          onPostDeleted={onPostDeleted}
          clickable
        />
      ))}
    </Page>
  );
};

export default Home;
