export const themeConfig = {
  dark: true,
  body: {
    background: "bg-neutral-50 dark:bg-background",
  },

  tobbar: {
    container: true,
  },
  main: {
    container: true,
  },
  footer: {
    container: false,
    pinned: false,
  },

  layout: {
    left_sidebar: true,
    right_sidebar: true,
  },
};

export type ThemeConfig = typeof themeConfig;
