"use client";

import { unstable_noStore as noStore } from "next/cache";
import { useParams } from "next/navigation";
import NextError from "next/error";
import { useContext, useEffect } from "react";

// HELPERS
import { api } from "~/trpc/react";

// PROVIDERS
import { UserContext } from "~/components/provider/user-provider";

// COMPONENTS
import { Page } from "~/components/layout/Page";
import { PageHeader } from "~/components/common/PageHeader";
import { Post } from "~/components/common/Post";

const Home = () => {
  noStore();

  // DATA
  const params = useParams<{ user: string }>();
  const currentUser = useContext(UserContext);

  if (typeof params.user !== "string")
    throw new NextError({ title: "Not found", statusCode: 404 });

  const getPostList = api.post.getAll.useQuery({ byAuthorId: params.user });

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
    <Page isLoading={getPostList.isLoading || !getPostList.data}>
      <PageHeader
        label={
          getPostList.data?.length &&
          getPostList.data[0]?.author?.username &&
          currentUser?.id !== getPostList.data[0].authorId
            ? `${getPostList.data[0]?.author?.username}'s posts`
            : undefined
        }
      />

      {getPostList.data?.map((item) => (
        <Post
          post={item}
          key={item.id.toString()}
          onPostDeleted={onPostDeleted}
        />
      ))}
    </Page>
  );
};

export default Home;
