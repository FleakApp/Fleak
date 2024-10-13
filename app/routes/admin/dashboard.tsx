import { Suspense } from "react";
import { defer } from "@remix-run/node";
import { Await, Link, useLoaderData } from "@remix-run/react";

import { fakePromise } from "@fleak-org/remix-utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Loader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@fleak-org/ui";

import { ErrorBoundary } from "@/root";
import { prisma } from "@/services/db.server";
import { $path } from "remix-routes";

export const loader = async () => {
  const countPosts = await prisma.post.count();
  const countUsers = await prisma.user.count();

  const countUniqueComments = await prisma.comment.groupBy({
    by: "postId",
    where: {
      active: true,
      post: {
        active: true,
      },
    },
  });

  const countUniqueVisits = await prisma.visit.groupBy({
    by: "ip",
  });

  const loadLatestPosts = async () => {
    await fakePromise(3000);

    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      include: {
        user: true,
      },
    });

    return posts;
  };

  const loadLatestVotes = async () => {
    await fakePromise(3000);

    const posts = await prisma.vote.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      include: {
        user: true,
        post: true,
      },
    });

    return posts;
  };

  return defer({
    countPosts,
    countUsers,
    countUniqueComments,
    countUniqueVisits,
    posts: loadLatestPosts(),
    votes: loadLatestVotes(),
  });
};

export default function Index() {
  const {
    countPosts,
    countUsers,
    countUniqueComments,
    countUniqueVisits,
    posts,
    votes,
  } = useLoaderData<typeof loader>();

  return (
    <div className="h-full flex-1 flex-col divide-y">
      <div className="grid grid-cols-1 gap-0 space-y-3 p-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col rounded-lg border bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
            <div className="p-4 md:p-5">
              <div className="flex items-center gap-x-2">
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-neutral-500">
                  Łącznie Użytkowników
                </p>
              </div>

              <div className="mt-1 flex items-center gap-x-2">
                <h3 className="text-xl font-medium text-gray-800 dark:text-neutral-200 sm:text-2xl">
                  {countUsers}
                </h3>
              </div>
            </div>
          </div>

          <div className="flex flex-col rounded-lg border bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
            <div className="p-4 md:p-5">
              <div className="flex items-center gap-x-2">
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-neutral-500">
                  Łącznie postów
                </p>
              </div>

              <div className="mt-1 flex items-center gap-x-2">
                <h3 className="text-xl font-medium text-gray-800 dark:text-neutral-200 sm:text-2xl">
                  {countPosts}
                </h3>
              </div>
            </div>
          </div>

          <div className="flex flex-col rounded-lg border bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
            <div className="p-4 md:p-5">
              <div className="flex items-center gap-x-2">
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-neutral-500">
                  Unikalne Komentarze
                </p>
              </div>

              <div className="mt-1 flex items-center gap-x-2">
                <h3 className="text-xl font-medium text-gray-800 dark:text-neutral-200 sm:text-2xl">
                  {countUniqueComments.length}
                </h3>
              </div>
            </div>
          </div>

          <div className="flex flex-col rounded-lg border bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
            <div className="p-4 md:p-5">
              <div className="flex items-center gap-x-2">
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-neutral-500">
                  Unikalne wizyty
                </p>
              </div>

              <div className="mt-1 flex items-center gap-x-2">
                <h3 className="text-xl font-medium text-gray-800 dark:text-neutral-200 sm:text-2xl">
                  {countUniqueVisits.length}
                </h3>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Card>
            <CardHeader className="p-3">
              <CardTitle className="text-base">Najnowsze posty</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table className="custom-scroll overflow-auto">
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Post</TableHead>
                    <TableHead>Typ </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <Suspense
                    fallback={
                      <TableRow>
                        <TableCell colSpan={3}>
                          <div className="flex h-[40px] w-full items-center justify-center">
                            <Loader variant="dark" elipsis />
                          </div>
                        </TableCell>
                      </TableRow>
                    }
                  >
                    <Await resolve={posts} errorElement={<ErrorBoundary />}>
                      {(resolvedValue) =>
                        resolvedValue?.map((post) => (
                          <TableRow key={post.id}>
                            <TableCell>
                              <Link
                                to={$path("/user/:username", {
                                  username: post.user.username,
                                })}
                                className="capitalize"
                              >
                                {post.user.username}
                              </Link>
                            </TableCell>
                            <TableCell>
                              <Link
                                to={$path("/feed/:slug", { slug: post.slug })}
                                className="capitalize"
                              >
                                {post.title}
                              </Link>
                            </TableCell>
                            <TableCell>{post.type}</TableCell>
                          </TableRow>
                        ))
                      }
                    </Await>
                  </Suspense>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-3">
              <CardTitle className="text-base">Najnowsze oceny</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table className="custom-scroll overflow-auto">
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Post</TableHead>
                    <TableHead>Typ </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <Suspense
                    fallback={
                      <TableRow>
                        <TableCell colSpan={3}>
                          <div className="flex h-[40px] w-full items-center justify-center">
                            <Loader variant="dark" elipsis />
                          </div>
                        </TableCell>
                      </TableRow>
                    }
                  >
                    <Await resolve={votes} errorElement={<ErrorBoundary />}>
                      {(resolvedValue) =>
                        resolvedValue?.map((vote) => (
                          <TableRow key={vote.id}>
                            <TableCell>
                              <Link
                                to={$path("/user/:username", {
                                  username: vote.user.username,
                                })}
                                className="capitalize"
                              >
                                {vote.user.username}
                              </Link>
                            </TableCell>
                            <TableCell>
                              <Link
                                to={$path("/feed/:slug", {
                                  slug: String(vote.post?.slug),
                                })}
                                className="capitalize"
                              >
                                {vote.post?.title}
                              </Link>
                            </TableCell>
                            <TableCell>{vote.type}</TableCell>
                          </TableRow>
                        ))
                      }
                    </Await>
                  </Suspense>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
