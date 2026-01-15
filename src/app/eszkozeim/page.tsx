"use client";

import { getToolsForUser } from "@/apiClient/modules/users";
import { getReservationsForTool } from "@/apiClient/modules/tool";
import { submitReservationReview } from "@/apiClient/modules/reservation";
import { DeleteToolModal } from "@/components/modals/DeleteToolModal";
import { useProfile } from "@/contexts/ProfileContext";
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Group,
  Loader,
  Modal,
  Pagination,
  Paper,
  Anchor,
  Rating,
  Select,
  Table,
  Tabs,
  Text,
  Textarea,
  TextInput,
  Tooltip
} from "@mantine/core";
import { IconPencil, IconPlus, IconSearch, IconStar, IconTrash } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export type LookupDto = { id?: number; code?: string; name?: string };
export type UserDto = { firstName: string; lastName: string; email: string; id: number };
export type ToolDto = {
  id: string;
  name: string;
  description: string;
  rentalPrice: number;
  depositPrice: number;
  status?: LookupDto | null;
  category?: LookupDto | null;
  imageUrls?: string[];
  user?: UserDto | null;
};
export type ReservationDto = {
  id: number;
  toolDto: ToolDto;
  dateFrom: string;
  dateTo: string;
  status: LookupDto;
  ownerScore?: number | null;
  ownerComment?: string | null;
  borrowerScore?: number | null;
  borrowerComment?: string | null;
  borrower: UserDto;
};

function normalizeText(v: unknown) {
  return String(v ?? "")
    .trim()
    .toLowerCase();
}

function formatFt(n: number) {
  return Number.isFinite(n) ? n.toLocaleString("hu-HU") : "0";
}

function getCategoryName(t: ToolDto) {
  return t?.category?.name ?? t?.category?.code ?? "";
}

function getStatusName(t: ToolDto) {
  return t?.status?.name ?? t?.status?.code ?? "";
}

