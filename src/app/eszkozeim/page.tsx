/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { getToolsForUser } from "@/apiClient/modules/users";
import { getReservationsForTool } from "@/apiClient/modules/tool";
import { submitReservationReview } from "@/apiClient/modules/reservation";
import { getUserReviewStatistics, ReviewStatisticsDto } from "@/apiClient/modules/users";
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
  Tooltip,
  Stack
} from "@mantine/core";
import { IconPencil, IconPlus, IconSearch, IconStar, IconEye, IconTrash, IconMessageStar  } from "@tabler/icons-react";
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

  const [isDeleteToolModelOpen, setIsDeleteToolModelOpen] = useState<boolean>(false);
  const [selectedToolForDelete, setSelectedToolForDelete] = useState<ToolDto | undefined>(undefined);

  const [selectedTool, setSelectedTool] = useState<ToolDto | null>(null);
  const [reservations, setReservations] = useState<ReservationDto[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(false);

  // BORROWER STATS modal
  const [openedBorrowerModal, setOpenedBorrowerModal] = useState(false);
  const [selectedBorrower, setSelectedBorrower] = useState<UserDto | null>(null);
  const [reviewStats, setReviewStats] = useState<ReviewStatisticsDto | null>(null);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // RATING modal (for finished reservations) - owner rates borrower (stored in borrowerScore/borrowerComment)
  const [openedRatingModal, setOpenedRatingModal] = useState(false);
  const [currentReservation, setCurrentReservation] = useState<ReservationDto | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState<string>("");
  const [isRatingReadonly, setIsRatingReadonly] = useState(false);

  const [openedViewModal, setOpenedViewModal] = useState(false);
  const [viewReservation, setViewReservation] = useState<ReservationDto | null>(null);

  const fetchTools = async () => {
    if (!user?.id) return;
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
      if (v) set.add(v);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "hu")).map(v => ({ value: v, label: v }));
  }, [tools]);

  const statusOptions = useMemo(() => {
    const set = new Set<string>();
    tools.forEach(t => {
      const v = getStatusName(t);
      if (v) set.add(v);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "hu")).map(v => ({ value: v, label: v }));
  }, [tools]);

  const filtered = useMemo(() => {
    const qq = normalizeText(q);
    return tools.filter(t => {
      const name = normalizeText(t.name);
      const cat = normalizeText(getCategoryName(t));
      const st = normalizeText(getStatusName(t));
      if (qq && !(name.includes(qq) || cat.includes(qq) || st.includes(qq))) return false;
      if (categoryFilter && getCategoryName(t) !== categoryFilter) return false;
      if (statusFilter && getStatusName(t) !== statusFilter) return false;
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

  // Borrower stats modal fetch
  const openBorrowerModal = async (borrower: UserDto) => {
    setSelectedBorrower(borrower);
    setOpenedBorrowerModal(true);
    setLoadingReviews(true);
    setReviewStats(null);

    try {
      const res = await getUserReviewStatistics(borrower.id);
      if (res.status === 200 && res.data) {
        setReviewStats(res.data);
      } else {
        setReviewStats(null);
      }
    } catch (e) {
      console.error("Hiba az értékelések betöltésekor", e);
      setReviewStats(null);
    } finally {
      setLoadingReviews(false);
    }
  };

  // Rating modal (for finished reservations) - owner rates borrower
  const openRatingModal = (reservation: ReservationDto) => {
    setCurrentReservation(reservation);
    // prefill with already-submitted rating if present (owner previously rated borrower)
    setRating(reservation.borrowerScore ?? null);
    setComment(reservation.borrowerComment ?? "");
    setIsRatingReadonly(reservation.borrowerScore != null);
    setOpenedRatingModal(true);
  };

  const saveRating = async () => {
    if (!currentReservation) return;
    if (isRatingReadonly) return; // extra guard

    try {
      // Call API - expected to return updated reservation (try to handle both shapes)
      const res = await submitReservationReview(currentReservation.id, {
        borrowerScore: rating,
        borrowerComment: comment
      });

      // Try different forms of return value (res or res.data)
      const updated: ReservationDto = (res && (res.data ?? res)) as ReservationDto;

      if (updated && updated.id) {
        setReservations(prev => prev.map(r => (r.id === updated.id ? updated : r)));
      } else {
        // Fallback: Update currentReservation fields locally
        setReservations(prev => prev.map(r => {
          if (r.id === currentReservation.id) {
            return { ...r, borrowerScore: rating ?? null, borrowerComment: comment ?? null };
          }
          return r;
        }));
      }

      setOpenedRatingModal(false);
      setCurrentReservation(null);
    } catch (err) {
      console.error("Hiba a mentésnél:", err);
    }
  };

  const openViewModal = (reservation: ReservationDto) => {
    setViewReservation(reservation);
    setOpenedViewModal(true);
  };

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
                       onChange={e => setQ(e.currentTarget.value)}
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
                             <Text size="sm" c="dimmed">Betöltés...</Text>
                           </Group>
                         ) : (
                            <Text size="sm" c="dimmed">{filtered.length} találat</Text>
                          )}
                       </Group>
                     </div>

                     <Table striped highlightOnHover withTableBorder withColumnBorders verticalSpacing="sm" horizontalSpacing="md">
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
                             }} style={{ cursor: "pointer", backgroundColor: isSelected ? "rgba(0,0,0,0.05)" : undefined }}>
                               <Table.Td>{t.name}</Table.Td>
                               <Table.Td>{cat || "-"}</Table.Td>
                               <Table.Td><Badge variant="light" color={statusBadgeColor(st)}>{st || "-"}</Badge></Table.Td>
                               <Table.Td>{formatFt(Number(t.rentalPrice))}</Table.Td>
                               <Table.Td>{formatFt(Number(t.depositPrice))}</Table.Td>
                               <Table.Td onClick={e => e.stopPropagation()}>
                                 <Group gap={6} wrap="nowrap">
                                   <Tooltip label="Módosítás">
                                     <ActionIcon variant="subtle" onClick={() => alert("TODO: módosítás")} aria-label="Módosítás">
                                       <IconPencil size={16} />
                                     </ActionIcon>
                                   </Tooltip>
                                   <Tooltip label="Törlés">
                                     <ActionIcon variant="subtle" color="red" onClick={() => {
                                       setIsDeleteToolModelOpen(true);
                                       setSelectedToolForDelete(t);
                                     }} aria-label="Törlés">
                                       <IconTrash size={16} />
                                     </ActionIcon>
                                   </Tooltip>
                                   <DeleteToolModal
                                     isDeleteToolModelOpen={isDeleteToolModelOpen}
                                     setIsDeleteToolModelOpen={setIsDeleteToolModelOpen}
                                     fetchTools={fetchTools}
                                     selectedToolIdForDelete={selectedToolForDelete}
                                   />
                                 </Group>
                               </Table.Td>
                             </Table.Tr>
                           );
                         })}
                         {!loading && paged.length === 0 &&
                          <Table.Tr>
                            <Table.Td colSpan={6}>
                              <Text c="dimmed" size="sm">Nincs találat a megadott szűrőkre.</Text>
                            </Table.Td>
                          </Table.Tr>
                         }
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
                                 <Text size="sm" c="dimmed">Foglalások betöltése...</Text>
                               </Group>
                             ) : reservations.length > 0 ? (
                               <Table striped highlightOnHover withTableBorder withColumnBorders verticalSpacing="sm" horizontalSpacing="md">
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
                                       <Table.Td>{r.borrower ? `${r.borrower.firstName} ${r.borrower.lastName}` : "-"}</Table.Td>
                                       <Table.Td>{r.dateFrom}</Table.Td>
                                       <Table.Td>{r.dateTo}</Table.Td>
                                       <Table.Td><Badge color={statusBadgeColor(r.status?.name ?? "")}>{r.status?.name ?? "-"}</Badge></Table.Td>
                                       <Table.Td>
                                         <Group gap="md" wrap="nowrap">
                                           <Anchor
                                             component="button"
                                             onClick={() => openViewModal(r)}
                                             style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                                           >
                                             <IconEye size={14} />
                                             Megtekintés
                                           </Anchor>

                                           {}
                                           {r.status?.code === "FINISHED" ? (
                                             <Group align="center">
                                               <IconStar size={14} color={r.borrowerScore ? "#f5c518" : undefined} />
                                               <Anchor component="button" onClick={() => openRatingModal(r)} style={{ cursor: "pointer" }}>
                                                 Értékelés
                                               </Anchor>
                                             </Group>
                                           ) : (
                                             <Anchor
                                               component="button"
                                               onClick={() => openBorrowerModal(r.borrower)}
                                               style={{
                                                 cursor: "pointer",
                                                 display: "flex",
                                                 alignItems: "center",
                                                 gap: 4
                                               }}
                                             >
                                               <IconMessageStar size={14} />
                                               Bérlő értékelései
                                             </Anchor>
                                            )}
                                         </Group>
                                       </Table.Td>
                                     </Table.Tr>
                                   ))}
                                 </Table.Tbody>
                               </Table>
                             ) : (
                                   <Text c="dimmed" size="sm" py="md" ta="center">Nincs foglalás ehhez az eszközhöz.</Text>
                                 )}
                           </Paper>
                         </>
                       ) : (
                          <Text c="dimmed" size="sm" py="md" ta="center">
                            Jelenleg egy eszköz sincs kiválasztva. Válasszon ki egy eszközt a foglalásainak megtekintéséhez.
                          </Text>
                        )}
                     </Box>

                     <div className="flex items-center justify-end gap-3 border-t px-4 py-2">
                       <Pagination value={Math.min(page, totalPages)} onChange={setPage} total={totalPages} size="sm" />
                     </div>
                   </Paper>
                 </Box>

                 {}
                 <Modal
                   opened={openedRatingModal}
                   onClose={() => {
                     setOpenedRatingModal(false);
                     setCurrentReservation(null);
                   }}
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
                     <Button variant="outline" onClick={() => {
                       setOpenedRatingModal(false);
                       setCurrentReservation(null);
                     }}>
                       {isRatingReadonly ? "Bezár" : "Mégse"}
                     </Button>

                     {!isRatingReadonly && (
                       <Button onClick={saveRating} disabled={rating == null || rating === 0}>
                         Mentés
                       </Button>
                     )}
                   </Group>
                 </Modal>

                 {}
                 <Modal
                   opened={openedBorrowerModal}
                   onClose={() => {
                     setOpenedBorrowerModal(false);
                     setSelectedBorrower(null);
                     setReviewStats(null);
                   }}
                   title={`Bérlő értékelései`}
                   centered
                   size="lg"
                 >
                   {selectedBorrower ? (
                     <>
                       {loadingReviews ? (
                         <Group justify="center">
                           <Loader size="sm" />
                           <Text size="sm" c="dimmed">Értékelések betöltése...</Text>
                         </Group>
                       ) : reviewStats ? (
                         <Stack>
                           <Text fw={500}>{selectedBorrower.firstName} {selectedBorrower.lastName}</Text>

                           <Group align="center">
                             <Rating value={Number(reviewStats.averageRating) ?? 0} readOnly />
                             <Text size="sm" c="dimmed">({(reviewStats.averageRating ?? 0).toFixed(1)})</Text>
                           </Group>

                           <Text fw={500}>Bérlőként kapott értékelések</Text>

                           {reviewStats.asBorrower && reviewStats.asBorrower.length > 0 ? (
                             reviewStats.asBorrower.map((r, i) => (
                               <Paper key={`b-${i}`} withBorder p="sm" radius="md">
                                 <Group>
                                   <Rating value={r.score} readOnly size="sm" />
                                   {r.comment ? <Text size="sm">{r.comment}</Text> : null}
                                 </Group>
                               </Paper>
                             ))
                           ) : (
                              <Text size="sm" c="dimmed">Még nincs értékelés bérlőként.</Text>
                            )}

                           <Text fw={500}>Tulajdonosként kapott értékelések</Text>

                           {reviewStats.asOwner && reviewStats.asOwner.length > 0 ? (
                             reviewStats.asOwner.map((r, i) => (
                               <Paper key={`o-${i}`} withBorder p="sm" radius="md">
                                 <Group>
                                   <Rating value={r.score} readOnly size="sm" />
                                   {r.comment ? <Text size="sm">{r.comment}</Text> : null}
                                 </Group>
                               </Paper>
                             ))
                           ) : (
                              <Text size="sm" c="dimmed">Még nincs értékelés tulajdonosként.</Text>
                            )}
                         </Stack>
                       ) : (
                             <Text size="sm" c="dimmed">Nem található értékelés.</Text>
                           )}
                     </>
                   ) : null}
                 </Modal>

                 <Modal
                   opened={openedViewModal}
                   onClose={() => {
                     setOpenedViewModal(false);
                     setViewReservation(null);
                   }}
                   title="Foglalás megtekintése – Bérlő adatai"
                   centered
                 >
                   {viewReservation?.borrower ? (
                     <>
                       <Text mt="md" mb="xs" fw={600}>
                         Bérlő adatai
                       </Text>

                       <Paper withBorder p="sm" radius="md">
                         <Text mb="xs">
                           <strong>Név:</strong>{" "}
                           {viewReservation.borrower.firstName}{" "}
                           {viewReservation.borrower.lastName}
                         </Text>

                         <Text mb="xs">
                           <strong>Email:</strong> {viewReservation.borrower.email}
                         </Text>

                         {(viewReservation.borrower as any)?.phoneNumber && (
                           <Text mb="xs">
                             <strong>Telefonszám:</strong>{" "}
                             {(viewReservation.borrower as any).phoneNumber}
                           </Text>
                         )}

                         {(viewReservation.borrower as any)?.postalCode && (
                           <Text mb="xs">
                             <strong>Irányítószám:</strong>{" "}
                             {(viewReservation.borrower as any).postalCode}
                           </Text>
                         )}

                         {(viewReservation.borrower as any)?.city && (
                           <Text mb="xs">
                             <strong>Város:</strong>{" "}
                             {(viewReservation.borrower as any).city}
                           </Text>
                         )}

                         {(viewReservation.borrower as any)?.streetAddress && (
                           <Text mb="xs">
                             <strong>Cím:</strong>{" "}
                             {(viewReservation.borrower as any).streetAddress}
                           </Text>
                         )}
                       </Paper>

                       <Group mt="md" justify="end">
                         <Button variant="outline" onClick={() => setOpenedViewModal(false)}>
                           Bezárás
                         </Button>
                       </Group>
                     </>
                   ) : (
                      <Text c="dimmed">Nincs kiválasztott foglalás.</Text>
                    )}
                 </Modal>

               </Tabs.Panel>
             </Tabs>
           </Paper>
         )}
      </div>
    </div>
  );
}
