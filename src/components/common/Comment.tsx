"use client";

import React, { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUser } from "@clerk/nextjs";
import { type Post } from "@prisma/client";

// HELPERS
import { api } from "~/trpc/react";

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
import { useRouter } from "next/navigation";

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
    if (!isSignedIn) return router.push("/sign-in");
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

  // HOOKS
  const router = useRouter();
  const { user, isSignedIn } = useUser();
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mb-10">
        <Card className="p-4 shadow-lg">
          <CardContent className="mb-0 flex px-0 pb-3">
            <Avatar className="mr-2 mt-2">
              <AvatarImage
                src={user?.imageUrl}
                alt={user?.username ?? "Unknown"}
              />

              <AvatarFallback>{(user?.username ?? "X")[0]}</AvatarFallback>
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
                  <FormItem className="border-b border-b-gray-200 ">
                    <FormControl>
                      <Textarea
                        onLoad={(e) => {
                          console.log("=======>", forPost?.postId);
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
