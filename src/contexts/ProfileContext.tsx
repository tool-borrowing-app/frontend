"use client";

import { fetchProfile } from "@/apiClient/modules/auth";
import { createContext, useContext, useEffect, useState } from "react";

type UserProfile = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
};

type ProfileContextType = {
  user: UserProfile | null | unknown;
  loading: boolean;
  refresh: () => Promise<void>;
};

const ProfileContext = createContext<ProfileContextType>({
  user: null,
  loading: true,
  refresh: async () => {},
});

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  // TODO fix this type:
  const [user, setUser] = useState<UserProfile | null | unknown>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    setLoading(true);
    try {
      const res = await fetchProfile();
      console.log("Fetched profile:", res);

      const data = res?.data;

      setUser(data);
    } catch {
      setUser(null);
    }
    setLoading(false);
  };

  console.log("ProfileContext user:", user);

  useEffect(() => {
    refreshProfile();
  }, []);

  return (
    <ProfileContext.Provider value={{ user, loading, refresh: refreshProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
