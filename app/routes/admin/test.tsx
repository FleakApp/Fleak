/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

import { Loader } from "@fleak-org/ui";

import type { Prisma } from "@/services/db.server";
import { PostItem } from "../(app)/__post";

interface ItemsResponse {
  result: Prisma.PostGetPayload<{
    include: {
      tags: true;
      category: true;
      likes: {
        include: {
          user: true;
        };
      };
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
      comments: true;
      _count: true;
    };
  }>[];
  count: number;
}

export function Test() {
  const [items, setItems] = useState<ItemsResponse["result"]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const { ref, inView } = useInView({
    threshold: 0,
    delay: 500,
  });

  const fetchInvoices = useCallback(async () => {
    try {
      const res = await fetch(`/api/feed?per_page=24&page=${page}`);
      const data = (await res.json()) as ItemsResponse;
      setItems((prev) => [...prev, ...data.result]);

      setHasMore(data.count > items.length);
    } catch (err) {
      console.error(err);
    }
  }, [items.length, page]);

  useEffect(() => {
    if (inView && hasMore) {
      setPage((prev) => ++prev);

      void fetchInvoices();
    }
  }, [inView]);

  return (
    <>
      <div className="">
        <div className="grid grid-cols-1 gap-0 divide-y dark:divide-primary">
          {items.map((post, _) => (
            <>
              <PostItem
                key={post.id}
                // @ts-ignore, @ts-expect-check: post invalid type
                post={post}
                tags={false}
                comments={false}
                followers={false}
              />
            </>
          ))}
        </div>

        {hasMore ? (
          <div ref={ref} className="mt-8 flex justify-center">
            <Loader variant="dark" elipsis />
          </div>
        ) : (
          <div className="absolute bottom-0 mt-8 flex justify-center">
            To już wszystko! 🎉
          </div>
        )}
      </div>
    </>
  );
}

export default Test;
