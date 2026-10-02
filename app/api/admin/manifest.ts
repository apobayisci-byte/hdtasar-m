import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HD Tasarım Atölyesi",
    short_name: "HD Tasarım",
    description:
      "İşletmelere ve kişiye özel neon tabela, logo ve dekoratif tasarım çözümleri.",
    start_url: "/",
    display: "standalone",
    background_color: "#070a0f",
    theme_color: "#070a0f",
    lang: "tr",
    icons: [
      {
        src: "/icon.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}