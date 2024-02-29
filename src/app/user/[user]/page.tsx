"use client";

import { unstable_noStore as noStore } from "next/cache";
import { useParams } from "next/navigation";
import NextError from "next/error";
import { api } from "~/trpc/react";
import { useUser } from "@clerk/nextjs";

// COMPONENTS
import { Page } from "~/components/layout/Page";
import { PageHeader } from "~/components/common/PageHeader";
import { Post } from "~/components/common/Post";
import { SkeletonLoader } from "~/components/common/SkeletonLoader";

const Home = () => {
  noStore();

  // DATA
  const params = useParams<{ user: string }>();
  const { user } = useUser();

  if (typeof params.user !== "string")
    throw new NextError({ title: "Not found", statusCode: 404 });

  const getPostList = api.post.getAll.useQuery({ byAuthorId: params.user });

  return (
    <Page>
      <PageHeader
        label={
          getPostList.data?.length &&
          getPostList.data[0]?.author?.username &&
          user?.id !== getPostList.data[0].authorId
            ? `${getPostList.data[0]?.author?.username}'s posts`
            : undefined
        }
      />

      {getPostList.isLoading || !getPostList.data ? (
        <SkeletonLoader />
      ) : (
        <>
          {getPostList.data.map((item) => (
            <Post post={item} key={item.id.toString()} />
          ))}
        </>
      )}
    </Page>
  );
};

export default Home;
