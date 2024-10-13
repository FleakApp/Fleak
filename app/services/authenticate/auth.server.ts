import { Authenticator } from "@fleak-org/remix-auth";

import { storage } from "./session.server";
import { strategy as facebookStrategy } from "./strategies/facebook.strategy";
import { strategy as formStrategy } from "./strategies/form.strategy";
import { strategy as googleStrategy } from "./strategies/google.strategy";
import { strategy as twitterStrategy } from "./strategies/twitter.strategy";

export const auth = new Authenticator<UserCookieType>(storage, {
  sessionErrorKey: "__error",
  successMessage: "You have successfully logged in to the app!",
});

auth.use(formStrategy, "form");
auth.use(googleStrategy, "google");
auth.use(facebookStrategy, "facebook");
auth.use(twitterStrategy, "twitter");
