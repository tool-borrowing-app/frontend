"use client";

import React from "react";
import { TextInput, PasswordInput, Button, Paper, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { loginUser } from "@/apiClient/modules/auth";
import axios from "axios";

export default function Page() {
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>(
    undefined,
  );

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

  const handleSubmit = async (values: typeof form.values) => {
    setErrorMessage(undefined);
    try {
      const res = await loginUser({
        email: values.email,
        password: values.password,
      });

      console.log("Login response:", res);

      // redirect to homepage on successful login
      window.location.href = "/";
    } catch (err: unknown) {
      console.error("Login failed:", err);

      let msg = "Bejelentkezés sikertelen";

      if (axios.isAxiosError(err)) {
        const data = err.response?.data as
          | { error?: string; message?: string }
          | undefined;

        msg = data?.error ?? data?.message ?? msg;
      }

      setErrorMessage(msg);
    }
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
                  // TODO: "elfelejtett jelszó"
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
            {errorMessage && (
              <div className="text-red-600 text-center mb-4">
                {errorMessage}
              </div>
            )}
          </form>
        </Paper>
      </main>

      <footer className="h-8" />
    </div>
  );
}
