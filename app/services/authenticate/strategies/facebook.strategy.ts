import { FacebookStrategy } from "@fleak-org/remix-auth";

import { accentsTidy } from "@/helpers/misc";
import { prisma as db, prisma } from "@/services/db.server";
import { sendVerifyEmail } from "@/services/email/email.server";

// const clientID = process.env.FACEBOOK_CLIENT_ID;
// const clientSecret = process.env.FACEBOOK_CLIENT_SECRET;

// if (!clientID || !clientSecret) {
//   throw new Error("Missing env FACEBOOK_CLIENT_ID or FACEBOOK_CLIENT_SECRET");
// }

const strategy = new FacebookStrategy(
  {
    clientID: " ",
    clientSecret: " ",
    callbackURL: `https://fleak.pl/oauth/facebook/callback`,
  },
  async ({ accessToken, extraParams, profile }) => {
    let user = await db.user.findUnique({
      where: {
        email: String(profile._json.email),
      },
    });

    if (!user) {
      user = await db.user.create({
        data: {
          email: String(profile._json.email),
          first_name: String(profile.name?.givenName),
          last_name: String(profile.name?.familyName),
          password: "null",
          username: accentsTidy(profile.displayName),
          bio: "",
          image: String(profile._json.profile_pic) ?? null,
          // attach account
          account: {
            create: {
              type: "oauth:facebook",
              provider: profile.provider,
              providerAccountId: `${profile.id}`,
              access_token: accessToken,
              token_type: String(extraParams.tokenType),
              expires_at: Number(extraParams.accessTokenExpiresIn),
            },
          },
          // attach role
          roles: { connect: [{ name: "user" }] },
        },
      });
    }

    if (user && user.emailVerified === null) {
      await sendVerifyEmail(user, user.id);

      // throw new AuthorizationError(
      //   "Konto niezweryfikowane. Przeczytaj swoją skrzynkę e-mail.",
      // );
    }

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
