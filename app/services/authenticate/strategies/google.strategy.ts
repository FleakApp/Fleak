import { GoogleStrategy } from "@fleak-org/remix-auth";

import { accentsTidy } from "@/helpers/misc";
import { prisma as db, prisma } from "@/services/db.server";
import { sendVerifyEmail } from "@/services/email/email.server";

const clientID = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!clientID || !clientSecret) {
  throw new Error("Missing env GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET");
}

const strategy = new GoogleStrategy(
  {
    clientID,
    clientSecret,
    callbackURL: `${process.env.APP_URL}/oauth/google/callback`,
  },
  async ({ accessToken, extraParams, profile }) => {
    let user = await db.user.findUnique({
      where: {
        email: profile.emails[0].value,
      },
    });

    // if (!user) {
    // 	throw new AuthorizationError(
    // 		"No user found with this provider",
    // 	);
    // }

    if (!user) {
      user = await db.user.create({
        data: {
          email: profile.emails[0].value,
          first_name: profile.name?.givenName,
          last_name: profile.name?.familyName,
          password: "null",
          username: accentsTidy(profile.displayName),
          bio: "",
          image: profile._json.picture,
          // attach account
          account: {
            create: {
              type: "oauth:google",
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
