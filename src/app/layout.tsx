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
          <ProfileProvider>
            <Navbar />
            <SubNavbar />
            {children}
          </ProfileProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
