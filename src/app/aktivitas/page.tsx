"use client";

import { acknowledgeNotification, fetchNotifications } from "@/apiClient/modules/notifications";
import { NotificationDto } from "@/apiClient/types/notification.types";
import { Container, Stack, Card, Text, Group, Badge, Box, Center, Loader } from "@mantine/core";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Page() {
  const [allNotifications, setAllNotifications] = useState<NotificationDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllNotifications();
  }, []);

  const getAllNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetchNotifications();
      // Sort by date: Newest first
      const sorted = res.data.sort((a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setAllNotifications(sorted);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notifGroup: any) => {
    // If already read, just let the Link navigate
    if (notifGroup.acknowledged) return;

    try {
      // Acknowledge all IDs in this specific group simultaneously
      await Promise.all(
        notifGroup.allIds.map((id: number) => acknowledgeNotification(id))
      );

      // Refresh list to update UI
      await getAllNotifications();
    } catch (error) {
      console.error("Failed to acknowledge group:", error);
    }
  };

  // Logic: Group by (Message + Reference + Acknowledged Status)
  const processedNotifications = allNotifications.reduce((acc: any[], current: any) => {
    const last = acc[acc.length - 1];

    const matchesLastGroup =
      last &&
      last.message === current.message &&
      last.reference === current.reference &&
      last.acknowledged === current.acknowledged;

    if (matchesLastGroup) {
      last.count += 1;
      // Add this ID to the group's collection
      last.allIds.push(current.id);
      // Ensure group shows the most recent timestamp
      if (new Date(current.createdAt) > new Date(last.createdAt)) {
        last.createdAt = current.createdAt;
      }
    } else {
      // Start a new group and initialize the ID array
      acc.push({ ...current, count: 1, allIds: [current.id] });
    }
    return acc;
  }, []);

  return (
    <Container size="sm" py="xl">
      <Text size="xl" fw={700} mb="lg">
        Aktivitás
      </Text>

      {loading ? (
        <Center mt="xl">
          <Loader size="md" />
        </Center>
      ) : allNotifications.length === 0 ? (
        <Center mt="xl">
          <Stack align="center" gap="xs">
            <Text c="dimmed" fw={500}>Nincsenek értesítések</Text>
            <Text size="xs" c="dimmed">Itt fognak megjelenni a legfontosabb események.</Text>
          </Stack>
        </Center>
      ) : (
        <Stack gap="sm">
          {processedNotifications.map((notif, index) => {
            const isConversation = notif.type === "CONVERSATION";
            const isUnread = !notif.acknowledged;
            const href = isConversation ? `/uzenetek?id=${notif.reference}` : "#";

            return (
              <Card
                key={`${notif.reference}-${index}-${notif.acknowledged}`}
                withBorder
                padding="md"
                radius="md"
                component={Link}
                href={href}
                onClick={() => handleNotificationClick(notif)}
                // Dynamic styling for unread vs read
                bg={isUnread ? "var(--mantine-color-blue-light)" : "white"}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  transition: "all 0.2s ease",
                  borderLeft: isUnread
                    ? "4px solid var(--mantine-color-blue-filled)"
                    : "4px solid transparent",
                }}
              >
                <Group justify="space-between" wrap="nowrap">
                  <Group gap="xs" style={{ flex: 1 }}>
                    {notif.count > 1 && (
                      <Badge
                        variant="filled"
                        color={isUnread ? "blue" : "gray"}
                        size="sm"
                      >
                        ({notif.count})
                      </Badge>
                    )}

                    <Box>
                      <Text size="sm" fw={isUnread ? 700 : 400}>
                        {notif.message}
                      </Text>
                    </Box>
                  </Group>

                  <Text size="xs" c="dimmed" style={{ whiteSpace: "nowrap" }}>
                    {new Date(notif.createdAt).toLocaleString("hu-HU", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </Group>
              </Card>
            );
          })}
        </Stack>
      )}
    </Container>
  );
}