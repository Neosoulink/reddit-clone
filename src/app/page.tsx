"use client";

import { unstable_noStore as noStore } from "next/cache";
import NextError from "next/error";
import { useContext, useEffect, useState } from "react";

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

  // HOOKS
  const currentUser = useContext(UserContext);
  const getPostList = api.post.getAll.useQuery(null, { enabled: false });
  const [postList, setPostList] = useState<
    Exclude<(typeof getPostList)["data"], undefined>
  >([]);

  // METHODS
  const onPostAdded: Parameters<typeof Post>[0]["onPostAdded"] = (post) => {
    if (!currentUser) return;
    setPostList([
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
          username: currentUser.username,
        },
      },
      ...postList,
    ]);
  };
  const onPostDeleted: Parameters<typeof Post>[0]["onPostDeleted"] = (post) => {
    setPostList(postList.filter((p) => post.id !== p.id));
  };

  useEffect(() => {
    const init = async () => {
      await getPostList.refetch().then((res) => {
        setPostList(res.data ?? []);
      });
    };
    void init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          <Comment onPostAdded={onPostAdded} />
        </div>
      )}

      {postList?.map((item) => (
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
