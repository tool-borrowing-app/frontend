"use client";

import { Button } from "@mantine/core";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <Button
        variant="primary"
        onClick={() => router.push("/eszkozeim/feltoltes")}
        aria-label="Feltöltés"
      >
        Új eszköz feltöltése
      </Button>

      <button></button>
    </div>
  );
}
