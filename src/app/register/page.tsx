"use client";

import React from "react";
import {
  TextInput,
  PasswordInput,
  Checkbox,
  Button,
  Paper,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";

export default function Page() {
  const form = useForm({
    initialValues: {
      lastName: "",
      firstName: "",
      password: "",
      passwordConfirm: "",
      phone: "",
      email: "",
      zip: "",
      city: "",
      address: "",
      privacyAccepted: false,
    },
    validate: {
      lastName: (value) => (value.trim().length > 0 ? null : "Kötelező mező"),
      firstName: (value) => (value.trim().length > 0 ? null : "Kötelező mező"),
      password: (value) =>
        value.length >= 8 ? null : "Legalább 8 karakter szükséges",
      passwordConfirm: (value, values) =>
        value === values.password ? null : "A két jelszó nem egyezik",
      phone: (value) => (value.trim().length > 0 ? null : "Kötelező mező"),
      email: (value) =>
        /^\S+@\S+\.\S+$/.test(value) ? null : "Érvénytelen email cím",
      zip: (value) => (value.trim().length > 0 ? null : "Kötelező mező"),
      city: (value) => (value.trim().length > 0 ? null : "Kötelező mező"),
      address: (value) => (value.trim().length > 0 ? null : "Kötelező mező"),
      privacyAccepted: (value) =>
        value ? null : "El kell fogadnod az adatvédelmi nyilatkozatot",
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    // ide jönne az API hívás
    console.log("Regisztrációs adatok:", values);
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--mantine-color-body)" }}
    >
      {/* <div className="flex items-center px-6 py-4 border-b border-gray-200">
        <span className="text-2xl mr-2">🛠</span>
        <span className="text-xl font-semibold">ToolAirbnb</span>
      </div> */}

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <Paper
          withBorder
          shadow="xl"
          radius="md"
          p="xl"
          className="w-full max-w-xl"
          bg="var(--mantine-color-surface)"
        >
          <Title order={3} className="mb-6 text-center">
            Regisztráció
          </Title>

          <form
            onSubmit={form.onSubmit(handleSubmit)}
            className="space-y-4"
            autoComplete="off"
          >
            <TextInput
              label="Vezetéknév *"
              placeholder="Kis"
              {...form.getInputProps("lastName")}
            />
            <TextInput
              label="Keresztnév *"
              placeholder="Tamás"
              {...form.getInputProps("firstName")}
            />

            <PasswordInput
              label="Jelszó *"
              placeholder="********"
              {...form.getInputProps("password")}
            />
            <PasswordInput
              label="Jelszó újból *"
              placeholder="********"
              {...form.getInputProps("passwordConfirm")}
            />

            <TextInput
              label="Telefonszám *"
              type="tel"
              placeholder="+36 30 123 4567"
              {...form.getInputProps("phone")}
            />

            <TextInput
              label="Email *"
              type="email"
              placeholder="tomika.2002@gmail.com"
              {...form.getInputProps("email")}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput
                label="Irányítószám *"
                placeholder="6666"
                {...form.getInputProps("zip")}
              />
              <TextInput
                label="Város *"
                placeholder="Budapest"
                {...form.getInputProps("city")}
              />
            </div>

            <TextInput
              label="Utca, házszám *"
              placeholder="Fő utca 10."
              {...form.getInputProps("address")}
            />

            <Checkbox
              label={
                <>
                  Az{" "}
                  <a
                    href="#"
                    className="text-blue-600 underline"
                    onClick={(e) => e.preventDefault()}
                  >
                    adatvédelmi nyilatkozatot
                  </a>{" "}
                  elfogadom
                </>
              }
              {...form.getInputProps("privacyAccepted", {
                type: "checkbox",
              })}
            />

            <div className="pt-2 flex justify-center">
              <Button type="submit" className="px-8">
                Regisztráció
              </Button>
            </div>
          </form>
        </Paper>
      </main>

      <footer className="h-8" />
    </div>
  );
}
