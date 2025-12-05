"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Paper,
  Title,
  Text,
  TextInput,
  NumberInput,
  Textarea,
  Select,
  Button,
  Group,
  Divider,
  ActionIcon,
  Badge,
} from "@mantine/core";
import {
  IconChevronLeft,
  IconChevronRight,
  IconTrash,
  IconUpload,
} from "@tabler/icons-react";

export default function AddToolPage() {
  const router = useRouter();

  const handleSubmit = () => {
    // TODO call the backend api through uploadTool function
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-5xl mx-auto px-4 py-10">
        <Paper shadow="md" radius="md" p="xl" className="bg-white">
          <Group justify="space-between" mb="lg" className="items-center">
            <div className="flex items-center gap-2">
              <ActionIcon
                variant="subtle"
                size="lg"
                onClick={() => router.push("/eszkozeim")}
                aria-label="Vissza"
              >
                <IconChevronLeft />
              </ActionIcon>

              <Title order={2}>Új eszköz feltöltése</Title>
            </div>
          </Group>

          <Divider mb="lg" />

          <div className="grid gap-y-4 gap-x-6 md:grid-cols-[170px,1fr]">
            <Text className="md:self-center font-medium">Eszköz neve:</Text>
            <TextInput placeholder="Eszköz neve" />

            <Text className="md:self-center font-medium">
              Eszköz kategóriája:
            </Text>
            <Select
              data={["Porszívó", "Fúrógép", "Kerti eszköz", "Egyéb"]}
              placeholder="Válassz kategóriát"
            />

            <Text className="md:self-center font-medium">Státusza:</Text>
            <Select
              data={["ELÉRHETŐ", "FOGLALT", "INAKTÍV"]}
              placeholder="Válaszd ki a státuszt"
              defaultValue="ELÉRHETŐ"
            />

            <Text className="md:self-center font-medium">Ára (Ft/nap):</Text>
            <NumberInput
              placeholder="1 000"
              thousandSeparator=" "
              min={0}
              step={500}
            />

            <Text className="md:self-center font-medium">Kaució (Ft):</Text>
            <NumberInput
              placeholder="20 000"
              thousandSeparator=" "
              min={0}
              step={1000}
            />

            <Text className="font-medium mt-1">Leírás:</Text>
            <Textarea
              minRows={4}
              placeholder="Rövid leírás az eszközről, állapotáról, tartozékokról…"
            />

            <Text className="font-medium mt-1">Képek:</Text>
            <div className="flex flex-col gap-4">
              <Paper
                withBorder
                radius="md"
                className="flex flex-col items-center justify-between p-4 h-72"
              >
                <div className="w-full flex-1 flex items-center justify-between">
                  <ActionIcon variant="subtle" size="lg" aria-label="Előző kép">
                    <IconChevronLeft />
                  </ActionIcon>

                  <div className="border border-dashed rounded-md w-48 h-60 flex items-center justify-center text-sm text-gray-500">
                    kép1 előnézet
                  </div>

                  <ActionIcon
                    variant="subtle"
                    size="lg"
                    aria-label="Következő kép"
                  >
                    <IconChevronRight />
                  </ActionIcon>
                </div>

                <Group justify="center" gap={6} mt="sm">
                  <span className="w-2 h-2 rounded-full bg-gray-900" />
                  <span className="w-2 h-2 rounded-full bg-gray-300" />
                  <span className="w-2 h-2 rounded-full bg-gray-300" />
                  <span className="w-2 h-2 rounded-full bg-gray-300" />
                  <span className="w-2 h-2 rounded-full bg-gray-300" />
                </Group>

                <ActionIcon
                  color="red"
                  variant="subtle"
                  mt="sm"
                  aria-label="Kép törlése"
                >
                  <IconTrash />
                </ActionIcon>
              </Paper>

              <Group justify="flex-start">
                <Button
                  variant="outline"
                  leftSection={<IconUpload size={16} />}
                  onClick={() => handleSubmit()}
                >
                  Új kép feltöltése
                </Button>
              </Group>
            </div>
          </div>

          <Group justify="flex-end" mt="xl">
            <Button variant="outline" color="gray">
              Mégse
            </Button>
            <Button>Mentés</Button>
          </Group>
        </Paper>
      </main>
    </div>
  );
}
