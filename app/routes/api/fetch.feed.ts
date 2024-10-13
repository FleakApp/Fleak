import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

import type { Prisma } from "@/services/db.server";
import { prisma } from "@/services/db.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const p = url.searchParams.get("page") ?? 1;
  const perPage = url.searchParams.get("per_page") ?? 10;

  const category = url.searchParams.get("category") ?? null;

  const feature = url.searchParams.get("feature") ?? "fresh";

  const search = url.searchParams.get("search");
  const tag = url.searchParams.get("tag");

  const take = Number(perPage);
  const skip = ((p as number) - 1) * take;

  let where: Prisma.PostWhereInput = {
    // ...prisma.post.published(),
    ...prisma.post.byTag(tag),
    ...prisma.post.byCategory(category),

    ...prisma.post.unpublished(),
    ...(search
      ? {
          OR: [prisma.post.titleContains(search), prisma.post.byAuthor(search)],
        }
      : {}),
  };

  let orderBy = {};

  if (feature === "waiting") {
    // według daty utworzenia
    where = {
      ...where,
      ...prisma.post.unpublished(),
    };
    // według daty utworzenia
    orderBy = [...prisma.post.orderByNewest()];
  } else if (feature === "fresh") {
    // Pokazuj tylko zweryfikowane
    where = {
      ...where,
      ...prisma.post.published(),
    };
    // według daty utworzenia
    orderBy = [...prisma.post.orderByNewest()];
  } else if (feature === "hot") {
    // według ilości ocen
    orderBy = [...prisma.post.orderByHot()];
  } else if (feature === "trending") {
    // według ilości komentarzy
    orderBy = [...prisma.post.orderByTrending()];
  }

  // pokaż oczekujące posty w kategoriach i tagach
  if (category ?? tag) {
    where = {
      ...where,
      ...prisma.post.byTag(tag),
      ...prisma.post.byCategory(category),
      ...prisma.post.unpublished(),
    };
  }

  const result = await prisma.post.findMany({
    where,
    include: {
      tags: true,
      category: true,
      likes: {
        include: {
          user: true,
        },
      },
      votes: {
        include: {
          post: true,
          user: true,
        },
      },
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
      comments: {
        where: {
          active: true,
        },
      },
      _count: {
        select: {
          tags: true,
          visits: true,
          comments: true,
          votes: true,
        },
      },
    },

    orderBy,

    skip,
    take,
  });

  const total = await prisma.post.count({
    where,
  });

  if (result.length === 0) {
    return json(
      {
        result,
      },
      { status: 200 },
    );
  }

  return json(
    {
      result,
      count: total,
    },
    { status: 200 },
  );
}
