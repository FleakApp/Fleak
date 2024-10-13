import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { z } from "zod";

import { validateFormData } from "@fleak-org/remix-utils";

import { requireUserWithRole } from "@/helpers/auth";
import { auth } from "@/services/authenticate/auth.server";
import { prisma } from "@/services/db.server";

export const schema = z.object({
  items: z.string(),
});

export async function action({ request }: ActionFunctionArgs) {
  await auth.isAuthenticated(request, {
    failureRedirect: "/signin?ref=" + request.headers.get("referer"),
  });

  await requireUserWithRole(request, "admin");

  const formData = await request.formData();

  console.log(formData);
  const result = await validateFormData(schema, formData);

  if (!result.success) {
    return json(
      {
        message: JSON.stringify(result),
        status: "success",
      },
      { status: 300 },
    );
  }

  const items = String(result.data.items)?.split(",") ?? [];

  const deleteCat = async (id: string) => {
    const exists = await prisma.category.findFirst({
      where: {
        id,
      },
    });

    if (!exists) {
      return json(
        {
          message: `Taka Kategoria nie została znaleziona!`,
          status: "success",
        },
        { status: 300 },
      );
    }

    await prisma.post.deleteMany({
      where: {
        category: {
          id,
        },
      },
    });

    await prisma.category.delete({
      where: {
        id,
      },
    });
  };

  items.map((item) => {
    void deleteCat(item);
  });

  //   const exists = await prisma.category.findFirst({
  //     where: {
  //       id: result.data.category,
  //     },
  //   });

  //   if (!exists) {
  //     return json(
  //       {
  //         message: `Taka Kategoria nie została znaleziona!`,
  //         status: "success",
  //       },
  //       { status: 300 },
  //     );
  //   }

  // await prisma.post.deleteMany({
  //   where: {
  //     category: {
  //       id: items,
  //     },
  //     //   id: exists.id,
  //   },
  // });
  // await prisma.category.delete({
  //   where: {
  //     id: exists.id,
  //   },
  // });

  return json(
    {
      message: `Kategorie zostały pomyślnie usunięte!`,
      status: "success",
    },
    { status: 300 },
  );
}
