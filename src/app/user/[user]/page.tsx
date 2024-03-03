"use client";

import { unstable_noStore as noStore } from "next/cache";
import { useParams } from "next/navigation";
import NextError from "next/error";
import { useContext, useEffect, useState } from "react";

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

  // HOOKS
  const params = useParams<{ user: string }>();
  const currentUser = useContext(UserContext);
  const getPostList = api.post.getAll.useQuery(
    { byAuthorId: params.user },
    { enabled: false },
  );
  const [postList, setPostList] = useState<
    Exclude<(typeof getPostList)["data"], undefined>
  >([]);

  if (typeof params.user !== "string")
    throw new NextError({ title: "Not found", statusCode: 404 });

  // METHODS
  const onPostDeleted: Parameters<typeof Post>[0]["onPostDeleted"] = (post) => {
    setPostList(postList.filter((p) => post.id !== p.id));
  };

  useEffect(() => {
    if (getPostList.error) {
      throw new NextError({
        title: getPostList.error.message ?? "Something went wrong!",
        statusCode: getPostList.error.data?.httpStatus ?? 500,
        withDarkMode: false,
      });
    }
  }, [getPostList.error, getPostList.error?.data]);

  useEffect(() => {
    const init = async () => {
      await getPostList.refetch().then((res) => {
        setPostList(res.data ?? []);
      });
    };
    void init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Page isLoading={!getPostList.data}>
      <PageHeader
        label={
          getPostList.data?.length &&
          getPostList.data[0]?.author?.username &&
          currentUser?.id !== getPostList.data[0].authorId
            ? `${getPostList.data[0]?.author?.username}'s posts`
            : undefined
        }
      />

      {postList.map((post) => (
        <Post
          post={post}
          key={post.id.toString()}
          onPostDeleted={onPostDeleted}
          clickable
        />
      ))}
    </Page>
  );
};

export default Home;
