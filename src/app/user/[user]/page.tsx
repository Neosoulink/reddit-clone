"use client";

import { unstable_noStore as noStore } from "next/cache";
import { useParams } from "next/navigation";
import NextError from "next/error";
import { api } from "~/trpc/react";

// COMPONENTS
import { Post } from "~/components/common/Post";
import { BackButton } from "~/components/common/BackButton";
import SkeletonLoader from "~/components/common/SkeletonLoader";

const Home = () => {
  noStore();

  const params = useParams<{ user: string }>();

  if (typeof params.user !== "string")
    throw new NextError({ title: "Not found", statusCode: 404 });

  // DATA
  const getPostList = api.post.getAll.useQuery({ byAuthorId: params.user });

  return (
    <main className="min-h-screen">
      <BackButton />

      {getPostList.isLoading || !getPostList.data ? (
        <div className="space-y-4">
          {["1", "2", "3", "4", "5"].map((n) => (
            <SkeletonLoader key={n} />
          ))}
        </div>
      ) : (
        <>
          {getPostList.data?.map((item) => (
            <Post post={item} key={item.id.toString()} />
          ))}
        </>
      )}
    </main>
  );
};

export default Home;
