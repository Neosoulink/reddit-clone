"use client";

import React, { useContext, useEffect } from "react";
import NextError from "next/error";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Post } from "@prisma/client";

// HELPERS
import { api } from "~/trpc/react";

// PROVIDERS
import { UserContext } from "../provider/user-provider";

// COMPONENTS
import { Card, CardContent, CardFooter } from "../ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Textarea } from "../ui/textarea";
import { Icon } from "../Icon";

export const Comment: React.FC<{
  forPost?: Post;
  forEdition?: boolean;
  onPostAdded?: (post: Post) => void;
}> = ({ forPost, forEdition, onPostAdded }) => {
  // DATA
  const formSchema = z.object({
    ...(typeof forPost?.id === "number"
      ? {}
      : { title: z.string().min(2).max(255) }),
    text: z.string().min(1).max(2000),
  });

  // METHODS
  const onSuccess = (res: Post) => {
    if (!res || !onPostAdded) return;
    onPostAdded(res);
    form.reset();
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!currentUser) return router.push("/sign-in");
    if (forEdition && forPost?.id) {
      editPost.mutate({
        ...values,
        title: typeof values.title === "string" ? values.title : null,
        id: forPost.id,
      });
      return;
    }
    createPost.mutate({
      ...values,
      title: typeof values.title === "string" ? values.title : null,
      postId: forPost?.id ?? null,
    });
  };

  const onClickForm = (e: React.MouseEvent<HTMLFormElement, MouseEvent>) => {
    e.stopPropagation();
  };

  // HOOKS
  const router = useRouter();
  const currentUser = useContext(UserContext);
  const createPost = api.post.create.useMutation({
    onSuccess,
  });
  const editPost = api.post.edit.useMutation({
    onSuccess,
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: typeof forPost?.id === "number" ? undefined : "",
      text: "",
    },
  });

  useEffect(() => {
    form.reset();

    if (forEdition && forPost) {
      if (forPost.title)
        form.setValue("title", forPost.title as unknown as never);
      if (forPost.text) form.setValue("text", forPost.text as unknown as never);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forEdition]);

  useEffect(() => {
    if (createPost.error) {
      throw new NextError({
        title: createPost.error.message ?? "Something went wrong!",
        statusCode: createPost.error.data?.httpStatus ?? 500,
      });
    }
  }, [createPost.error, createPost.error?.data]);

  useEffect(() => {
    if (editPost.error) {
      throw new NextError({
        title: editPost.error.message ?? "Something went wrong!",
        statusCode: editPost.error.data?.httpStatus ?? 500,
      });
    }
  }, [editPost.error, editPost.error?.data]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} onClick={onClickForm}>
        <Card className="p-4 shadow-lg">
          <CardContent className="mb-0 flex px-0 pb-3">
            <Avatar className="mr-2 mt-2">
              <AvatarImage
                src={currentUser?.imageUrl}
                alt={currentUser?.username ?? "Unknown"}
              />
              <AvatarFallback>
                {(currentUser?.username ?? "X")[0]}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-1 flex-col">
              {!forPost?.postId && (
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        {typeof field.value === "string" && (
                          <Input
                            placeholder="Title of your post"
                            className="text-base"
                            autoFocus
                            {...{
                              ...field,
                              value:
                                typeof field.value === "string"
                                  ? field.value
                                  : "",
                            }}
                          />
                        )}
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                  <FormItem className="border-b border-b-gray-200 dark:border-b-gray-700">
                    <FormControl>
                      <Textarea
                        onLoad={(e) => {
                          if (forPost?.postId) e.currentTarget.focus();
                        }}
                        placeholder={
                          forPost
                            ? "Comment your thoughts"
                            : "Share your thoughts with the world!"
                        }
                        className="h-12 resize-none text-base"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-end p-0">
            <Button
              type="submit"
              className="rounded-xl"
              disabled={createPost.isLoading}
            >
              {createPost.isLoading && (
                <Icon type="SPINNER" className="mr-1 h-4 w-4" />
              )}
              {forEdition ? "Update" : forPost ? "Comment" : "Post"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
};
