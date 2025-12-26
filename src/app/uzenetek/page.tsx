"use client";

import { fetchConversations } from "@/apiClient/modules/conversation";
import { ConversationDto } from "@/apiClient/types/conversation.types";
import { useProfile } from "@/contexts/ProfileContext";
import { Button, Card, Container, Group, Stack, Image, Text, Grid, TextInput, Box } from "@mantine/core";
import { useEffect, useState } from "react";

export default function Page() {

  const [allConversations, setAllConversations] = useState<ConversationDto[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>();
  const { user } = useProfile();

  useEffect(() => {
    getAllConversations();
  }, []);

  const getAllConversations = async () => {
    const res = await fetchConversations();
    setAllConversations(res.data);
  }

  return (
    <>üzenetek page
      <Button onClick={() => { console.log("selected conversation ", selectedConversationId) }}>
        Debug
      </Button>

      <Container size="xl" py="md">
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="sm">
              {allConversations.map((conversation) => {
                const tool = conversation.tool;
                const isSelected = selectedConversationId === conversation.id;

                return (
                  <Card
                    key={conversation.id}
                    withBorder
                    radius="md"
                    onClick={() => setSelectedConversationId(conversation.id)}
                    bg={isSelected ? "var(--mantine-color-blue-light)" : "white"}
                    style={{ cursor: "pointer", transition: "0.2s" }}
                  >
                    <Group wrap="nowrap">
                      <Image src={tool.imageUrls?.[0]} w={50} h={50} radius="md" />
                      <Stack gap={0} style={{ overflow: "hidden" }}>
                        <Text fw={500} truncate>
                          {user?.email === tool.user?.email
                            ? `${conversation.renter.firstName} ${conversation.renter.lastName}`
                            : `${conversation.lender.firstName} ${conversation.lender.lastName}`}
                        </Text>
                        <Text size="xs" c="dimmed" truncate>{tool.name}</Text>
                      </Stack>
                    </Group>
                  </Card>
                );
              })}
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 8 }}>
            <Card
              withBorder
              radius="md"
              p="md"
              // Use flexbox to keep input at bottom
              style={{ height: '70vh', display: 'flex', flexDirection: 'column' }}
            >
              {selectedConversationId ? (
                <>
                  {/* 1. Header (Optional) */}
                  <Box mb="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-2)', paddingBottom: '10px' }}>
                    <Text fw={700}>Beszélgetés</Text>
                  </Box>

                  {/* 2. Scrollable Message Area */}
                  <Stack
                    style={{ flex: 1, overflowY: 'auto' }}
                    gap="xs"
                    pr="sm" // space for scrollbar
                  >
                    {/* Messages would be mapped here */}
                    <Text size="sm" c="dimmed" ta="center" my="xl">
                      Nincsenek még üzenetek. Kezdj el beszélgetni!
                    </Text>
                  </Stack>

                  {/* 3. Input Area at the bottom */}
                  <Group mt="md" align="flex-end">
                    <TextInput
                      placeholder="Írj egy üzenetet..."
                      style={{ flex: 1 }}
                      radius="md"
                    // value={messageValue} 
                    // onChange={(e) => setMessageValue(e.currentTarget.value)}
                    />
                    <Button
                      radius="md"
                      onClick={() => console.log("Sending message...")}
                    >
                      Küldés
                    </Button>
                  </Group>
                </>
              ) : (
                <Stack align="center" justify="center" style={{ flex: 1 }}>
                  <Text c="dimmed">Válassz ki egy beszélgetést az üzenetek megtekintéséhez</Text>
                </Stack>
              )}
            </Card>
          </Grid.Col>
        </Grid>
      </Container>
    </>

  );
}