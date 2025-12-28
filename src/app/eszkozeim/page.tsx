"use client";

import { getToolsForUser } from "@/apiClient/modules/users";
import { DeleteToolModal } from "@/components/modals/DeleteToolModal";
import { useProfile } from "@/contexts/ProfileContext";
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Group,
  Loader,
  Pagination,
  Paper,
  Select,
  Table,
  Tabs,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import {
  IconPencil,
  IconPlus,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export type LookupDto = {
  id?: number;
  code?: string;
  name?: string;
};

export type ToolDto = {
  id: string;
  name: string;
  description: string;
  rentalPrice: number;
  depositPrice: number;
  status?: LookupDto | null;
  category?: LookupDto | null;
  imageUrls?: string[];
};

function normalizeText(v: unknown) {
  return String(v ?? "")
    .trim()
    .toLowerCase();
}

function formatFt(n: number) {
  const v = Number.isFinite(n) ? n : 0;
  return v.toLocaleString("hu-HU");
}

function getCategoryName(t: ToolDto) {
  return t?.category?.name ?? t?.category?.code ?? "";
}

function getStatusName(t: ToolDto) {
  return t?.status?.name ?? t?.status?.code ?? "";
}

function statusBadgeColor(status: string) {
  const s = normalizeText(status);
  if (s.includes("foglal") || s.includes("reserved")) return "orange";
  if (s.includes("elér") || s.includes("available") || s.includes("active"))
    return "green";
  if (s.includes("inakt") || s.includes("inactive")) return "gray";
  return "blue";
}

export default function Page() {
  const router = useRouter();
  const { user } = useProfile();

  const [loading, setLoading] = useState(false);
  const [tools, setTools] = useState<ToolDto[]>([]);

  const [q, setQ] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const [isDeleteToolModelOpen, setIsDeleteToolModelOpen] =
    useState<boolean>(false);

  const [selectedToolForDelete, setSelectedToolForDelete] = useState<
    ToolDto | undefined
  >(undefined);

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchTools = async () => {
    try {
      if (!user?.id) return;
      setLoading(true);

      const response = await getToolsForUser({ userId: String(user.id) });
      const data = response?.data;
      const list: ToolDto[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.content)
          ? data.content
          : Array.isArray(data?.items)
            ? data.items
            : [];

      setTools(list);
    } catch (err) {
      console.error("Error fetching tools:", err);
      setTools([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTools();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    for (const t of tools) {
      const v = getCategoryName(t);
      if (v) set.add(v);
    }
    return Array.from(set)
      .sort((a, b) => a.localeCompare(b, "hu"))
      .map((v) => ({ value: v, label: v }));
  }, [tools]);

  const statusOptions = useMemo(() => {
    const set = new Set<string>();
    for (const t of tools) {
      const v = getStatusName(t);
      if (v) set.add(v);
    }
    return Array.from(set)
      .sort((a, b) => a.localeCompare(b, "hu"))
      .map((v) => ({ value: v, label: v }));
  }, [tools]);

  const filtered = useMemo(() => {
    const qq = normalizeText(q);

    return tools.filter((t) => {
      const name = normalizeText(t.name);
      const cat = normalizeText(getCategoryName(t));
      const st = normalizeText(getStatusName(t));

      if (qq && !(name.includes(qq) || cat.includes(qq) || st.includes(qq)))
        return false;

      if (categoryFilter && getCategoryName(t) !== categoryFilter) return false;
      if (statusFilter && getStatusName(t) !== statusFilter) return false;

      return true;
    });
  }, [tools, q, categoryFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const paged = useMemo(() => {
    const p = Math.min(page, totalPages);
    const start = (p - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, totalPages]);

  useEffect(() => {
    setPage(1);
  }, [q, categoryFilter, statusFilter]);

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-6">
        {user === undefined ? (
          <div className="text-center">Jelentkezz be először!</div>
        ) : (
          <Paper withBorder radius="md">
            <Tabs defaultValue="eszkozok" className="px-4 pt-3">
              <Tabs.Panel value="eszkozok" pt="md">
                <Group justify="space-between" align="flex-start" wrap="wrap">
                  <Group gap="sm" wrap="wrap">
                    <TextInput
                      value={q}
                      onChange={(e) => setQ(e.currentTarget.value)}
                      placeholder="Keresés..."
                      leftSection={<IconSearch size={16} />}
                      className="w-[260px]"
                    />
                    <Select
                      value={categoryFilter}
                      onChange={setCategoryFilter}
                      placeholder="Kategória szűrő"
                      data={categoryOptions}
                      clearable
                      searchable
                      className="w-[220px]"
                    />
                    <Select
                      value={statusFilter}
                      onChange={setStatusFilter}
                      placeholder="Státusz szűrő"
                      data={statusOptions}
                      clearable
                      searchable
                      className="w-[220px]"
                    />
                  </Group>

                  <Button
                    leftSection={<IconPlus size={16} />}
                    onClick={() => router.push("/eszkozeim/feltoltes")}
                  >
                    Új eszköz felvétele
                  </Button>
                </Group>

                <Box mt="md">
                  <Paper withBorder radius="md" className="overflow-hidden">
                    <div className="px-4 py-2 border-b">
                      <Group justify="space-between" align="center">
                        <Text fw={600}>Eszközeim</Text>
                        {loading ? (
                          <Group gap="xs">
                            <Loader size="sm" />
                            <Text size="sm" c="dimmed">
                              Betöltés...
                            </Text>
                          </Group>
                        ) : (
                          <Text size="sm" c="dimmed">
                            {filtered.length} találat
                          </Text>
                        )}
                      </Group>
                    </div>

                    <Table
                      striped
                      highlightOnHover
                      withTableBorder
                      withColumnBorders
                      verticalSpacing="sm"
                      horizontalSpacing="md"
                    >
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Eszköz neve</Table.Th>
                          <Table.Th>Eszköz kategóriája</Table.Th>
                          <Table.Th>Státusz</Table.Th>
                          <Table.Th>Ár (Ft/nap)</Table.Th>
                          <Table.Th>Kaució (Ft)</Table.Th>
                          <Table.Th>Műveletek</Table.Th>
                        </Table.Tr>
                      </Table.Thead>

                      <Table.Tbody>
                        {paged.map((t) => {
                          const cat = getCategoryName(t);
                          const st = getStatusName(t);

                          return (
                            <Table.Tr
                              key={String(t.id)}
                              onClick={() => router.push(`/eszkozeim/${t.id}`)}
                              style={{
                                cursor: "pointer",
                              }}
                            >
                              <Table.Td>{t.name}</Table.Td>
                              <Table.Td>{cat || "-"}</Table.Td>
                              <Table.Td>
                                <Badge
                                  variant="light"
                                  color={statusBadgeColor(st)}
                                >
                                  {st || "-"}
                                </Badge>
                              </Table.Td>
                              <Table.Td>
                                {formatFt(Number(t.rentalPrice))}
                              </Table.Td>
                              <Table.Td>
                                {formatFt(Number(t.depositPrice))}
                              </Table.Td>
                              <Table.Td onClick={(e) => e.stopPropagation()}>
                                <Group gap={6} wrap="nowrap">
                                  <Tooltip label="Módosítás">
                                    <ActionIcon
                                      variant="subtle"
                                      onClick={() => {
                                        // TODO
                                        alert("TODO: módosítás");
                                      }}
                                      aria-label="Módosítás"
                                    >
                                      <IconPencil size={16} />
                                    </ActionIcon>
                                  </Tooltip>

                                  <Tooltip label="Törlés">
                                    <ActionIcon
                                      variant="subtle"
                                      color="red"
                                      onClick={() => {
                                        setIsDeleteToolModelOpen(true);
                                        setSelectedToolForDelete(t);
                                      }}
                                      aria-label="Törlés"
                                    >
                                      <IconTrash size={16} />
                                    </ActionIcon>
                                  </Tooltip>
                                  <DeleteToolModal
                                    isDeleteToolModelOpen={
                                      isDeleteToolModelOpen
                                    }
                                    setIsDeleteToolModelOpen={
                                      setIsDeleteToolModelOpen
                                    }
                                    fetchTools={() => fetchTools()}
                                    selectedToolIdForDelete={
                                      selectedToolForDelete
                                    }
                                  />
                                </Group>
                              </Table.Td>
                            </Table.Tr>
                          );
                        })}

                        {!loading && paged.length === 0 && (
                          <Table.Tr>
                            <Table.Td colSpan={6}>
                              <Text c="dimmed" size="sm">
                                Nincs találat a megadott szűrőkre.
                              </Text>
                            </Table.Td>
                          </Table.Tr>
                        )}
                      </Table.Tbody>
                    </Table>

                    <div className="flex items-center justify-end gap-3 border-t px-4 py-2">
                      <Pagination
                        value={Math.min(page, totalPages)}
                        onChange={setPage}
                        total={totalPages}
                        size="sm"
                      />
                    </div>
                  </Paper>
                </Box>
              </Tabs.Panel>
            </Tabs>
          </Paper>
        )}
      </div>
    </div>
  );
}
