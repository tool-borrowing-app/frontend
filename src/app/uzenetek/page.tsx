"use client";

import { fetchConversations, getMessages, sendMessage } from "@/apiClient/modules/conversation";
import { ConversationDto, MessageDto, SendMessageDto } from "@/apiClient/types/conversation.types";
import { useProfile } from "@/contexts/ProfileContext";
import { Button, Card, Container, Group, Stack, Image, Text, Grid, TextInput, Box } from "@mantine/core";
import { useEffect, useState } from "react";

export default function Page() {

  const [allConversations, setAllConversations] = useState<ConversationDto[]>([]);
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>();
  const [messageValue, setMessageValue] = useState<string>("");
  const { user } = useProfile();

  useEffect(() => {
    getAllConversations();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setMessageValue("");
      if (selectedConversationId) {
        const res = await getMessages(selectedConversationId);
        setMessages(res.data);
      } else {
        setMessages([]);
      }
    };

    fetchData();
  }, [selectedConversationId]);

  const getAllConversations = async () => {
    const res = await fetchConversations();
    setAllConversations(res.data);
  }

  return (
    <>üzenetek page
      <Button onClick={() => { console.log("msg val ", messageValue) }}>
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
                    onClick={() => {
                      setSelectedConversationId(conversation.id)
                    }}
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
                    p="md"
                  >
                    {messages.map((msg, index) => {
                      // Determine if the message was sent by the logged-in user
                      const isMe = msg.sentBy.email === user?.email;

                      return (
                        <Group
                          key={index}
                          justify={isMe ? 'flex-end' : 'flex-start'}
                          gap="xs"
                        >
                          {!isMe && (
                            <Text size="xs" c="dimmed" mb={-5}>
                              {msg.sentBy.firstName}
                            </Text>
                          )}

                          <Box
                            style={{
                              maxWidth: '70%',
                              padding: '8px 12px',
                              borderRadius: '12px',
                              backgroundColor: isMe
                                ? 'var(--mantine-color-blue-filled)'
                                : 'var(--mantine-color-gray-2)',
                              color: isMe ? 'white' : 'black',
                              // Simple logic to make the bubble corners look "chat-like"
                              borderBottomRightRadius: isMe ? '4px' : '12px',
                              borderBottomLeftRadius: !isMe ? '4px' : '12px',
                            }}
                          >
                            <Text size="sm">{msg.text}</Text>

                            <Text
                              size="inset"
                              fz={10}
                              ta="right"
                              opacity={0.7}
                              mt={4}
                            >
                              {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                          </Box>
                        </Group>
                      );
                    })}
                  </Stack>

                  {/* 3. Input Area at the bottom */}
                  <Group mt="md" align="flex-end">
                    <TextInput
                      placeholder="Írj egy üzenetet..."
                      style={{ flex: 1 }}
                      radius="md"
                      value={messageValue}
                      onChange={(e) => setMessageValue(e.currentTarget.value)}
                    />
                    <Button
                      radius="md"
                      onClick={async () => {
                        const res = await sendMessage({ conversationId: selectedConversationId, text: messageValue } as unknown as SendMessageDto);
                        console.log("res:::: ", res);
                        if (res.status >= 200) {
                          setMessageValue("");
                          const res = await getMessages(selectedConversationId);
                          setMessages(res.data);
                        }
                      }}
                      disabled={messageValue === ""}
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