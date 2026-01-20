import type { Metadata } from "next";
import {
  ColorSchemeScript,
  mantineHtmlProps,
  MantineProvider,
} from "@mantine/core";
import theme from "./theme";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { ProfileProvider } from "@/contexts/ProfileContext";
import SubNavbar from "@/components/SubNavbar";
import "@mantine/notifications/styles.css";
import { Notifications } from "@mantine/notifications";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "ToolAirbnb",
  description: "ToolAirbnb - your trusted rental companion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🛠</text></svg>"></link>
      <head>
        <ColorSchemeScript />
      </head>
      <body className="antialiased">
        <MantineProvider theme={theme}>
          <Notifications />
          <ProfileProvider>
            <Navbar />
            <SubNavbar />
            <Suspense>{children}</Suspense>
          </ProfileProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
