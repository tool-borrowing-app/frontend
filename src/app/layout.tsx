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
