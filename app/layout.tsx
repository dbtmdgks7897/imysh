import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "imysh",
  description: "Personal portfolio — Projects, craft, and values.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
