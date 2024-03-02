"use client";

import { type NextPage } from "next";
import NextError from "next/error";
import { unstable_noStore as noStore } from "next/cache";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";

// HELPERS
import { api } from "~/trpc/react";

// TYPES
import { type RecursivePostRes } from "~/server/api/routers/post";

// COMPONENTS
import { Page } from "~/components/layout/Page";
import { PageHeader } from "~/components/common/PageHeader";
import { Post } from "~/components/common/Post";

const PostPage: NextPage = () => {
  noStore();

  const params = useParams<{ post: string }>();

  if (typeof params.post !== "string" || !/^[0-9]+$/gi.test(params.post))
    throw new NextError({ title: "Not found", statusCode: 404 });

  // DATA
  const getRecursivePosts = api.post.getOne.useQuery({
    id: Number(params.post),
  });

  // HOOKS
  const { user } = useUser();

  // LOCAL COMPONENTS
  const DisplayComments = (_: { data?: RecursivePostRes[] }) => {
    return (
      <ul>
        {_.data?.map((post, id) => (
          <li key={id.toString()}>
            <Post
              post={post}
              asPostComment
              onPostAdded={() => getRecursivePosts.refetch()}
              onPostDeleted={() => getRecursivePosts.refetch()}
            />

            <div className="ml-8">
              <DisplayComments data={post.comments} />
            </div>
          </li>
        ))}
      </ul>
    );
  };

  useEffect(() => {
    if (getRecursivePosts.error) {
      throw new NextError({
        title: getRecursivePosts.error.message ?? "Something went wrong!",
        statusCode: getRecursivePosts.error.data?.httpStatus ?? 500,
        withDarkMode: false,
      });
    }
  }, [getRecursivePosts.error, getRecursivePosts.error?.data]);

  return (
    <Page isLoading={getRecursivePosts.isLoading}>
      <PageHeader />

      {getRecursivePosts.data && (
        <>
          <Post
            post={getRecursivePosts.data}
            displayComment={!!user?.id}
            onPostAdded={async () => await getRecursivePosts.refetch()}
            onPostDeleted={() => getRecursivePosts.refetch()}
          />

          <section className="pt-10">
            <h2 className="dark:text-gray-50">All comments</h2>
            {DisplayComments({ data: getRecursivePosts.data.comments })}
          </section>
        </>
      )}
    </Page>
  );
};

export default PostPage;
