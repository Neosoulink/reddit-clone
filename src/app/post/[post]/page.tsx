"use client";

import { type NextPage } from "next";
import NextError from "next/error";
import { unstable_noStore as noStore } from "next/cache";
import { useContext, useEffect } from "react";
import { useParams } from "next/navigation";

// HELPERS
import { api } from "~/trpc/react";

// TYPES
import { type RecursivePostRes } from "~/server/api/routers/post";

// PROVIDER
import { UserContext } from "~/components/provider/user-provider";

// COMPONENTS
import { Page } from "~/components/layout/Page";
import { PageHeader } from "~/components/common/PageHeader";
import { Post } from "~/components/common/Post";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";

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
  const currentUser = useContext(UserContext);

  // LOCAL COMPONENTS
  const DisplayComments = (_: { data?: RecursivePostRes[] }) => {
    return (
      <Accordion
        type="multiple"
        defaultValue={Array.from(Array(_.data?.length ?? 0).keys()).map((key) =>
          key.toString(),
        )}
        className="mb-0 py-0"
      >
        {_.data?.map((post, id) => (
          <AccordionItem
            value={id.toString()}
            key={id}
            defaultChecked
            className="border-b-0"
            aria-expanded
          >
            <AccordionTrigger
              className="items-start py-0"
              aria-colcount={post.comments?.length ?? 0}
            >
              <div className="flex-1 text-left">
                <Post
                  post={post}
                  asPostComment
                  onPostAdded={() => getRecursivePosts.refetch()}
                  onPostDeleted={() => getRecursivePosts.refetch()}
                />
              </div>
            </AccordionTrigger>

            {!!post.comments?.length && (
              <AccordionContent className="ml-8 pb-0">
                <DisplayComments data={post.comments} />
              </AccordionContent>
            )}
          </AccordionItem>
        ))}
      </Accordion>
    );
  };

  // METHODS
  const onPostAdded = async () => await getRecursivePosts.refetch();
  const onPostDeleted = () => getRecursivePosts.refetch();

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
            displayComment={!!currentUser?.id}
            onPostAdded={onPostAdded}
            onPostDeleted={onPostDeleted}
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
