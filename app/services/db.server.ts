import type { Prisma } from "@prisma/client";
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["info", "error", "warn"]
      : ["info", "error"],
  omit: {
    user: {
      // make sure that password are never queried.
      password: true,
    },
  },
})
  //post ordering
  .$extends({
    model: {
      post: {
        orderByHot: () => [{ upVotes: "desc" }, { views: "desc" }],
        orderByNewest: () => [
          {
            createdAt: "desc",
          },
        ],
        orderByTrending: () => [
          {
            comments: {
              _count: "desc",
            },
          },
        ],
      } satisfies Record<
        string,
        (...args: never) => Prisma.PostFindManyArgs["orderBy"]
      >,
    },
  })
  // post filters
  .$extends({
    model: {
      post: {
        titleContains: (search: string | null) =>
          search
            ? {
                title: { search: search.replace("@", "") },
              }
            : {},
        published: () => ({
          active: true,
          category: {
            active: true,
          },
        }),
        unpublished: () => ({ active: false }),

        byCategory: (category: string | null) =>
          category
            ? {
                category: {
                  slug: category,
                },
              }
            : {},
        byTag: (tag: string | null) =>
          tag
            ? {
                tags: {
                  some: {
                    content: tag,
                  },
                },
              }
            : {},
        byAuthor: (search: string | null) =>
          search
            ? {
                user: {
                  OR: [
                    {
                      username: {
                        search: search.startsWith("@")
                          ? search.replace("@", "")
                          : search,
                      },
                    },
                    {
                      first_name: {
                        search: search.startsWith("@")
                          ? search.replace("@", "")
                          : search,
                      },
                      last_name: {
                        search: search.startsWith("@")
                          ? search.replace("@", "")
                          : search,
                      },
                      email: {
                        search: search.startsWith("@")
                          ? search.replace("@", "")
                          : search,
                      },
                    },
                  ],
                },
              }
            : {},

        // hasComments: () => ({ comments: { some: {} } }),
        // hasRecentComments: (date: Date) => ({
        //   comments: { some: { createdAt: { gte: date } } },
        // }),
        // ordering
      } satisfies Record<string, (...args: never) => Prisma.PostWhereInput>,
    },
  })
  .$extends({
    // @example
    // const user = await prisma.user.findUniqueOrThrow({ where: { id: someId } })
    // user.email = 'new-mail@email-service.com'
    // await user.save()
    result: {
      user: {
        save: {
          needs: { id: true },
          compute(user) {
            return () =>
              prisma.user.update({ where: { id: user.id }, data: user });
          },
        },
      },

      notification: {
        //
        // const notification = await prisma.notification.findUniqueOrThrow({
        //   where: { id: params.id },
        // });
        // await notification.makeReadAt();
        makeReadAt: {
          needs: { id: true },
          compute(notification) {
            return () =>
              prisma.notification.update({
                where: notification,
                data: { ...notification, readAt: new Date() },
              });
          },
        },
      },
    },
  })
  .$extends({
    result: {
      user: {
        username: {
          needs: { username: true },
          compute(user) {
            return `@${user.username}`;
          },
        },
        fullName: {
          needs: { first_name: true, last_name: true },
          compute(user) {
            return `${user.first_name} ${user.last_name}`;
          },
        },
      },
    },
  });

export * from "@prisma/client";
