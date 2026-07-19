import "./globals.css";

import { ReactNode } from "react";
import Providers from "./providers";

export const metadata = {
  title: "Skyward Ops — Drone Fleet Management Console",
  description:
    "Enterprise-grade dashboard for monitoring, analyzing and maintaining a research drone fleet.",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}