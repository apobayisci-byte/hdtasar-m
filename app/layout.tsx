import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HD Tasarım Atölyesi | Neon Tabela & Özel Tasarım",
  description:
    "HD Tasarım Atölyesi - İşletmelere ve kişiye özel neon tabela, logo ve özel tasarım üretimi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}