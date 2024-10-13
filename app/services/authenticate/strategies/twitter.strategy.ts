import { TwitterApi } from "twitter-api-v2";

import { Twitter2Strategy } from "@fleak-org/remix-auth";

import { accentsTidy } from "@/helpers/misc";
import { prisma as db, prisma } from "@/services/db.server";

const clientID = process.env.TWITTER_CLIENT_ID;
const clientSecret = process.env.TWITTER_CLIENT_SECRET;

if (!clientID || !clientSecret) {
  throw new Error("Missing env TWITTER_CLIENT_ID or TWITTER_CLIENT_SECRET");
}

const strategy = new Twitter2Strategy(
  {
    clientID,
    clientSecret,
    callbackURL: `${process.env.APP_URL}/oauth/twitter/callback`,
    scopes: ["users.read", "tweet.read", "tweet.write"],
  },
  async ({ accessToken }) => {
    const userClient = new TwitterApi(accessToken);

    const result = await userClient.v2.me({
      "user.fields": ["profile_image_url", "username", "description", "id"],
    });

    // should handle errors
    const { id, username, profile_image_url, description } = result.data;

    let user = await db.user.findUnique({
      where: {
        username: accentsTidy(username),
        account: {
          providerAccountId: id,
        },
      },
    });

    if (!user) {
      user = await db.user.create({
        data: {
          email: null,
          first_name: null,
          last_name: null,
          password: null,
          username: accentsTidy(username),
          bio: description,
          image: profile_image_url ?? null,
          // attach account
          account: {
            create: {
              type: "oauth:twitter",
              provider: "twitter",
              providerAccountId: `${id}`,
              access_token: accessToken,
            },
          },
          // attach role
          roles: { connect: [{ name: "user" }] },
        },
      });
    }

    // if (user && user.emailVerified === null) {
    //   await sendVerifyEmail(user, user.id);

    //   // throw new AuthorizationError(
    //   //   "Konto niezweryfikowane. Przeczytaj swoją skrzynkę e-mail.",
    //   // );
    // }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        loginAt: new Date(),
      },
    });

    return user.id;
  },
);

export { strategy };
