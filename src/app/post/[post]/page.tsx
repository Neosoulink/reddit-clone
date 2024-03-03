"use client";

import { type NextPage } from "next";
import NextError from "next/error";
import { unstable_noStore as noStore } from "next/cache";
import { useContext, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

// HELPERS
import { api } from "~/trpc/react";

// TYPES
import { type RecursivePostRes } from "~/lib/server-utils";

// PROVIDER
import { UserContext } from "~/components/provider/user-provider";

// COMPONENTS
import { Page } from "~/components/layout/Page";
import { PageHeader } from "~/components/common/PageHeader";
import { Post } from "~/components/common/Post";
import CommentTree from "~/components/common/CommentTree";

const PostPage: NextPage = () => {
  noStore();

  const params = useParams<{ post: string }>();

  if (typeof params.post !== "string" || !/^[0-9]+$/gi.test(params.post))
    throw new NextError({ title: "Not found", statusCode: 404 });

  // HOOKS
  const currentUser = useContext(UserContext);
  const router = useRouter();
  const getRecursivePosts = api.post.getOne.useQuery(
    {
      id: Number(params.post),
    },
    { enabled: false, trpc: { abortOnUnmount: true } },
  );
  const [postList, setPostList] = useState<RecursivePostRes | undefined>(
    undefined,
  );
  const [postCommentList, setPostCommentList] = useState<RecursivePostRes[]>(
    [],
  );

  // METHODS
  const onMainCommentAdded: Parameters<typeof Post>[0]["onPostAdded"] = (
    post,
  ) => {
    if (!currentUser || !postList) return;

    setPostCommentList([
      {
        ...post,
        upVotes: [],
        downVotes: [],
        _count: {
          upVotes: 0,
          downVotes: 0,
        },
        author: {
          id: currentUser.id,
          imageUrl: currentUser.imageUrl,
          username:
            currentUser.username ??
            currentUser.firstName ??
            currentUser.lastName ??
            "Unknown",
        },
        comments: [],
      },
      ...postCommentList,
    ]);
  };
  const onMainPostDeleted = () => {
    router.replace("/");
  };
  const onCommentTreeStateChange: Parameters<
    typeof CommentTree
  >[0]["onStateChange"] = (newData) => {
    setPostCommentList([]);
    setTimeout(() => setPostCommentList(newData), 0);
  };

  useEffect(() => {
    const init = async () => {
      await getRecursivePosts.refetch().then((res) => {
        setPostList(res.data?.post);
        setPostCommentList(res.data?.post.comments ?? []);
      });
    };
    void init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      {postList && getRecursivePosts.data && (
        <>
          <Post
            post={{
              ...postList,
              author: getRecursivePosts.data.users[postList.authorId],
            }}
            displayComment={!!currentUser?.id}
            onPostAdded={onMainCommentAdded}
            onPostDeleted={onMainPostDeleted}
          />

          <section className="pt-10">
            <h2 className="dark:text-gray-50">All comments</h2>
            {
              <CommentTree
                props={{
                  comments: postCommentList,
                  users: getRecursivePosts.data.users,
                }}
                onStateChange={onCommentTreeStateChange}
              />
            }
          </section>
        </>
      )}
    </Page>
  );
};

export default PostPage;
