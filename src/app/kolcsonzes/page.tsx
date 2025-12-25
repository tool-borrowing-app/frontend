"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Paper,
  TextInput,
  Select,
  Text,
  SimpleGrid,
  Group,
  Pagination,
  Stack,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { getAllTools } from "@/apiClient/modules/tool";
import type { ToolDto } from "../eszkozeim/page";

const PAGE_SIZE = 8;

export default function Page() {
  const [search, setSearch] = useState<string>("");
  const [category, setCategory] = useState<string | null>(null);
  const [sort, setSort] = useState<string | null>("name-asc");
  const [from, setFrom] = useState<Date | null>(null);
  const [to, setTo] = useState<Date | null>(null);
  const [page, setPage] = useState(1);

  const [allTools, setAllTools] = useState<ToolDto[]>([]);

  useEffect(() => {
    const fetchTools = async () => {
      const result = await getAllTools();
      setAllTools(result.data);
    };
    fetchTools();
  }, []);

  const categoryOptions = useMemo(() => {
    const byCode = new Map<string, string>();

    allTools.forEach((t) => {
      const code = t.category?.code;
      const name = t.category?.name;
      if (code && name) byCode.set(code, name);
    });

    return Array.from(byCode.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label, "hu"));
  }, [allTools]);

  const filtered = useMemo(() => {
    let items = [...allTools];

    if (search.trim().length > 0) {
      const q = search.toLowerCase();
      items = items.filter((t) => t.name.toLowerCase().includes(q));
    }

    if (category) {
      items = items.filter((t) => t.category?.code === category);
    }

    switch (sort) {
      case "name-asc":
        items.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        items.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "price-asc":
        items.sort((a, b) => a.rentalPrice - b.rentalPrice);
        break;
      case "price-desc":
        items.sort((a, b) => b.rentalPrice - a.rentalPrice);
        break;
    }

    return items;
  }, [search, category, sort, from, to, allTools]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)),
    [filtered.length],
  );

  // keep page valid when filters shrink result set
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  console.log({ allTools });

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--mantine-color-body)" }}
    >
      <main className="flex-1 flex px-6 py-6 gap-6">
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
              data={categoryOptions}
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
                setFrom(value ? new Date(value) : null);
                setPage(1);
              }}
              label=" -tól"
              placeholder="Dátum"
            />
            <DateInput
              value={to}
              onChange={(value) => {
                setTo(value ? new Date(value) : null);
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

        <div className="flex-1 flex flex-col">
          <SimpleGrid cols={4} spacing="lg">
            {pageItems.map((tool) => (
              <Paper
                key={tool.id}
                withBorder
                radius="md"
                className="p-3 flex flex-col gap-2"
              >
                {tool?.imageUrls?.length !== undefined &&
                tool.imageUrls.length > 0 ? (
                  <img
                    src={tool.imageUrls[0]}
                    alt={tool.name}
                    className="w-full aspect-[4/3] object-cover rounded-md"
                  />
                ) : (
                  <div className="w-full aspect-[4/3] bg-gray-200 rounded-md flex items-center justify-center text-[11px] text-gray-600">
                    kép#{tool.id}
                  </div>
                )}
                <Group justify="space-between" align="flex-start" mt={4}>
                  <div>
                    <Text size="sm" fw={500}>
                      {tool.name}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {tool.rentalPrice.toLocaleString("hu-HU")} Ft-tól
                    </Text>
                  </div>
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
