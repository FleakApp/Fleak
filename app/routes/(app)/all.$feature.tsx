import type { Prisma } from "@prisma/client";
import { useParams, useSearchParams } from "@remix-run/react";
import useSWRInfinite from "swr/infinite";

import Empty from "@/components/empty";
import { InfiniteScroll } from "@/components/InfiniteScroll";
import PostSkeleton from "@/components/post/skeleton";
import { PostItem } from "@/routes/(app)/__post";

const PAGE_SIZE = 10;

export default function App() {
  const params = useParams();
  const [searchParams, _] = useSearchParams();

  const swr = useSWRInfinite<{
    result: Prisma.PostGetPayload<{
      include: {
        category: true;
        visits: true;
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
            votes: true;
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
      `/api/fetch/feed?feature=${params.feature ?? "fresh"}&page=${index + 1}${searchParams.has("q") ? `&search=${searchParams.get("q")}` : ""}`,
    {
      fetcher: async (key: string) => fetch(key).then((res) => res.json()),
    },
  );

  const alerts = [
    ["hot", "Posty sortowane według ilości głosów oraz ilości wejść"],
    ["trending", "Posty sortowane według ilości komentarzy"],
    ["waiting", "Posty oczekujące na zatwierdzenie"],
  ];

  return (
    <div className="h-full flex-1 flex-col space-y-3">
      {alerts.some(([key]) => key === params.feature) && (
        <div className="mx-3 my-3 flex items-center gap-x-3 rounded-lg border-[3px] border-b-0 border-t-0 border-slate-900 bg-slate-300/30 p-4">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9.14939 7.8313C8.57654 5.92179 10.0064 4 12 4V4C13.9936 4 15.4235 5.92179 14.8506 7.8313L13.2873 13.0422C13.2171 13.2762 13.182 13.3932 13.128 13.4895C12.989 13.7371 12.7513 13.9139 12.4743 13.9759C12.3664 14 12.2443 14 12 14V14C11.7557 14 11.6336 14 11.5257 13.9759C11.2487 13.9139 11.011 13.7371 10.872 13.4895C10.818 13.3932 10.7829 13.2762 10.7127 13.0422L9.14939 7.8313Z"
              stroke="#33363F"
              strokeWidth="2"
            />
            <circle cx="12" cy="19" r="2" stroke="#33363F" strokeWidth="2" />
          </svg>

          {alerts.map(([key, value]) => (key === params.feature ? value : ""))}
        </div>
      )}

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
              {result?.map((post) => <PostItem key={post?.id} post={post} />)}
            </>
          )}
        </InfiniteScroll>
      </div>
    </div>
  );
}
