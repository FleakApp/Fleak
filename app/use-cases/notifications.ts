import { prisma } from "@/services/db.server";

export const savefollowerNotification = async (
  id: UserCookieType,
  data: string,
  url?: string,
) => {
  await prisma.notification.create({
    data: {
      data,
      url,

      user: {
        connect: {
          id,
        },
      },
    },
  });
};

export const saveUserNotification = async (
  id: UserCookieType,
  data: string,
  url?: string,
) => {
  await prisma.notification.create({
    data: {
      data,
      url,
      user: {
        connect: {
          id,
        },
      },
    },
  });
};
