"use client";

import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// HELPERS
import { api } from "~/trpc/react";
import { type api as apiServer } from "~/trpc/server";

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
import { useUser } from "@clerk/nextjs";
import { Textarea } from "../ui/textarea";
import { Icon } from "../Icon";

// DATA
const formSchema = z.object({
  title: z.string().min(2).max(255),
  text: z.string().min(1).max(2000),
});

export const Comment: React.FC<{
  onPostAdded?: (
    post: Exclude<
      Awaited<ReturnType<typeof apiServer.post.create.mutate>>,
      undefined
    >,
  ) => void;
}> = ({ onPostAdded }) => {
  // HOOKS
  const { user } = useUser();
  const createPost = api.post.create.useMutation({
    onSuccess: (res) => {
      if (!res || !onPostAdded) return;
      onPostAdded(res);
      form.reset();
    },
  });

  // METHODS
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      text: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) =>
    createPost.mutate(values);

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
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Title of your post"
                        className="text-base"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                  <FormItem className="border-b border-b-gray-200 ">
                    <FormControl>
                      <Textarea
                        placeholder="Share your thoughts with the world!"
                        className="h-12 resize-none text-base"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
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
              Post
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
};
