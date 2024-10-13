import type { Prisma } from "@prisma/client";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useParams, useSearchParams } from "@remix-run/react";
import useSWRInfinite from "swr/infinite";

import Empty from "@/components/empty";
import { InfiniteScroll } from "@/components/InfiniteScroll";
import PostSkeleton from "@/components/post/skeleton";
import { siteConfig } from "@/config/site";
import { PostItem } from "@/routes/(app)/__post";
import { prisma } from "@/services/db.server";

const PAGE_SIZE = 10;

export { ErrorBoundary } from "@/components/error-bound";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const category = await prisma.category.findFirst({
    where: {
      active: true,
      slug: params.slug,
    },
  });

  if (!category) {
    throw new Error("Nie znaleziono takiej kategorii");
  }
  return json({ category });
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: `${siteConfig.title} : ${data?.category ? data?.category.name : "404 Not found"}`,
    },
    {
      name: "description",
      content: data?.category
        ? data?.category.description
        : siteConfig.description,
    },

    {
      property: "og:title",
      content: data?.category ? data?.category.name : siteConfig.title,
    },
    {
      name: "og:description",
      content: data?.category
        ? data?.category.description
        : siteConfig.description,
    },
    {
      name: "og:url",
      content: `https://fleak.pl/category/${data?.category?.slug}`,
    },
  ];
};

export default function App() {
  const params = useParams();
  const [searchParams, _] = useSearchParams();

  const { category } = useLoaderData<typeof loader>();

  const swr = useSWRInfinite<{
    result: Prisma.PostGetPayload<{
      include: {
        category: true;
        user: {
          include: {
            followers: {
              include: {
                follower: true;
              };
            };
            _count: true;
          };
        };
        tags: true;
        likes: true;
        votes: true;

        comments: {
          include: {
            replies: true;
            likes: true;
            user: true;
          };
        };
        _count: true;
      };
    }>[];
  }>(
    (index) =>
      `/api/fetch/feed?page=${index + 1}&category=${params.slug}${searchParams.has("q") ? `&search=${searchParams.get("q")}` : ""}`,
    {
      fetcher: async (key: string) => fetch(key).then((res) => res.json()),
    },
  );

  return (
    <div className="h-full flex-1 flex-col divide-y dark:divide-gray-500">
      <div className="relative flex items-center gap-x-3 p-6 px-3">
        <div className="shrink-0">
          <img
            alt="Artbyck"
            src={String(category.image)}
            className="size-[64px] rounded-xl"
          />
        </div>
        <div>
          <h2 className="text-4xl font-extrabold">{category.name}</h2>
          <p className="text-sm font-medium">{category.description}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-0 divide-y dark:divide-gray-500">
        <InfiniteScroll
          swr={swr}
          loadingIndicator={<PostSkeleton />}
          endingIndicator={
            <div className="flex min-h-[70px] items-center justify-center">
              To już wszystko! 🎉
            </div>
          }
          isReachingEnd={(swr) =>
            // @ts-ignore
            swr.data?.[0]?.result?.length === 0 ||
            // @ts-ignore
            swr.data?.[swr.data?.length - 1]?.result?.length < PAGE_SIZE
          }
        >
          {({ result }) => (
            <>
              {!result && (
                <div className="flex h-[calc(100vh-70px)] items-center justify-center p-3 font-semibold">
                  <Empty
                    // icon={EmptyIcon}
                    title="😞 Ups! nic nie znaleziono "
                    withoutBorder
                    className="font-semibold"
                  />
                </div>
              )}
              {/* @ts-expect-error */}
              {result?.map((post) => <PostItem key={post.id} post={post} />)}
            </>
          )}
        </InfiniteScroll>
      </div>
    </div>
  );
}
