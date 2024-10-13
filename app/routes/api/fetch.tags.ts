import { json } from "@remix-run/node";

import { prisma } from "@/services/db.server";

export async function loader() {
  const result = await prisma.tag.findMany({
    orderBy: {
      content: "asc",
    },
  });

  return json({
    result,
  });
}
