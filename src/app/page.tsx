"use client";

import BrowseToolsForRent from "@/components/BrowseToolsForRent";
import { ToolPage } from "@/components/ToolPage";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const searchParams = useSearchParams();

  const idFromSearchParam = searchParams.get("id");

  return idFromSearchParam ? (
    <ToolPage id={idFromSearchParam} />
  ) : (
    <BrowseToolsForRent />
  );
}
