import { json } from "@remix-run/node";

export const loader = () => {
  return json(
    {
      short_name: "fleak",
      name: "Fleak",
      start_url: "/",
      display: "standalone",
      background_color: "#ffffff",
      theme_color: "#ffffff",
      icons: [
        {
          src: "/icon.png",
          sizes: "any",
          type: "image/png",
        },
      ],
    },
    {
      headers: {
        "Cache-Control": "public, max-age=600",
        "Content-Type": "application/manifest+json",
      },
    },
  );
};
