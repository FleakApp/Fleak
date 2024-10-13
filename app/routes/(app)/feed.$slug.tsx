import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { getClientIPAddress } from "@fleak-org/remix-utils";

import { siteConfig } from "@/config/site";
import { PostItem } from "@/routes/(app)/__post";
import { prisma } from "@/services/db.server";

export { ErrorBoundary } from "@/components/error-bound";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: `${siteConfig.title} : ${data?.post ? data?.post.title : "404 Not found"}`,
    },
    {
      name: "description",
      content: data?.post ? data?.post.content : siteConfig.description,
    },

    {
      property: "og:title",
      content: data?.post ? data?.post.title : siteConfig.title,
    },
    {
      name: "og:description",
      content: data?.post ? data?.post.content : siteConfig.description,
    },
    {
      name: "og:url",
      content: `https://fleak.pl/feed/${data?.post?.slug}`,
    },
  ];
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const ipAddress = getClientIPAddress(request) ?? "localhost";

  const post = await prisma.post.findFirst({
    where: {
      slug: String(params.slug),
      // active: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      tags: true,
      category: true,
      visits: true,
      user: {
        include: {
          followers: {
            include: {
              follower: true,
            },
          },
          _count: true,
        },
      },
      votes: {
        include: {
          post: true,
          user: true,
        },
      },
      likes: true,
      comments: {
        where: {
          replyId: null,
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: true,
          votes: true,
          likes: true,
          replies: {
            orderBy: {
              createdAt: "desc",
            },
            include: {
              votes: true,
              user: true,
              likes: true,
              reply: {
                include: {
                  votes: true,
                  user: true,
                  likes: true,
                },
              },
              replies: {
                orderBy: {
                  createdAt: "desc",
                },
                include: {
                  votes: true,
                  user: true,
                  likes: true,
                  reply: {
                    include: {
                      votes: true,
                      user: true,
                      likes: true,
                    },
                  },
                  replies: {
                    orderBy: {
                      createdAt: "desc",
                    },
                    include: {
                      votes: true,
                      user: true,
                      likes: true,
                      reply: {
                        include: {
                          votes: true,
                          user: true,
                          likes: true,
                        },
                      },
                      replies: {
                        orderBy: {
                          createdAt: "desc",
                        },
                        include: {
                          reply: {
                            include: {
                              votes: true,
                              user: true,
                              likes: true,
                            },
                          },
                          votes: true,
                          user: true,
                          likes: true,
                          replies: {
                            orderBy: {
                              createdAt: "desc",
                            },
                            include: {
                              reply: {
                                include: {
                                  votes: true,
                                  user: true,
                                  likes: true,
                                },
                              },
                              votes: true,
                              user: true,
                              likes: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      _count: {
        select: {
          tags: true,
          visits: true,
          comments: {
            where: {
              active: true,
            },
          },
          votes: true,
        },
      },
    },
  });

  if (params.slug) {
    try {
      const exists = await prisma.visit.findFirst({
        where: {
          ip: ipAddress,
          post: {
            slug: String(params.slug),
          },
        },
      });

      if (!exists) {
        await prisma.post.update({
          where: {
            slug: String(params.slug),
          },
          data: {
            views: { increment: 1 },
            visits: {
              create: {
                ip: ipAddress,
              },
            },
          },
        });
      }
    } catch (e) {
      throw new Error("Nie znaleziono takiego postu");
    }
  }

  return {
    post,
  };
};

export default function Component() {
  const { post } = useLoaderData<typeof loader>();

  return (
    <div className="h-full flex-1 flex-col space-y-3">
      <PostItem
        comments={true}
        controls={true}
        // @ts-ignore
        post={post}
        tags
        collapsed={true}
      />
    </div>
  );
}
