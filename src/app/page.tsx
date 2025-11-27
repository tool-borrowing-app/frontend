"use client";

import React from "react";
import { Button, Paper, Text, Group, Box } from "@mantine/core";

type PageProps = {
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
};

export default function Page({ onLoginClick, onRegisterClick }: PageProps) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--mantine-color-body)" }}
    >
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-10 items-center lg:items-start">
          <Paper
            withBorder
            p="md"
            radius="md"
            shadow="sm"
            bg="var(--mantine-color-surface)"
            className="w-full lg:w-1/2 h-72 relative flex items-center justify-center"
          >
            <div className="absolute inset-4">
              <div className="absolute inset-4">
                <div className="h-full w-full relative">
                  <div className="absolute inset-0 transform rotate-0" />
                  <div className="absolute inset-0 transform rotate-180" />
                </div>
              </div>
            </div>
            TODO add kép
          </Paper>

          <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start">
            <Paper
              p="md"
              radius="md"
              bg="var(--mantine-color-surface)"
              className="w-full"
              withBorder
            >
              <Text size="sm">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
                Ultrices eros in cursus turpis massa tincidunt dui. Iaculis et
                erat pellentesque adipiscing commodo elit at imperdiet dui.
                Risus commodo viverra maecenas accumsan.
              </Text>
            </Paper>

            <Group mt="lg">
              <Button
                variant="primary"
                onClick={onLoginClick}
                className="px-6"
                onClickCapture={() => (window.location.href = "/login")}
              >
                Bejelentkezés
              </Button>
              <Button
                variant="outline"
                onClick={onRegisterClick}
                className="px-6"
                onClickCapture={() => (window.location.href = "/register")}
              >
                Regisztráció
              </Button>
            </Group>
          </div>
        </div>
      </main>

      <Box>
        <Paper
          withBorder
          className="py-4"
          style={{ background: "var(--mantine-color-surface)" }}
        >
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-around items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span>✉️</span>
              <span>Contact Us</span>
            </div>
            <div className="flex items-center gap-2">
              <span>👥</span>
              <span>About Us</span>
            </div>
            <div className="flex items-center gap-2">
              <span>📄</span>
              <span>Terms</span>
            </div>
          </div>
        </Paper>

        <Box className="text-center text-xs py-2">
          Copyright © 2025 - ToolAirbnb. All rights reserved.
        </Box>
      </Box>
    </div>
  );
}
