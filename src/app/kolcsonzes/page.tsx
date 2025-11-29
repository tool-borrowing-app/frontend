"use client";

import React, { useMemo, useState } from "react";
import {
  Paper,
  TextInput,
  Select,
  Text,
  SimpleGrid,
  Group,
  Badge,
  Pagination,
  Stack,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";

type Tool = {
  id: number;
  name: string;
  price: number;
  category: string;
  availableFrom: Date;
  availableTo: Date;
};

const TOOLS: Tool[] = [
  {
    id: 1,
    name: "Fúrógép",
    price: 8000,
    category: "Elektromos szerszám",
    availableFrom: new Date("2024-09-10"),
    availableTo: new Date("2024-09-20"),
  },
  {
    id: 2,
    name: "Porszívó",
    price: 15000,
    category: "Háztartás",
    availableFrom: new Date("2024-09-11"),
    availableTo: new Date("2024-09-25"),
  },
  {
    id: 3,
    name: "Csavarhúzó készlet",
    price: 3000,
    category: "Kéziszerszám",
    availableFrom: new Date("2024-09-12"),
    availableTo: new Date("2024-09-18"),
  },
  {
    id: 4,
    name: "Csiszológép",
    price: 20000,
    category: "Elektromos szerszám",
    availableFrom: new Date("2024-09-13"),
    availableTo: new Date("2024-09-30"),
  },
  {
    id: 5,
    name: "Varrógép",
    price: 17000,
    category: "Háztartás",
    availableFrom: new Date("2024-09-10"),
    availableTo: new Date("2024-09-19"),
  },
  {
    id: 6,
    name: "Fűnyíró",
    price: 10000,
    category: "Kerti eszköz",
    availableFrom: new Date("2024-09-14"),
    availableTo: new Date("2024-09-21"),
  },
  {
    id: 7,
    name: "Utánfutó",
    price: 50000,
    category: "Egyéb",
    availableFrom: new Date("2024-09-09"),
    availableTo: new Date("2024-09-30"),
  },
  {
    id: 8,
    name: "Gőztisztító",
    price: 40000,
    category: "Háztartás",
    availableFrom: new Date("2024-09-15"),
    availableTo: new Date("2024-09-28"),
  },
];

const PAGE_SIZE = 8;

export default function Page() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [sort, setSort] = useState<string | null>("name-asc");
  const [from, setFrom] = useState<string | null>(null);
  const [to, setTo] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const categories = Array.from(new Set(TOOLS.map((t) => t.category)));

  const filtered = useMemo(() => {
    let items = [...TOOLS];

    if (search.trim().length > 0) {
      const q = search.toLowerCase();
      items = items.filter((t) => t.name.toLowerCase().includes(q));
    }

    if (category) {
      items = items.filter((t) => t.category === category);
    }

    if (from) {
      const fromDate = new Date(from);
      items = items.filter((t) => t.availableTo >= fromDate);
    }

    if (to) {
      const toDate = new Date(to);
      items = items.filter((t) => t.availableFrom <= toDate);
    }

    switch (sort) {
      case "name-asc":
        items.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        items.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "price-asc":
        items.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        items.sort((a, b) => b.price - a.price);
        break;
    }

    return items;
  }, [search, category, sort, from, to]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // reset to first page when filters change and page would be out of range
  if (page > totalPages) {
    setPage(1);
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--mantine-color-body)" }}
    >
      <main className="flex-1 flex px-6 py-6 gap-6">
        {/* Left sidebar */}
        <Paper
          withBorder
          radius="md"
          className="w-full max-w-xs p-4 flex flex-col gap-4"
        >
          <TextInput
            label="Keresés"
            placeholder="Eszköz neve"
            value={search}
            onChange={(e) => {
              setSearch(e.currentTarget.value);
              setPage(1);
            }}
            classNames={{ input: "rounded-md" }}
          />

          <Stack gap="xs">
            <Text size="sm" fw={500}>
              Kategória szűrő
            </Text>
            <Select
              placeholder="Összes kategória"
              data={categories.map((c) => ({ value: c, label: c }))}
              value={category}
              onChange={(value) => {
                setCategory(value);
                setPage(1);
              }}
              allowDeselect
            />
          </Stack>

          <Stack gap="xs">
            <Text size="sm" fw={500}>
              Rendezés
            </Text>
            <Select
              data={[
                { value: "name-desc", label: "Név szerint csökkenő" },
                { value: "name-asc", label: "Név szerint növekvő" },
                { value: "price-desc", label: "Ár szerint csökkenő" },
                { value: "price-asc", label: "Ár szerint növekvő" },
              ]}
              value={sort}
              onChange={(value) => setSort(value)}
            />
          </Stack>

          <Stack gap="xs">
            <Text size="sm" fw={500}>
              Elérhető
            </Text>
            <DateInput
              value={from}
              onChange={(value) => {
                setFrom(value);
                setPage(1);
              }}
              label=" -tól"
              placeholder="Dátum"
            />
            <DateInput
              value={to}
              onChange={(value) => {
                setTo(value);
                setPage(1);
              }}
              label=" -ig"
              placeholder="Dátum"
            />
          </Stack>

          <div className="mt-auto pt-4 text-xs text-gray-500">
            <Text>{filtered.length} találat</Text>
          </div>
        </Paper>

        {/* Tool grid */}
        <div className="flex-1 flex flex-col">
          <SimpleGrid cols={4} spacing="lg" className="flex-1">
            {pageItems.map((tool) => (
              <Paper
                key={tool.id}
                withBorder
                radius="md"
                className="p-3 flex flex-col gap-2"
              >
                <div className="w-full aspect-[4/3] bg-gray-200 rounded-md flex items-center justify-center text-[11px] text-gray-600">
                  kép#{tool.id}
                </div>
                <Group justify="space-between" align="flex-start" mt={4}>
                  <div>
                    <Text size="sm" fw={500}>
                      {tool.name}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {tool.price.toLocaleString("hu-HU")} Ft-tól
                    </Text>
                  </div>
                  <Badge size="xs" radius="sm" variant="light">
                    {tool.category}
                  </Badge>
                </Group>
              </Paper>
            ))}
          </SimpleGrid>

          <Group justify="space-between" mt="md">
            <Text size="xs" c="dimmed">
              {filtered.length} találat
            </Text>
            <Pagination
              total={totalPages}
              value={page}
              onChange={setPage}
              size="sm"
              className="self-end"
            />
          </Group>
        </div>
      </main>
    </div>
  );
}
