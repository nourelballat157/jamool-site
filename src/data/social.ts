/**
 * The social accounts shown in the footer. Each `href` is where the icon goes: for now every icon opens the
 * contact page, because the official account addresses are not in the project yet. To switch an icon over, put
 * the real address in `href` (for example "https://www.instagram.com/<account>"): addresses that start with
 * "http" open in a new tab.
 */
export type Social = {
  id: string;
  label: string;
  href: string;
  /** an inline 24px glyph: `d` paths filled with currentColor, plus optional stroked shapes */
  paths: string[];
  stroke?: boolean;
  /** the brand colour the icon takes on hover */
  tone: string;
};

export const socials: Social[] = [
  {
    id: "instagram",
    label: "إنستغرام",
    href: "/contact",
    stroke: true,
    paths: ["M7.5 3.5h9a4 4 0 0 1 4 4v9a4 4 0 0 1-4 4h-9a4 4 0 0 1-4-4v-9a4 4 0 0 1 4-4z", "M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6z", "M17.1 6.9h.01"],
    tone: "#E1306C",
  },
  {
    id: "x",
    label: "إكس",
    href: "/contact",
    paths: ["M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"],
    tone: "#FFFFFF",
  },
  {
    id: "facebook",
    label: "فيسبوك",
    href: "/contact",
    paths: ["M13.6 21.5v-8h2.7l.5-3.4h-3.2V8c0-1 .4-1.7 1.8-1.7h1.6V3.4c-.3 0-1.3-.2-2.4-.2-2.5 0-4.2 1.5-4.2 4.3v2.6H7.5v3.4h2.9v8h3.2z"],
    tone: "#1877F2",
  },
  {
    id: "youtube",
    label: "يوتيوب",
    href: "/contact",
    paths: ["M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15.2V8.8l5.3 3.2z"],
    tone: "#FF0033",
  },
  {
    id: "tiktok",
    label: "تيك توك",
    href: "/contact",
    paths: ["M16.6 3h-3.3v12.2a2.7 2.7 0 1 1-2.7-2.7c.3 0 .6 0 .8.1V9.2a6 6 0 1 0 5.2 5.9V8.6a7.4 7.4 0 0 0 4.3 1.4V6.7a4.3 4.3 0 0 1-4.3-3.7z"],
    tone: "#25F4EE",
  },
  {
    id: "whatsapp",
    label: "واتساب",
    href: "/contact",
    paths: [
      "M12 2.8a9.2 9.2 0 0 0-7.9 13.9L2.8 21.2l4.6-1.2A9.2 9.2 0 1 0 12 2.8zm0 1.9a7.3 7.3 0 1 1-3.7 13.6l-.3-.2-2.4.6.7-2.3-.2-.3A7.3 7.3 0 0 1 12 4.7zM9 7.9c-.2 0-.5.1-.7.4-.3.4-.9 1-.9 2.2s.9 2.4 1 2.6c.1.2 1.8 2.8 4.4 3.8 2.2.8 2.6.6 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.5-.3-1.7-.8c-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1-1.4-.7-2.4-1.4-3.2-3-.1-.2 0-.4.1-.5l.5-.6.2-.4v-.4l-.8-1.9c-.2-.5-.4-.5-.6-.5H9z",
    ],
    tone: "#25D366",
  },
];
