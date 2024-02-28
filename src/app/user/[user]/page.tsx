"use client";

import { unstable_noStore as noStore } from "next/cache";
import { useParams } from "next/navigation";
import NextError from "next/error";
import { api } from "~/trpc/react";

// COMPONENTS
import { Post } from "~/components/common/Post";
import { BackButton } from "~/components/common/BackButton";

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
        "Loading..."
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
