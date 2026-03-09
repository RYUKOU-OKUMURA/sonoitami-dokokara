import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "その痛み、どこから？",
  description:
    "整体師の見立てをゲームとして体験するMVP UIプロトタイプ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