function statusBadgeColor(status: string) {
  const s = normalizeText(status);
  if (s.includes("foglal") || s.includes("reserved")) {
    return "orange";
  }
  if (s.includes("elér") || s.includes("available") || s.includes("active")) {
    return "green";
  }
  if (s.includes("inakt") || s.includes("inactive")) {
    return "gray";
  }
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
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [isRatingReadonly, setIsRatingReadonly] = useState(false);

  const [isDeleteToolModelOpen, setIsDeleteToolModelOpen] = useState<boolean>(false);
  const [selectedToolForDelete, setSelectedToolForDelete] = useState<ToolDto | undefined>(undefined);

  const [selectedTool, setSelectedTool] = useState<ToolDto | null>(null);
  const [reservations, setReservations] = useState<ReservationDto[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(false);

  const [openedRatingModal, setOpenedRatingModal] = useState(false);
  const [currentReservation, setCurrentReservation] = useState<ReservationDto | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState<string>("");

  const fetchTools = async () => {
    if (!user?.id) {
      return;
    }
    try {
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

  const fetchReservations = async (toolId: string) => {
    try {
      setLoadingReservations(true);
      const response = await getReservationsForTool(toolId);
      const data = Array.isArray(response?.data) ? response.data : [];
      setReservations(data);
    } catch (err) {
      console.error("Error fetching reservations:", err);
      setReservations([]);
    } finally {
      setLoadingReservations(false);
    }
  };

  useEffect(() => {
    fetchTools();
  }, [user?.id]);

  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    tools.forEach(t => {
      const v = getCategoryName(t);
      if (v) {
        set.add(v);
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "hu")).map(v => ({ value: v, label: v }));
  }, [tools]);

  const statusOptions = useMemo(() => {
    const set = new Set<string>();
    tools.forEach(t => {
      const v = getStatusName(t);
      if (v) {
        set.add(v);
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "hu")).map(v => ({ value: v, label: v }));
  }, [tools]);

  const filtered = useMemo(() => {
    const qq = normalizeText(q);
    return tools.filter(t => {
      const name = normalizeText(t.name);
      const cat = normalizeText(getCategoryName(t));
      const st = normalizeText(getStatusName(t));
      if (qq && !(name.includes(qq) || cat.includes(qq) || st.includes(qq))) {
        return false;
      }
      if (categoryFilter && getCategoryName(t) !== categoryFilter) {
        return false;
      }
      if (statusFilter && getStatusName(t) !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [tools, q, categoryFilter, statusFilter]);

  useEffect(() => {
    if (!selectedTool) return;

    const stillPresent = filtered.some(t => String(t.id) === String(selectedTool.id));
    if (!stillPresent) {
      setSelectedTool(null);
      setReservations([]);
    }
  }, [filtered, selectedTool]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = useMemo(() => {
    const p = Math.min(page, totalPages);
    const start = (p - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, totalPages]);

  useEffect(() => setPage(1), [q, categoryFilter, statusFilter]);

  const openRatingModal = (reservation: ReservationDto) => {
    setCurrentReservation(reservation);
    setRating(reservation.borrowerScore ?? null);
    setComment(reservation.borrowerComment ?? "");
    setIsRatingReadonly(reservation.borrowerScore != null);
    setOpenedRatingModal(true);
  };

  const saveRating = async () => {
    if (!currentReservation) {
      return;
    }
    if (isRatingReadonly) {
      return;
    } // további védelem: ne mentse, ha read-only
    try {
      const updatedReservation = await submitReservationReview(currentReservation.id, {
        borrowerScore: rating,
        borrowerComment: comment
      });

      setReservations(prev =>
        prev.map(r => (r.id === updatedReservation.id ? updatedReservation : r))
      );

      setOpenedRatingModal(false);
    } catch (err) {
      console.error("Hiba a mentésnél:", err);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-6">
        {user === undefined ? <div className="text-center">Jelentkezz be először!</div> :
         <Paper withBorder radius="md">
           <Tabs defaultValue="eszkozok" className="px-4 pt-3">
             <Tabs.Panel value="eszkozok" pt="md">
               <Group justify="space-between" align="flex-start" wrap="wrap">
                 <Group gap="sm" wrap="wrap">
                   <TextInput value={q} onChange={e => setQ(e.currentTarget.value)} placeholder="Keresés..."
                              leftSection={<IconSearch size={16} />} className="w-[260px]" />
                   <Select value={categoryFilter} onChange={setCategoryFilter} placeholder="Kategória szűrő"
                           data={categoryOptions} clearable searchable className="w-[220px]" />
                   <Select value={statusFilter} onChange={setStatusFilter} placeholder="Státusz szűrő"
                           data={statusOptions} clearable searchable className="w-[220px]" />
                 </Group>
                 <Button leftSection={<IconPlus size={16} />} onClick={() => router.push("/eszkozeim/feltoltes")}>Új
                   eszköz felvétele</Button>
               </Group>

               <Box mt="md">
                 <Paper withBorder radius="md" className="overflow-hidden">
                   <div className="px-4 py-2 border-b">
                     <Group justify="space-between" align="center">
                       <Text fw={600}>Eszközeim</Text>
                       {loading ? <Group gap="xs"><Loader size="sm" /><Text size="sm"
                                                                            c="dimmed">Betöltés...</Text></Group> :
                        <Text size="sm" c="dimmed">{filtered.length} találat</Text>}
                     </Group>
                   </div>

                   <Table striped highlightOnHover withTableBorder withColumnBorders verticalSpacing="sm"
                          horizontalSpacing="md">
                     <Table.Thead>
                       <Table.Tr>
                         <Table.Th>Eszköz neve</Table.Th>
                         <Table.Th>Kategória</Table.Th>
                         <Table.Th>Státusz</Table.Th>
                         <Table.Th>Ár (Ft/nap)</Table.Th>
                         <Table.Th>Kaució (Ft)</Table.Th>
                         <Table.Th>Műveletek</Table.Th>
                       </Table.Tr>
                     </Table.Thead>
                     <Table.Tbody>
                       {paged.map(t => {
                         const cat = getCategoryName(t);
                         const st = getStatusName(t);
                         const isSelected = selectedTool?.id === t.id;
                         return (
                           <Table.Tr key={t.id} onClick={() => {
                             if (isSelected) {
                               setSelectedTool(null);
                               setReservations([]);
                             } else {
                               setSelectedTool(t);
                               fetchReservations(String(t.id));
                             }
                           }} style={{
                             cursor: "pointer",
                             backgroundColor: isSelected ? "rgba(0,0,0,0.05)" : undefined
                           }}>
                             <Table.Td>{t.name}</Table.Td>
                             <Table.Td>{cat || "-"}</Table.Td>
                             <Table.Td><Badge variant="light" color={statusBadgeColor(st)}>{st ||
                                                                                            "-"}</Badge></Table.Td>
                             <Table.Td>{formatFt(Number(t.rentalPrice))}</Table.Td>
                             <Table.Td>{formatFt(Number(t.depositPrice))}</Table.Td>
                             <Table.Td onClick={e => e.stopPropagation()}>
                               <Group gap={6} wrap="nowrap">
                                 <Tooltip label="Módosítás"><ActionIcon variant="subtle"
                                                                        onClick={() => alert("TODO: módosítás")}
                                                                        aria-label="Módosítás"><IconPencil size={16} /></ActionIcon></Tooltip>
                                 <Tooltip label="Törlés"><ActionIcon variant="subtle" color="red" onClick={() => {
                                   setIsDeleteToolModelOpen(true);
                                   setSelectedToolForDelete(t);
                                 }} aria-label="Törlés"><IconTrash size={16} /></ActionIcon></Tooltip>
                                 <DeleteToolModal isDeleteToolModelOpen={isDeleteToolModelOpen}
                                                  setIsDeleteToolModelOpen={setIsDeleteToolModelOpen}
                                                  fetchTools={fetchTools}
                                                  selectedToolIdForDelete={selectedToolForDelete} />
                               </Group>
                             </Table.Td>
                           </Table.Tr>
                         );
                       })}
                       {!loading && paged.length === 0 &&
                        <Table.Tr><Table.Td colSpan={6}><Text c="dimmed" size="sm">Nincs találat a megadott
                          szűrőkre.</Text></Table.Td></Table.Tr>}
                     </Table.Tbody>
                   </Table>

                   <Box mt="lg" px="4">
                     {selectedTool ? (
                       <>
                         <Text fw={600} mb="sm">
                           Foglalások az eszközhöz: {selectedTool.name}
                         </Text>
                         <Paper withBorder radius="md" className="overflow-hidden">
                           {loadingReservations ? (
                             <Group justify="center" py="md">
                               <Loader size="sm" />
                               <Text size="sm" c="dimmed">
                                 Foglalások betöltése...
                               </Text>
                             </Group>
                           ) : reservations.length > 0 ? (
                             <Table striped highlightOnHover withTableBorder withColumnBorders verticalSpacing="sm"
                                    horizontalSpacing="md">
                               <Table.Thead>
                                 <Table.Tr>
                                   <Table.Th>Bérlő</Table.Th>
                                   <Table.Th>Kezdő dátum</Table.Th>
                                   <Table.Th>Végdátum</Table.Th>
                                   <Table.Th>Státusz</Table.Th>
                                   <Table.Th>Műveletek</Table.Th>
                                 </Table.Tr>
                               </Table.Thead>
                               <Table.Tbody>
                                 {reservations.map((r) => (
                                   <Table.Tr key={r.id}>
                                     <Table.Td>
                                       {r.borrower
                                        ? `${r.borrower.firstName} ${r.borrower.lastName}`
                                        : "-"}
                                     </Table.Td>
                                     <Table.Td>{r.dateFrom}</Table.Td>
                                     <Table.Td>{r.dateTo}</Table.Td>
                                     <Table.Td>
                                       <Badge color={statusBadgeColor(r.status?.name ?? "")}>
                                         {r.status?.name ?? "-"}
                                       </Badge>
                                     </Table.Td>
                                     <Table.Td>
                                       <Group gap="md" wrap="nowrap">
                                         <Anchor
                                           component="button"
                                           onClick={() => {
                                             console.log("Megtekintés:", r.id);
                                           }}
                                           style={{ cursor: "pointer" }}
                                         >Megtekintés
                                         </Anchor>
                                         {r.status?.code === "FINISHED" && (
                                           <Group align="center">
                                             <IconStar size={14} color={r.borrowerScore ? "#f5c518" : undefined} />
                                             <Anchor
                                               component="button"
                                               onClick={() => openRatingModal(r)}
                                               style={{ cursor: "pointer" }}
                                             >Értékelés
                                             </Anchor>
                                           </Group>
                                         )}
                                       </Group>
                                     </Table.Td>
                                   </Table.Tr>
                                 ))}
                               </Table.Tbody>
                             </Table>
                           ) : (
                                 <Text c="dimmed" size="sm" py="md" ta="center">
                                   Nincs foglalás ehhez az eszközhöz.
                                 </Text>
                               )}
                         </Paper>
                       </>
                     ) : (
                        <Text c="dimmed" size="sm" py="md" ta="center">
                          Jelenleg egy eszköz sincs kiválasztva. Válasszon ki egy eszközt a foglalásainak
                          megtekintéséhez.
                        </Text>
                      )}
                   </Box>

                   <div className="flex items-center justify-end gap-3 border-t px-4 py-2">
                     <Pagination value={Math.min(page, totalPages)} onChange={setPage} total={totalPages} size="sm" />
                   </div>
                 </Paper>
               </Box>

               <Modal
                 opened={openedRatingModal}
                 onClose={() => setOpenedRatingModal(false)}
                 title={`Értékelés: ${currentReservation?.toolDto?.name ?? ""}`}
                 centered
               >
                 <Text mb="xs">
                   Név: {currentReservation?.toolDto?.user?.firstName}{" "}
                   {currentReservation?.toolDto?.user?.lastName}
                 </Text>

                 {isRatingReadonly && (
                   <Text size="sm" c="dimmed" mb="sm">
                     Ezt a foglalást már értékelte. Az értékelés nem módosítható.
                   </Text>
                 )}

                 <Text mb="xs">Értékelés:</Text>
                 <Rating
                   value={rating ?? 0}
                   onChange={(val) => setRating(val)}
                   size="lg"
                   readOnly={isRatingReadonly}
                 />

                 <Text mb="xs" mt="sm">Leírás:</Text>
                 <Textarea
                   value={comment ?? ""}
                   onChange={(e) => setComment(e.currentTarget.value)}
                   placeholder="Ide írhatod a megjegyzést"
                   minRows={3}
                   readOnly={isRatingReadonly}
                 />

                 <Group mt="md">
                   <Button variant="outline" onClick={() => setOpenedRatingModal(false)}>
                     {isRatingReadonly ? "Bezár" : "Mégse"}
                   </Button>

                   {!isRatingReadonly && (
                     <Button onClick={saveRating}>Mentés</Button>
                   )}
                 </Group>
               </Modal>

             </Tabs.Panel>
           </Tabs>
         </Paper>}
      </div>
    </div>
  );
}
