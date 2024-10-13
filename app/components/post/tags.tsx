import type { Tag } from "@prisma/client";
import { Link } from "@remix-run/react";

import {
  Badge,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@fleak-org/ui";

export default function PostTags({ tags }: { tags?: Tag[] | [] }) {
  const _count = tags?.length;

  return (
    <>
      {tags && Number(tags?.length) > 0 && (
        <div className="flex items-center pb-3 text-sm">
          {/* tagi: */}
          <ul className="space-x-1.5">
            {tags?.map(
              (t, i) =>
                i < 3 && (
                  <Link to={`/tag/${t.content}`} key={t.id}>
                    <Badge
                      key={t.id}
                      variant="outline"
                      className="cursor-pointer rounded border-dashed hover:bg-accent"
                    >
                      #{t.content}
                    </Badge>
                  </Link>
                ),
            )}
            {Number(_count) > 3 && (
              <Collapsible className="inline-flex">
                <CollapsibleContent>
                  {tags?.map(
                    (t, i) =>
                      i > 2 && (
                        <Link to={`/tag/${t.content}`} key={t.id}>
                          <Badge
                            variant="outline"
                            className="block cursor-pointer truncate rounded border-dashed hover:bg-accent"
                          >
                            #{t.content}
                          </Badge>
                        </Link>
                      ),
                  )}
                </CollapsibleContent>
                <CollapsibleTrigger className="data-[state=open]:hidden">
                  <Badge
                    variant="outline"
                    className="cursor-pointer rounded border-dashed hover:bg-accent"
                  >
                    +{" "}
                    {Number(_count) <= 3 ? Number(_count) : Number(_count) - 3}
                  </Badge>
                </CollapsibleTrigger>
              </Collapsible>
            )}
          </ul>
        </div>
      )}
    </>
  );
}
