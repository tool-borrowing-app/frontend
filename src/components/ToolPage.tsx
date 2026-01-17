/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { createConversation, fetchConversationsWithParam } from "@/apiClient/modules/conversation";
import { getToolById } from "@/apiClient/modules/tool";
import { ConversationDto, StartConversationPayload } from "@/apiClient/types/conversation.types";
import { ToolDto } from "@/app/eszkozeim/page";
import { useProfile } from "@/contexts/ProfileContext";
import {
  Badge,
  Button,
  Group,
  Loader,
  Modal,
  Box,
  Paper,
  Rating,
  ScrollArea,
  Stack,
  Text,
  Title,
  Divider,
} from "@mantine/core";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUserReviewStatistics, ReviewStatisticsDto } from "@/apiClient/modules/users";

function formatHuf(value?: number | null) {
  if (value == null) return "—";
  return new Intl.NumberFormat("hu-HU").format(value) + " Ft/nap";
}

export function ToolPage({ id }: { id: string }) {
  const router = useRouter();

  const [tool, setTool] = useState<ToolDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const { user } = useProfile();
  const [allConversations, setAllConversations] = useState<ConversationDto[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStatisticsDto | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsModalOpened, setReviewsModalOpened] = useState(false);

  const fetchTool = async () => {
    setLoading(true);
    try {
      const result = await getToolById(id);
      setTool(result.data);
      setActiveImg(0);
      fetchConversationForItem();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tool?.user?.id) {
      setReviewsLoading(true);
      (async () => {
        try {
          const res = await getUserReviewStatistics(Number(tool.user?.id));
          if (res.status === 200 && res.data) {
            setReviewStats(res.data);
          }
        } catch (err) {
          console.error("Error loading review stats:", err);
        } finally {
          setReviewsLoading(false);
        }
      })();
    }
  }, [tool?.user?.id]);


  const startConversation = async () => {
    return await createConversation({ toolId: tool?.id, } as unknown as StartConversationPayload);
  }

  const fetchConversationForItem = async () => {
    const res = await fetchConversationsWithParam(id);
    setAllConversations(res.data);
  }

  useEffect(() => {
    fetchTool();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const images = tool?.imageUrls ?? [];

  const name = tool?.name ?? "Eszköz";

  const description = tool?.description ?? "Nincs megadott leírás.";

  const rentalPrice = tool?.rentalPrice;

  const categoryName = tool?.category?.name;

  const statusName = tool?.status?.name;

  const avgRating = 4;

  const canNavigateImages = images.length > 1;

  const prevImg = () => {
    if (!canNavigateImages) return;
    setActiveImg((p) => (p - 1 + images.length) % images.length);
  };

  const nextImg = () => {
    if (!canNavigateImages) return;
    setActiveImg((p) => (p + 1) % images.length);
  };

  if (loading && !tool) {
    return (
      <div className="w-full flex justify-center py-16">
        <Loader />
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="w-full flex flex-col items-center gap-3 py-16">
        <Text>Nem található az eszköz.</Text>
        <Button variant="light" onClick={() => router.back()}>
          Vissza
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full px-4 md:px-8 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <Paper withBorder radius="md" className="p-4">
            <div className="relative w-full aspect-square overflow-hidden rounded-md bg-gray-50">
              {images.length > 0 ? (
                <Image
                  src={images[Math.min(activeImg, images.length - 1)]}
                  alt={`${name} kép`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  Nincs kép
                </div>
              )}
              {canNavigateImages && (
                <>
                  <button
                    type="button"
                    onClick={prevImg}
                    disabled={!canNavigateImages}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 border border-gray-200 shadow-sm flex items-center justify-center disabled:opacity-40"
                    aria-label="Előző kép"
                  >
                    <span className="text-xl leading-none">‹</span>
                  </button>

                  <button
                    type="button"
                    onClick={nextImg}
                    disabled={!canNavigateImages}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 border border-gray-200 shadow-sm flex items-center justify-center disabled:opacity-40"
                    aria-label="Következő kép"
                  >
                    <span className="text-xl leading-none">›</span>
                  </button>
                </>
              )}
            </div>

            <div className="mt-3 flex justify-center gap-2">
              {Array.from({ length: Math.max(images.length, 1) }).map(
                (_, i) => {
                  const active = i === activeImg;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveImg(i)}
                      disabled={images.length <= 1}
                      className={[
                        "h-2.5 w-2.5 rounded-full border",
                        active
                          ? "bg-gray-900 border-gray-900"
                          : "bg-white border-gray-300",
                        images.length <= 1 ? "opacity-40" : "",
                      ].join(" ")}
                      aria-label={`Kép ${i + 1}`}
                    />
                  );
                },
              )}
            </div>
          </Paper>

          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <Title order={2} className="leading-tight">
                {name}
              </Title>

              <Text fw={700} className="whitespace-nowrap">
                {formatHuf(Number(rentalPrice))}
              </Text>
            </div>

            <Group gap="xs">
              {categoryName ? (
                <Badge variant="light">{categoryName}</Badge>
              ) : null}
              {statusName ? (
                <Badge variant="outline">{statusName}</Badge>
              ) : null}
            </Group>

            <Paper withBorder radius="md" className="p-4">
              <Text className="text-sm md:text-base">{description}</Text>
            </Paper>

            <div className="flex items-center gap-3">
              <Rating value={reviewStats?.averageRating ?? 0} readOnly />
              <Text size="sm" c="dimmed">
                {reviewsLoading
                 ? "Betöltés..."
                 : (reviewStats?.averageRating ?? 0).toFixed(1)}
              </Text>
              <Button
                size="xs"
                variant="light"
                onClick={() => setReviewsModalOpened(true)}
                disabled={reviewsLoading}
              >
                Értékelések
              </Button>
            </div>

            <div className="mt-2 flex gap-3">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="w-32"
              >
                Vissza
              </Button>
              {tool.user?.email !== user?.email &&
                <>
                  {allConversations.length === 0 ? (
                    <>
                      <Button
                        onClick={async () => {
                          try {
                            const res = await startConversation();
                            if (res && res.data && res.data.id) {
                              const newId = res.data.id;
                              router.push(`/uzenetek?id=${newId}`);
                            }
                          } catch (error) {
                            console.error("Failed to start conversation:", error);
                          }
                        }}
                      >
                        Üzenetezés kezdése
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={() => {
                          router.push(`/uzenetek?id=${allConversations[0].id}`);
                        }}
                      >
                        Üzenetezés
                      </Button>
                    </>
                  )}
                </>
              }
              {tool.user?.email !== user?.email && (
                <Button
                  onClick={() => router.push(`/foglalas/${id}`)}
                  className="w-32"
                >
                  Foglalás
                </Button>
              )}

              {}
              <Modal
                opened={reviewsModalOpened}
                onClose={() => setReviewsModalOpened(false)}
                title={`Értékelések — ${tool?.user?.firstName ?? ""} ${tool?.user?.lastName ?? ""}`}
                size="lg"
                centered
              >
                <Stack>
                  <Group align="center">
                    <Text fw={600}>Átlag:</Text>
                    <Group align="center">
                      <Rating readOnly value={reviewStats?.averageRating ?? 0} />
                      <Text>{(reviewStats?.averageRating ?? 0).toFixed(1)}</Text>
                    </Group>
                  </Group>

                  <Divider />

                  <ScrollArea style={{ height: 360 }} type="auto">
                    <Stack>
                      <div>
                        <Text fw={600}>Eladóként kapott értékelések</Text>
                        {reviewsLoading ? (
                          <Text c="dimmed">Betöltés...</Text>
                        ) : reviewStats?.asOwner && reviewStats.asOwner.length > 0 ? (
                          reviewStats.asOwner.map((r, idx) => (
                            <Box
                              key={`owner-${idx}`}
                              p="xs"
                              style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}
                            >
                              <Group align="flex-start">
                                <Group align="center">
                                  <Rating readOnly value={r.score ?? 0} />
                                  <Text size="sm">{r.score}</Text>
                                </Group>
                                <Text size="sm" c="dimmed">
                                  {r.comment ?? "-"}
                                </Text>
                              </Group>
                            </Box>
                          ))
                        ) : (
                              <Text c="dimmed" size="sm">
                                Nincs értékelés eladóként.
                              </Text>
                            )}
                      </div>

                      <div>
                        <Text fw={600}>Bérlőként kapott értékelések</Text>
                        {reviewsLoading ? (
                          <Text c="dimmed">Betöltés...</Text>
                        ) : reviewStats?.asBorrower && reviewStats.asBorrower.length > 0 ? (
                          reviewStats.asBorrower.map((r, idx) => (
                            <Box
                              key={`borrower-${idx}`}
                              p="xs"
                              style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}
                            >
                              <Group align="flex-start">
                                <Group align="center">
                                  <Rating readOnly value={r.score ?? 0} />
                                  <Text size="sm">{r.score}</Text>
                                </Group>
                                <Text size="sm" c="dimmed">
                                  {r.comment ?? "-"}
                                </Text>
                              </Group>
                            </Box>
                          ))
                        ) : (
                              <Text c="dimmed" size="sm">
                                Nincs értékelés bérlőként.
                              </Text>
                            )}
                      </div>
                    </Stack>
                  </ScrollArea>
                </Stack>
              </Modal>

            </div>
          </div>
        </div>
      </div>
    </div >
  );
}
