"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
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
} from "@mantine/core";
import {
  IconChevronLeft,
  IconChevronRight,
  IconTrash,
  IconUpload,
} from "@tabler/icons-react";
import { uploadTool } from "../../../apiClient/modules/tool";
import type { UploadToolPayload } from "../../../apiClient/types/tool.types";

const CATEGORY_MAPPING: Record<string, string> = {
  DRILL: "Fúrógép",
  SAW: "Fűrész",
  GRINDER: "Csiszoló",
  HAMMER: "Kalapács",
  SCREWDRIVER_SET: "Csavarhúzó készlet",
  WRENCH_SET: "Villáskulcs készlet",
  SANDER: "Csiszológép",
  LADDER: "Létra",
  PRESSURE_WASHER: "Magasnyomású mosó",
};

const STATUS_MAPPING: Record<string, string> = {
  ACTIVE: "Aktív",
  INACTIVE: "Inaktív",
};

const CATEGORY_OPTIONS = Object.entries(CATEGORY_MAPPING).map(
  ([code, name]) => ({
    value: code,
    label: name,
  }),
);

const STATUS_OPTIONS = Object.entries(STATUS_MAPPING).map(([code, name]) => ({
  value: code,
  label: name,
}));

export default function AddToolPage() {
  const router = useRouter();

  type PreviewImage = { id: string; src: string; file: File };
  const [images, setImages] = useState<PreviewImage[]>([]);
  const imagesRef = useRef<PreviewImage[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [price, setPrice] = useState<number | undefined>(undefined);
  const [deposit, setDeposit] = useState<number | undefined>(undefined);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return;
    const files = Array.from(fileList).filter((f) =>
      f.type.startsWith("image/"),
    );
    if (files.length === 0) return;

    const newImages = files.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      src: URL.createObjectURL(file),
      file,
    }));

    setImages((prev) => [...prev, ...newImages]);
  }, []);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);

    if (inputRef.current) inputRef.current.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const prevImage = () => {
    setActiveIndex((i) =>
      images.length ? (i - 1 + images.length) % images.length : 0,
    );
  };

  const nextImage = useCallback(() => {
    setActiveIndex((i) => (images.length ? (i + 1) % images.length : 0));
  }, [images.length]);

  const removeImage = (id: string) => {
    setImages((prev) => {
      const toRemove = prev.find((p) => p.id === id);
      const newArr = prev.filter((p) => p.id !== id);
      if (toRemove) URL.revokeObjectURL(toRemove.src);
      setActiveIndex((curr) =>
        newArr.length === 0 ? 0 : Math.min(curr, newArr.length - 1),
      );
      return newArr;
    });
  };

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    return () => {
      imagesRef.current.forEach((img) => URL.revokeObjectURL(img.src));
    };
  }, []);

  const fileToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result as string);
      fr.onerror = reject;
      fr.readAsDataURL(file);
    });

  const handleUpload = async () => {
    if (
      !title ||
      !category ||
      !status ||
      price == null ||
      deposit == null ||
      !description
    ) {
      alert("Kérlek tölts ki minden mezőt és adj meg legalább egy képet.");
      return;
    }
    if (images.length === 0) {
      alert("Adj meg legalább egy képet.");
      return;
    }

    setSubmitting(true);
    try {
      const imagesBase64 = await Promise.all(
        images.map((i) => fileToBase64(i.file)),
      );
      const payload: UploadToolPayload = {
        name: title,
        description,
        rentalPrice: price ?? undefined,
        depositPrice: deposit ?? undefined,
        lookupStatus: {
          code: status,
          name: STATUS_MAPPING[status as keyof typeof STATUS_MAPPING] || status,
        },
        lookupCategory: {
          code: category,
          name:
            CATEGORY_MAPPING[category as keyof typeof CATEGORY_MAPPING] ||
            category,
        },
        images: imagesBase64,
      };
      await uploadTool(payload);
      router.push("/eszkozeim");
    } catch (err) {
      console.error("upload failed", err);
      alert("Feltöltés sikertelen");
    } finally {
      setSubmitting(false);
    }
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
            <TextInput
              placeholder="Eszköz neve"
              value={title}
              onChange={(e) => setTitle(e.currentTarget.value)}
            />

            <Text className="md:self-center font-medium">
              Eszköz kategóriája:
            </Text>
            <Select
              data={CATEGORY_OPTIONS.map((opt) => ({
                value: opt.value,
                label: opt.label,
              }))}
              placeholder="Válassz kategóriát"
              value={category}
              onChange={(v) => setCategory(v ?? "")}
            />

            <Text className="md:self-center font-medium">Státusza:</Text>
            <Select
              data={STATUS_OPTIONS.map((opt) => ({
                value: opt.value,
                label: opt.label,
              }))}
              placeholder="Válaszd ki a státuszt"
              value={status}
              onChange={(v) => setStatus(v ?? "")}
            />

            <Text className="md:self-center font-medium">Ára (Ft/nap):</Text>
            <NumberInput
              placeholder="1 000"
              thousandSeparator=" "
              min={0}
              step={500}
              value={price}
              onChange={(val) =>
                setPrice(typeof val === "number" ? val : undefined)
              }
            />

            <Text className="md:self-center font-medium">Kaució (Ft):</Text>
            <NumberInput
              placeholder="20 000"
              thousandSeparator=" "
              min={0}
              step={1000}
              value={deposit}
              onChange={(val) =>
                setDeposit(typeof val === "number" ? val : undefined)
              }
            />

            <Text className="font-medium mt-1">Leírás:</Text>
            <Textarea
              minRows={4}
              placeholder="Rövid leírás az eszközről, állapotáról, tartozékokról…"
              value={description}
              onChange={(e) => setDescription(e.currentTarget.value)}
            />

            <Text className="font-medium mt-1">Képek:</Text>
            <div className="flex flex-col gap-4">
              <div
                onDrop={onDrop}
                onDragOver={onDragOver}
                className="border border-dashed rounded-md p-4 h-72 flex flex-col items-center justify-center bg-white"
              >
                <input
                  ref={inputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={onInputChange}
                />

                {images.length === 0 ? (
                  <div className="text-center text-gray-500">
                    <IconUpload size={36} className="mx-auto mb-2" />
                    <div>Húzd ide a képeket, vagy kattints a feltöltésre</div>
                    <div className="text-sm mt-2">
                      (támogatott: PNG, JPG, GIF)
                    </div>
                  </div>
                ) : images.length === 1 ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="relative w-48 h-64 rounded-md overflow-hidden border bg-gray-50">
                      <img
                        src={images[0].src}
                        alt="preview"
                        className="w-full h-full object-cover"
                      />
                      <ActionIcon
                        size="sm"
                        color="red"
                        variant="filled"
                        className="absolute top-1 right-1"
                        onClick={() => removeImage(images[0].id)}
                        aria-label="Törlés"
                      >
                        <IconTrash size={14} />
                      </ActionIcon>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full relative flex items-center justify-center">
                    <ActionIcon
                      variant="subtle"
                      size="lg"
                      className="absolute left-3"
                      onClick={prevImage}
                      aria-label="Előző"
                    >
                      <IconChevronLeft />
                    </ActionIcon>

                    <div className="w-full h-full relative max-w-md max-h-full">
                      <img
                        src={images[activeIndex].src}
                        alt={`preview-${activeIndex}`}
                        className="w-full h-full object-cover"
                      />
                      <ActionIcon
                        size="sm"
                        color="red"
                        variant="filled"
                        className="absolute top-1 right-1"
                        onClick={() => removeImage(images[activeIndex].id)}
                        aria-label="Törlés"
                      >
                        <IconTrash size={14} />
                      </ActionIcon>
                    </div>

                    <ActionIcon
                      variant="subtle"
                      size="lg"
                      className="absolute right-3"
                      onClick={nextImage}
                      aria-label="Következő"
                    >
                      <IconChevronRight />
                    </ActionIcon>

                    <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2">
                      {images.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          aria-label={`Go to ${idx + 1}`}
                          onClick={() => setActiveIndex(idx)}
                          className={`w-2 h-2 rounded-full ${idx === activeIndex ? "bg-gray-900" : "bg-gray-300"}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Group justify="flex-start">
                <Button
                  variant="outline"
                  leftSection={<IconUpload size={16} />}
                  onClick={() => inputRef.current?.click()}
                >
                  Új kép feltöltése
                </Button>
              </Group>
            </div>
          </div>

          <Group justify="flex-end" mt="xl">
            <Button
              variant="outline"
              color="gray"
              onClick={() => router.back()}
            >
              Mégse
            </Button>
            <Button onClick={handleUpload} loading={submitting}>
              Mentés
            </Button>
          </Group>
        </Paper>
      </main>
    </div>
  );
}
