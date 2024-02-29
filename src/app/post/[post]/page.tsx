"use client";

import { type NextPage } from "next";
import NextError from "next/error";
import { unstable_noStore as noStore } from "next/cache";
import { useParams } from "next/navigation";
import { api } from "~/trpc/react";
import { useUser } from "@clerk/nextjs";

// TYPES
import { type RecursivePostRes } from "~/server/api/routers/post";

// COMPONENTS
import { Page } from "~/components/layout/Page";
import { Post } from "~/components/common/Post";
import { BackButton } from "~/components/common/BackButton";
import { SkeletonLoader } from "~/components/common/SkeletonLoader";

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
              asPostComment
              onPostAdded={() => getRecursivePosts.refetch()}
              post={post}
            />

            <div className="ml-8">
              <DisplayComments data={post.comments} />
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <Page>
      <BackButton />

      {getRecursivePosts.isLoading ? (
        <SkeletonLoader />
      ) : (
        <>
          {getRecursivePosts.data && (
            <>
              <Post
                post={getRecursivePosts.data}
                onPostAdded={async () => await getRecursivePosts.refetch()}
                displayComment={!!user?.id}
              />

              <section>
                <h2>All comments</h2>
                {DisplayComments({ data: getRecursivePosts.data.comments })}
              </section>
            </>
          )}
        </>
      )}
    </Page>
  );
};

export default PostPage;
