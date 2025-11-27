"use client";

import React from "react";
import { TextInput, PasswordInput, Button, Paper, Title } from "@mantine/core";
import { useForm } from "@mantine/form";

export default function Page() {
  const form = useForm({
    initialValues: {
      email: "",
      password: "",
    },
    validate: {
      email: (value) =>
        /^\S+@\S+\.\S+$/.test(value) ? null : "Érvénytelen email cím",
      password: (value) => (value.length > 0 ? null : "Kötelező mező"),
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    // ide jön az API hívás
    console.log("Login adatok:", values);
  };
  return (
    <div
      style={{ background: "var(--mantine-color-body)" }}
      className="min-h-screen flex flex-col"
    >
      <main className="flex-1 flex items-center justify-center px-4">
        <Paper
          withBorder
          shadow="xl"
          radius="md"
          p="xl"
          className="w-full max-w-md"
          bg="var(--mantine-color-surface)"
        >
          <Title order={3} className="mb-6 text-center">
            Bejelentkezés
          </Title>

          <form
            onSubmit={form.onSubmit(handleSubmit)}
            className="space-y-4"
            autoComplete="off"
          >
            <TextInput
              label="Email cím *"
              type="email"
              placeholder="tomika_2002@gmail.com"
              {...form.getInputProps("email")}
            />

            <PasswordInput
              label="Jelszó *"
              placeholder="********"
              {...form.getInputProps("password")}
            />

            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm underline text-blue-600"
                onClick={() => {
                  // ide jöhet majd a "elfelejtett jelszó" navigáció
                  console.log("Elfelejtett jelszó link");
                }}
              >
                Elfelejtett jelszó
              </button>
            </div>

            <div className="pt-2 flex justify-center">
              <Button type="submit" className="px-8">
                Bejelentkezés
              </Button>
            </div>
          </form>
        </Paper>
      </main>

      <footer className="h-8" />
    </div>
  );
}
