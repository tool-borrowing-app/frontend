/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { Paper, Group, Button } from "@mantine/core";
import Link from "next/link";
import { useProfile } from "@/contexts/ProfileContext";

export function Navbar() {
  const { user } = useProfile();

  const handleLogout = async () => {
    // TODO implement logout functionality
  };

  return (
    <Paper
      withBorder
      shadow="xs"
      className="px-6 py-4 flex items-center justify-between"
      bg="var(--mantine-color-surface)"
    >
      <Link href="/" className="flex items-center gap-2">
        <span className="text-2xl">🛠</span>
        <span className="text-xl font-semibold">ToolAirbnb</span>
      </Link>

      {!user ? (
        <Group>
          <Button variant="primary" component={Link} href="/login">
            Bejelentkezés
          </Button>

          <Button variant="outline" component={Link} href="/register">
            Regisztráció
          </Button>
        </Group>
      ) : (
        <Group>
          <span>Üdv: {(user as any).firstName}!</span>
          <Button variant="primary" onClick={() => handleLogout()}>
            Logout
          </Button>
        </Group>
      )}
    </Paper>
  );
}
