import type { Prisma } from "@prisma/client";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useParams, useSearchParams } from "@remix-run/react";
import useSWRInfinite from "swr/infinite";

import { Loader } from "@fleak-org/ui";

import Empty from "@/components/empty";
import { InfiniteScroll } from "@/components/InfiniteScroll";
import PostSkeleton from "@/components/post/skeleton";
import { siteConfig } from "@/config/site";
import { PostItem } from "@/routes/(app)/__post";
import { prisma } from "@/services/db.server";

const PAGE_SIZE = 10;

export { ErrorBoundary } from "@/components/error-bound";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const tag = await prisma.tag.findFirst({
    where: {
      content: params.tagId,
    },
  });

  if (!tag) {
    throw new Error("Nie znaleziono takiego tagu");
  }
  return json({ tag });
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: `${siteConfig.title} : ${data?.tag ? data?.tag.content : "404 Not found"}`,
    },
    { name: "description", content: siteConfig.description },
  ];
};

export default function App() {
  const params = useParams();
  const [searchParams, _] = useSearchParams();

  const { tag } = useLoaderData<typeof loader>();

  const swr = useSWRInfinite<{
    result: Prisma.PostGetPayload<{
      include: {
        user: true;
        category: true;
        tags: true;
      };
    }>[];
  }>(
    (index) =>
      `/api/fetch/feed?page=${index + 1}&tag=${params.tagId}${searchParams.has("q") ? `&search=${searchParams.get("q")}` : ""}`,
    {
      fetcher: async (key: string) => fetch(key).then((res) => res.json()),
    },
  );

  return (
    <div className="h-full flex-1 flex-col divide-y dark:divide-gray-500">
      <div className="relative flex items-center gap-x-3 p-6 px-3">
        <div>
          <h2 className="text-4xl font-extrabold">#{tag.content}</h2>
          {/* <p className="text-sm font-medium">{category.description}</p> */}
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
              {result?.map((post) => (
                // @ts-ignore
                <PostItem key={post.id} post={post} tags />
              ))}
            </>
          )}
        </InfiniteScroll>
      </div>
    </div>
  );
}
