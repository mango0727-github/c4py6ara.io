import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    url: "https://mango0727-github.github.io/c4py6ara.io",
    title: "Joon InfoSec Playground",
    description:
      "Welcome to my personal space, where I put random things that fascinate me. They are mainly about information security, wireless tech, and horse riding. Also, I am so excited to see what topics will capture my interest along the way!",
    author: "Joonyoung Jeong",
    profile: "https://github.com/mango0727-github",
    ogImage: "default-og.jpg",
    lang: "en",
    timezone: "Asia/Seoul",
    dir: "ltr",
  },
  posts: {
    perPage: 8,
    perIndex: 5,
    scheduledPostMargin: 15 * 60 * 1000,
  },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: true,
    showArchives: true,
    showBackButton: true,
    editPost: {
      enabled: false,
    },
    search: "pagefind",
  },
  socials: [
    { name: "github", url: "https://github.com/mango0727-github" },
    { name: "mail", url: "mailto:josephjy.jeong@gmail.com" },
  ],
  shareLinks: [
    { name: "x", url: "https://x.com/intent/post?url=" },
    { name: "telegram", url: "https://t.me/share/url?url=" },
    { name: "mail", url: "mailto:?subject=See%20this%20post&body=" },
  ],
});
