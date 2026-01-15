"use client";

import { getToolById } from "@/apiClient/modules/tool";
import { getUserReviewStatistics, ReviewStatisticsDto } from "@/apiClient/modules/users";
import type { ToolDto } from "@/app/eszkozeim/page";
import { useEffect, useMemo, useState } from "react";
import {
  Paper,
  Text,
  Group,
  Stack,
  Button,
  Checkbox,
  Divider,
  Image,
  Skeleton,
  Box,
  Modal,
  Rating,
  ScrollArea,
  Anchor,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconCalendar } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { createReservation } from "@/apiClient/modules/reservation";
import { useProfile } from "@/contexts/ProfileContext";
import { notifications } from "@mantine/notifications";
import { createCheckoutSession } from "@/apiClient/modules/payment";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function formatHuf(n: number) {
  return new Intl.NumberFormat("hu-HU").format(Math.max(0, Math.round(n)));
}

function calcDaysInclusive(from: Date | null, to: Date | null) {
  if (!from || !to) return 0;
  const start = new Date(from);
  const end = new Date(to);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  const diff = Math.floor((end.getTime() - start.getTime()) / MS_PER_DAY);
  return diff >= 0 ? diff + 1 : 0;
}

export default function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [slug, setSlug] = useState<string | null>(null);

  const [isLoading, setLoading] = useState(false);
  const [tool, setTool] = useState<ToolDto | undefined>(undefined);

  const [from, setFrom] = useState<Date | null>(null);
  const [to, setTo] = useState<Date | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // --- reviews modal state
  const [reviewsModalOpened, setReviewsModalOpened] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviews, setReviews] = useState<ReviewStatisticsDto | null>(null);

  const fetchTool = async () => {
    if (!slug) return;
    setLoading(true);
    try {
      const result = await getToolById(slug);
      setTool(result.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    params.then((resolved) => setSlug(resolved.slug));
  }, [params]);

  useEffect(() => {
    fetchTool();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const days = useMemo(() => calcDaysInclusive(from, to), [from, to]);

  const rentalPricePerDay = tool?.rentalPrice ?? 0;
  const depositPrice = tool?.depositPrice ?? 0;

  const rentalTotal = useMemo(
    () => rentalPricePerDay * days,
    [rentalPricePerDay, days],
  );

  const payableTotal = useMemo(
    () => depositPrice + rentalTotal,
    [depositPrice, rentalTotal],
  );

  const coverImage = tool?.imageUrls?.[0] ?? null;

  const router = useRouter();

  const { user } = useProfile();

  const handlePayClick = async () => {
    if (!slug || !from || !to || !user) return;

    const result = await createCheckoutSession({
      toolId: slug,
      dateFrom: from,
      dateTo: to,
      borrowerUserId: user.id,
    });
    if (result.status === 200 && result.data) {
      window.location.href = result.data;
    }
  };

  // --- fetch user reviews for the tool owner
  const openReviewsModal = async () => {
    if (!tool?.user?.id) {
      notifications.show({ title: "Hiba", message: "A tulajdonos adatai hiányoznak.", color: "red" });
      return;
    }

    // If already loaded, just open
    if (reviews && reviews.asOwner !== undefined) {
      setReviewsModalOpened(true);
      return;
    }

    setReviewsLoading(true);
    try {
      const res = await getUserReviewStatistics(Number(tool.user.id));
      if (res.status === 200 && res.data) {
        setReviews(res.data);
        setReviewsModalOpened(true);
      } else {
        notifications.show({ title: "Hiba", message: `Nem sikerült lekérni az értékeléseket (${res.status}).`, color: "red" });
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
      notifications.show({ title: "Hiba", message: "Hiba történt az értékelések lekérésekor.", color: "red" });
    } finally {
      setReviewsLoading(false);
    }
  };

  return (
    <Box p="md">
      <Group align="flex-start" wrap="nowrap" gap="xl">
        <Paper
          withBorder
          p="md"
          style={{
            flex: 1,
            minWidth: 420,
            borderRadius: 6,
          }}
        >
          <Stack gap="md">
            <Text fw={600}>Foglalás</Text>

            <Group align="flex-end" grow>
              <DateInput
                label="Időszak:*"
                placeholder="YYYY.MM.DD -tól"
                value={from}
                onChange={(date) => setFrom(date ? new Date(date) : null)}
                rightSection={<IconCalendar size={16} />}
                clearable
              />
              <DateInput
                label=" "
                placeholder="YYYY.MM.DD -ig"
                value={to}
                onChange={(date) => setTo(date ? new Date(date) : null)}
                rightSection={<IconCalendar size={16} />}
                minDate={from ?? undefined}
                clearable
              />
            </Group>

            <Stack gap="sm">
              <Stack gap={4}>
                <Text fz="sm">Kaució:</Text>
                <Text fw={600}>{`${formatHuf(depositPrice)} Ft`}</Text>
              </Stack>
              <Stack gap={4}>
                <Text fz="sm">Összeg:</Text>
                <Text fw={600}>{`${formatHuf(rentalTotal)} Ft`}</Text>
              </Stack>
              <Stack gap={4}>
                <Text fz="sm">Fizetendő:</Text>
                <Text fw={600}>{`${formatHuf(payableTotal)} Ft`}</Text>
              </Stack>
            </Stack>

            <Checkbox
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.currentTarget.checked)}
              label={
                <Text span>Általános Szerződési feltételeket elfogadom</Text>
              }
            />

            <Group justify="flex-start" gap="md">
              <Button onClick={() => router.back()} variant="outline">
                Mégse
              </Button>
              <Button
                disabled={!acceptTerms || days === 0 || isLoading}
                onClick={() => handlePayClick()}
              >
                Fizetés
              </Button>
            </Group>
          </Stack>
        </Paper>

        <Paper
          withBorder
          p="md"
          style={{
            width: 360,
            borderRadius: 6,
          }}
        >
          <Stack gap="sm">
            <Group justify="space-between" align="baseline">
              <Skeleton visible={isLoading} h={18} w="60%">
                <Text fw={600} fz="lg">
                  {tool?.name ?? "—"}
                </Text>
              </Skeleton>

              <Skeleton visible={isLoading} h={16} w={90}>
                <Text fz="sm" c="dimmed">
                  {formatHuf(rentalPricePerDay)} Ft/nap
                </Text>
              </Skeleton>
            </Group>

            <Group align="center">
              <Group>
                <Text fz="sm" c="dimmed">Eladó értékelés:</Text>
                <Group align="center">
                  <Rating readOnly value={reviews?.averageRating ?? 0} />
                  <Text fz="sm" c="dimmed">{(reviews?.averageRating ?? 0).toFixed(1)}</Text>
                </Group>
              </Group>

              <Button size="xs" onClick={openReviewsModal} disabled={!tool?.user?.id || reviewsLoading}>
                Értékelések
              </Button>
            </Group>

            <Divider />

            <Paper withBorder p={6} radius="sm">
              {isLoading ? (
                <Skeleton h={260} />
              ) : coverImage ? (
                <Image
                  src={coverImage}
                  alt={tool?.name ?? "tool"}
                  height={260}
                  fit="cover"
                  radius="sm"
                />
              ) : (
                    <Box
                      style={{
                        height: 260,
                        display: "grid",
                        placeItems: "center",
                        border: "1px dashed var(--mantine-color-gray-4)",
                        borderRadius: 8,
                      }}
                    >
                      <Text c="dimmed" fz="sm">
                        Nincs kép
                      </Text>
                    </Box>
                  )}
            </Paper>

            <Text fz="sm" c="dimmed" lineClamp={3}>
              {tool?.description ?? ""}
            </Text>
          </Stack>
        </Paper>
      </Group>

      {/* --- Reviews modal --- */}
      <Modal
        opened={reviewsModalOpened}
        onClose={() => setReviewsModalOpened(false)}
        title={`Értékelések — ${tool?.user?.firstName ?? ""} ${tool?.user?.lastName ?? ""}`}
        size="lg"
        centered
      >
        <Stack >
          <Group  align="center">
            <Text fw={600}>Átlag:</Text>
            <Group  align="center">
              <Rating readOnly value={reviews?.averageRating ?? 0} />
              <Text>{(reviews?.averageRating ?? 0).toFixed(1)}</Text>
            </Group>
          </Group>

          <Divider />

          <ScrollArea style={{ height: 360 }} type="auto">
            <Stack>
              <div>
                <Text fw={600}>Eladóként kapott értékelések</Text>
                {reviewsLoading ? (
                  <Text c="dimmed">Betöltés...</Text>
                ) : reviews?.asOwner && reviews.asOwner.length > 0 ? (
                  reviews.asOwner.map((r, idx) => (
                    <Box key={`owner-${idx}`} p="xs" style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}>
                      <Group  align="flex-start">
                        <Group align="center">
                          <Rating readOnly value={r.score ?? 0} />
                          <Text size="sm">{r.score}</Text>
                        </Group>
                        <Text size="sm" c="dimmed">{r.comment ?? "-"}</Text>
                      </Group>
                    </Box>
                  ))
                ) : (
                      <Text c="dimmed" size="sm">Nincs értékelés eladóként.</Text>
                    )}
              </div>

              <div>
                <Text fw={600}>Bérlőként kapott értékelések</Text>
                {reviewsLoading ? (
                  <Text c="dimmed">Betöltés...</Text>
                ) : reviews?.asBorrower && reviews.asBorrower.length > 0 ? (
                  reviews.asBorrower.map((r, idx) => (
                    <Box key={`borrower-${idx}`} p="xs" style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}>
                      <Group align="flex-start">
                        <Group align="center">
                          <Rating readOnly value={r.score ?? 0} />
                          <Text size="sm">{r.score}</Text>
                        </Group>
                        <Text size="sm" c="dimmed">{r.comment ?? "-"}</Text>
                      </Group>
                    </Box>
                  ))
                ) : (
                      <Text c="dimmed" size="sm">Nincs értékelés bérlőként.</Text>
                    )}
              </div>
            </Stack>
          </ScrollArea>
        </Stack>
      </Modal>
    </Box>
  );
}
