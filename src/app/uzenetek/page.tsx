"use client";

import { fetchConversations } from "@/apiClient/modules/conversation";
import { ConversationDto } from "@/apiClient/types/conversation.types";
import { Button, Card, Container, Group, Stack, Image, Text } from "@mantine/core";
import { useEffect, useState } from "react";

export default function Page() {

  const [allConversations, setAllConversations] = useState<ConversationDto[]>([]);

  useEffect(() => {
    getAllConversations();
  }, []);

  const getAllConversations = async() => {
    const res = await fetchConversations();
    setAllConversations(res.data);
  }

  return (
    <>üzenetek page
    <Button onClick={() => {console.log("all conversations: ", allConversations)}}>
      Debug
    </Button>
      
      <Container size={`sm`}>
        <Stack gap={`sm`}>
          {allConversations.map((conversation) => {
            const tool = conversation.tool;
            const owner = tool.user;
            const imageUrl = tool.imageUrls?.[0];

            return (
              <Card key={conversation.id} withBorder radius="md">
                <Group align="center" wrap="nowrap">
                  <Image
                     src={imageUrl}
                      alt={tool.name}
                      w={80}
                      h={80}
                      radius="md"
                  ></Image>
                  <Stack gap={2}>
                  <Text fw={500}>{tool.user?.firstName} {tool.user?.lastName}</Text>
                  <Text size="sm" c="dimmed">
                    {tool.name}
                  </Text>
                </Stack>
                </Group>
              </Card>
            );
          })}
        </Stack>
      </Container>
    </>
  
  );
}