"use client";

import { fetchConversations } from "@/apiClient/modules/conversation";
import { useEffect } from "react";

export default function Page() {

  useEffect(() => {
    getAllConversations();
  }, []);

  const getAllConversations = async() => {
    await fetchConversations();
  }

  return (
    <>üzenetek page</>
  );
}