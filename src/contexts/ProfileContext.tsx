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
  user: UserProfile | undefined;
  loading: boolean;
  refresh: () => Promise<void>;
};

const ProfileContext = createContext<ProfileContextType>({
  user: undefined,
  loading: true,
  refresh: async () => {},
});

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    setLoading(true);
    setUser(undefined);
    try {
      const res = await fetchProfile();
      console.log("Fetched profile:", res);

      const data = res?.data;

      setUser(data);
    } catch {
      setUser(undefined);
    }
    setLoading(false);
  };

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
