import { init } from "i18next";
import { z } from "zod";

import { zodI18nMap } from "@/services/zod/zodI18nMap";
import translation from "./zod.json";

// lng and resources key depend on your locale.
void init({
  lng: "pl",
  resources: {
    pl: { zod: translation },
  },
});

z.setErrorMap(zodI18nMap);

// export configured zod instance
export { z };
