// -------------------------------------------------------------
// Generated using https://remixfast.com/
// Docs: https://remixfast.com/docs/models
// App: Infinite Scroll
// -------------------------------------------------------------
import type { Post, Prisma } from "@prisma/client";

import { prisma } from "@/services/db.server";

// offset based
export async function getWidgetList(skip = 0, take = 20): Promise<Post[] | []> {
  // query
  const data = await prisma.post.findMany({
    skip,
    take,
  });
  return data;
}

// get details by Id
export async function getWidgetById(widgetId: string): Promise<Post | null> {
  //
  return prisma.post.findUnique({
    where: {
      id: widgetId,
    },
  });
}
// create widget
export async function createWidget(widget: Partial<Post>): Promise<Post> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, ...widgetToAdd } = widget;
  //
  const data: Prisma.PostCreateInput = widgetToAdd as Prisma.PostCreateInput;
  //
  return prisma.post.create({
    data,
  });
}

// update widget
export async function updateWidget(widget: Partial<Post>): Promise<Post> {
  const { id, ...widgetToUpdate } = widget;
  //
  const data: Prisma.PostUpdateInput = widgetToUpdate;
  //
  return prisma.post.update({
    where: {
      id,
    },
    data,
  });
}

// delete widget
export async function deleteWidget(widgetId: string): Promise<Post> {
  return prisma.post.delete({
    where: {
      id: widgetId,
    },
  });
}
