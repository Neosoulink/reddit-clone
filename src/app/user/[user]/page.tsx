"use client";

import { unstable_noStore as noStore } from "next/cache";
import { useParams } from "next/navigation";
import NextError from "next/error";
import { api } from "~/trpc/react";

// COMPONENTS
import { Page } from "~/components/layout/Page";
import { Post } from "~/components/common/Post";
import { BackButton } from "~/components/common/BackButton";
import { SkeletonLoader } from "~/components/common/SkeletonLoader";

const Home = () => {
  noStore();

  const params = useParams<{ user: string }>();

  if (typeof params.user !== "string")
    throw new NextError({ title: "Not found", statusCode: 404 });

  // DATA
  const getPostList = api.post.getAll.useQuery({ byAuthorId: params.user });

  return (
    <Page>
      <BackButton />

      {getPostList.isLoading || !getPostList.data ? (
        <SkeletonLoader />
      ) : (
        <>
          {getPostList.data?.map((item) => (
            <Post post={item} key={item.id.toString()} />
          ))}
        </>
      )}
    </Page>
  );
};

export default Home;
