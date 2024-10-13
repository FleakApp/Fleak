import { json } from "@remix-run/node";

import { prisma } from "@/services/db.server";

export async function loader() {
  const result = await prisma.category.findMany({
    where: {
      active: true,
    },
    orderBy: {
      name: "asc",
    },
    include: {
      post: {
        select: {
          id: true,
        },
      },
    },
  });

  return json({
    result,
  });
}
