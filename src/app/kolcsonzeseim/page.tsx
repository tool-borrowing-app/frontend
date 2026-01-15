/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { getUserReservations, submitReservationReview } from "@/apiClient/modules/reservation";
import { ReservationDto } from "@/apiClient/types/reservation.types";
import { useEffect, useMemo, useState } from "react";
import {
  Anchor,
  Badge,
  Button,
  Group,
  Loader,
  Modal,
  Pagination,
  Paper,
  Rating,
  Select,
  Table,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { IconSearch, IconStarFilled } from "@tabler/icons-react";

const PAGE_SIZE = 10;

type SortKey = "name" | "tool" | "from" | "to" | "status" | "price";

function formatDateHu(value: any) {
  if (!value) return "-";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}

function formatHuf(value: any) {
  if (value === null || value === undefined) return "-";
  const n = typeof value === "string" ? Number(value) : Number(value);
  if (Number.isNaN(n)) return "-";
  return n.toLocaleString("hu-HU");
}

function statusBadge(code?: string, name?: string) {
  const c = (code || "").toUpperCase();
  if (c.includes("ACTIVE") || c.includes("AKT")) {
    return (
      <Badge variant="filled" color="green">
        {name ?? "AKTÍV"}
      </Badge>
    );
  }
  if (c.includes("CLOSED") || c.includes("LEZ")) {
    return (
      <Badge variant="filled" color="gray">
        {name ?? "LEZÁRULT"}
      </Badge>
    );
  }
  if (c.includes("PENDING") || c.includes("FOLY")) {
    return (
      <Badge variant="filled" color="yellow">
        {name ?? "FOLYAMATBAN"}
      </Badge>
    );
  }
  return <Badge variant="filled">{name ?? code ?? "-"}</Badge>;
}

export default function Page() {
  const [isLoading, setLoading] = useState(false);
  const [reservations, setReservations] = useState<ReservationDto[]>([]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const [sortKey, setSortKey] = useState<SortKey>("from");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [page, setPage] = useState(1);

  // review modal state (we review the OWNER)
  const [openedReviewModal, setOpenedReviewModal] = useState(false);
  const [currentReservation, setCurrentReservation] = useState<ReservationDto | null>(null);
  const [reviewRating, setReviewRating] = useState<number | null>(null);
  const [reviewComment, setReviewComment] = useState<string>("");
  const [isReviewReadonly, setIsReviewReadonly] = useState(false);
  const [isSavingReview, setIsSavingReview] = useState(false);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const result = await getUserReservations();
      const data: ReservationDto[] = result?.data ?? [];
      setReservations(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const statusOptions = useMemo(() => {
    const map = new Map<string, string>();
    reservations.forEach((r) => {
      const code = r?.status?.code ?? "";
      const name = r?.status?.name ?? code;
      if (code) map.set(code, name);
    });

    return [
      { value: "ALL", label: "Összes" },
      ...Array.from(map.entries()).map(([value, label]) => ({ value, label })),
    ];
  }, [reservations]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    const matchStatus = (r: ReservationDto) => {
      if (!status || status === "ALL") return true;
      return (r.status?.code ?? "") === status;
    };

    const matchSearch = (r: ReservationDto) => {
      if (!q) return true;

      const toolName = (r.toolDto as any)?.name ?? "";
      const otherName =
        (r as any)?.otherUserName ??
        (r as any)?.ownerName ??
        (r as any)?.borrowerName ??
        (r.toolDto as any)?.ownerName ??
        "";

      const hay =
        `${toolName} ${otherName} ${r.status?.name ?? ""}`.toLowerCase();
      return hay.includes(q);
    };

    return reservations.filter((r) => matchStatus(r) && matchSearch(r));
  }, [reservations, search, status]);

  const sorted = useMemo(() => {
    const dir = sortDir === "asc" ? 1 : -1;

    const getOtherName = (r: ReservationDto) =>
      ((r as any)?.otherUserName ??
       (r as any)?.ownerName ??
       (r as any)?.borrowerName ??
       (r.toolDto as any)?.ownerName ??
       "") as string;

    const getToolName = (r: ReservationDto) =>
      ((r.toolDto as any)?.name ?? "") as string;

    const getFrom = (r: ReservationDto) => {
      const d =
        r.dateFrom instanceof Date ? r.dateFrom : new Date(r.dateFrom as any);
      return Number.isNaN(d.getTime()) ? 0 : d.getTime();
    };

    const getTo = (r: ReservationDto) => {
      const d = r.dateTo instanceof Date ? r.dateTo : new Date(r.dateTo as any);
      return Number.isNaN(d.getTime()) ? 0 : d.getTime();
    };

    const getStatus = (r: ReservationDto) =>
      (r.status?.name ?? r.status?.code ?? "") as string;

    const getPrice = (r: ReservationDto) => {
      const p =
        (r.toolDto as any)?.rentalPrice ?? (r.toolDto as any)?.price ?? 0;
      const n = typeof p === "string" ? Number(p) : Number(p);
      return Number.isNaN(n) ? 0 : n;
    };

    const copy = [...filtered];
    copy.sort((a, b) => {
      let av: any;
      let bv: any;

      switch (sortKey) {
        case "name":
          av = getOtherName(a).toLowerCase();
          bv = getOtherName(b).toLowerCase();
          break;
        case "tool":
          av = getToolName(a).toLowerCase();
          bv = getToolName(b).toLowerCase();
          break;
        case "from":
          av = getFrom(a);
          bv = getFrom(b);
          break;
        case "to":
          av = getTo(a);
          bv = getTo(b);
          break;
        case "status":
          av = getStatus(a).toLowerCase();
          bv = getStatus(b).toLowerCase();
          break;
        case "price":
          av = getPrice(a);
          bv = getPrice(b);
          break;
        default:
          av = 0;
          bv = 0;
      }

      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });

    return copy;
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paged = useMemo(() => {
    const p = Math.min(Math.max(1, page), totalPages);
    const start = (p - 1) * PAGE_SIZE;
    return sorted.slice(start, start + PAGE_SIZE);
  }, [sorted, page, totalPages]);

  useEffect(() => {
    setPage(1);
  }, [search, status, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(
        key === "from" || key === "to" || key === "price" ? "desc" : "asc",
      );
    }
  };

  const SortLabel = ({
    label,
    k,
    className,
  }: {
    label: string;
    k: SortKey;
    className?: string;
  }) => (
    <button
      type="button"
      onClick={() => toggleSort(k)}
      className={`flex items-center gap-2 select-none ${className ?? ""}`}
    >
      <span className="font-semibold">{label}</span>
      <span className="text-xs opacity-70">
        {sortKey !== k ? "↕" : sortDir === "asc" ? "▲" : "▼"}
      </span>
    </button>
  );

  /* --------------- Review modal helpers (owner review) --------------- */
  const openReviewModal = (r: ReservationDto) => {
    setCurrentReservation(r);
    setReviewRating(r.ownerScore ?? null);
    setReviewComment(r.ownerComment ?? "");
    setIsReviewReadonly(r.ownerScore != null); // readonly ha már értékeltük
    setOpenedReviewModal(true);
  };


  const saveReview = async () => {
    if (!currentReservation) return;
    if (isReviewReadonly) return;

    setIsSavingReview(true);
    try {
      // send ownerScore / ownerComment to backend
      const updated = await submitReservationReview(currentReservation.id, {
        ownerScore: reviewRating,
        ownerComment: reviewComment ?? null,
      });

      const updatedReservation: ReservationDto = (updated && (updated.data ?? updated)) as ReservationDto;

      setReservations((prev) =>
        prev.map((x) => (x.id === updatedReservation.id ? updatedReservation : x))
      );

      setOpenedReviewModal(false);
      setCurrentReservation(null);
    } catch (err) {
      console.error("Hiba a review mentésekor:", err);
    } finally {
      setIsSavingReview(false);
    }
  };

  return (
    <div className="p-6">
      <Paper withBorder radius="md" className="p-5">
        <div className="flex items-center justify-between gap-4">
          <Text fw={600}>Kölcsönzéseim:</Text>
          {isLoading && (
            <Group gap="xs">
              <Loader size="sm" />
              <Text size="sm" c="dimmed">
                Betöltés...
              </Text>
            </Group>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <TextInput
            leftSection={<IconSearch size={16} />}
            placeholder="Keresés..."
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            className="md:max-w-sm"
          />

          <Group gap="sm" className="md:justify-end">
            <Select
              data={statusOptions}
              value={status ?? "ALL"}
              onChange={(v) => setStatus(v)}
              placeholder="Státusz szűrő"
              className="min-w-[220px]"
            />
          </Group>
        </div>

        <div className="mt-4 overflow-auto">
          <Table
            striped
            highlightOnHover
            withTableBorder
            withColumnBorders
            className="min-w-[980px]"
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th>
                  <SortLabel label="Tulajdonos Neve" k="name" />
                </Table.Th>
                <Table.Th>
                  <SortLabel label="Eszköz neve" k="tool" />
                </Table.Th>
                <Table.Th>
                  <SortLabel label="Kölcsönzés kezdete" k="from" />
                </Table.Th>
                <Table.Th>
                  <SortLabel label="Kölcsönzés vége" k="to" />
                </Table.Th>
                <Table.Th>
                  <SortLabel label="Státusz" k="status" />
                </Table.Th>
                <Table.Th>
                  <SortLabel label="Ár" k="price" />
                </Table.Th>
                <Table.Th>Műveletek</Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {paged.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={7}>
                    <Text c="dimmed" size="sm">
                      Nincs megjeleníthető találat.
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                 paged.map((r) => {
                   const toolName = ((r.toolDto as any)?.name ?? "-") as string;

                   // Owner name - try multiple possible fields
                   const toolOwnerName =
                     ((r.toolDto as any)?.user?.firstName && (r.toolDto as any)?.user?.lastName)
                     ? `${(r.toolDto as any).user.firstName} ${(r.toolDto as any).user.lastName}`
                     : (r as any)?.ownerName ?? (r as any)?.otherUserName ?? "-";

                   const price =
                     (r.toolDto as any)?.rentalPrice ?? (r.toolDto as any)?.price ?? null;

                   const statusCode = (r.status?.code ?? "").toUpperCase();
                   const isClosed =
                     statusCode.includes("LEZ") || statusCode.includes("CLOSED") ||
                     statusCode.includes("FINISHED");

                   // <-- use ownerScore to decide if already reviewed (we review owner)
                   const alreadyReviewed = r.ownerScore != null;

                   return (
                     <Table.Tr key={r.id}>
                       <Table.Td className="font-medium">
                         {toolOwnerName}
                       </Table.Td>
                       <Table.Td>{toolName}</Table.Td>
                       <Table.Td>{formatDateHu(r.dateFrom)}</Table.Td>
                       <Table.Td>{formatDateHu(r.dateTo)}</Table.Td>
                       <Table.Td>
                         {statusBadge(r.status?.code, r.status?.name)}
                       </Table.Td>
                       <Table.Td>{formatHuf(price)}</Table.Td>
                       <Table.Td>
                         <Group gap="md">
                           <Anchor>Megtekintés</Anchor>

                           {isClosed && (
                             <Group gap={6} align="center">
                               <IconStarFilled
                                 size={14}
                                 style={{ color: alreadyReviewed ? "#f5c518" : undefined }}
                               />
                               <Anchor
                                 component="button"
                                 onClick={() => openReviewModal(r)}
                                 style={{ cursor: "pointer" }}
                               >
                                 Értékelés
                               </Anchor>
                             </Group>
                           )}
                         </Group>
                       </Table.Td>
                     </Table.Tr>
                   );
                 })
               )}
            </Table.Tbody>
          </Table>
        </div>

        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Text size="sm" c="dimmed">
            {sorted.length} találat
          </Text>

          <Pagination
            value={Math.min(page, totalPages)}
            onChange={setPage}
            total={totalPages}
            withEdges
          />
        </div>
      </Paper>

      {/* Review Modal (owner review) */}
      <Modal
        opened={openedReviewModal}
        onClose={() => setOpenedReviewModal(false)}
        title={`Értékelés: ${currentReservation?.toolDto?.name ?? ""}`}
        centered
      >
        <Text mb="xs">
          Tulajdonos:{" "}
          {currentReservation?.toolDto?.user
           ? `${(currentReservation.toolDto as any).user.firstName} ${(currentReservation.toolDto as any).user.lastName}`
           : (currentReservation as any)?.ownerName ?? "-"}
        </Text>

        {isReviewReadonly && (
          <Text size="sm" c="dimmed" mb="sm">
            Ezt a foglalást már értékelte. Az értékelés nem módosítható.
          </Text>
        )}

        <Text mb="xs">Értékelés:</Text>
        <Rating
          value={reviewRating ?? 0}
          onChange={(val) => setReviewRating(val)}
          size="lg"
          readOnly={isReviewReadonly}
        />

        <Text mb="xs" mt="sm">
          Leírás:
        </Text>
        <Textarea
          value={reviewComment ?? ""}
          onChange={(e) => setReviewComment(e.currentTarget.value)}
          placeholder="Ide írhatod a megjegyzést"
          minRows={3}
          readOnly={isReviewReadonly}
        />

        <Group mt="md">
          <Button variant="outline" onClick={() => setOpenedReviewModal(false)}>
            {isReviewReadonly ? "Bezár" : "Mégse"}
          </Button>

          {!isReviewReadonly && (
            <Button onClick={saveReview} loading={isSavingReview}>
              Mentés
            </Button>
          )}
        </Group>
      </Modal>
    </div>
  );
}
