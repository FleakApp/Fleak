export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  url:
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://fleak.pl",
  title: "Fleak",
  keywords:
    "fleak, memy, humor, memes, czarny humor, najlepsze memy, ciekawostki, fakty, informacje, zryte memy, kryptowaluty, technologia, portal fleak, zdjęcia, gif-y, filmy video, posty, żarty, shitposting, kreatywne treści, zabawa i wiedza",
  description:
    "Codzienna dawka memów, GIF-ów, zabawnych filmów i interesujących ciekawostek. Fleak humor który nie bierze jeńców!",

  // socials
  messenger: {
    appId: "",
  },
};
