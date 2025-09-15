"use client"

import { useEffect, useState } from "react";
import { api, instance } from "@/api";
import { CitizenProfile } from "@/types/Profile";

export type UpdateCitizenProfilePayload = Partial<
  Pick<CitizenProfile,
    | "first_name"
    | "last_name"
    | "organization"
    | "primary_email"
    | "secondary_email"
    | "x_user"
    | "telegram"
    | "gender"
    | "role"
    | "picture_url"
  >
>;

interface UseGetProfileReturn {
  profile: CitizenProfile | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  isUpdating: boolean;
  updateError: string | null;
  updateProfile: (payload: UpdateCitizenProfilePayload) => Promise<CitizenProfile | null>;
}

const useGetProfile = (): UseGetProfileReturn => {
  const [profile, setProfile] = useState<CitizenProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get("citizens/profile");
      if (response?.status === 200) {
        setProfile(response.data as CitizenProfile);
      } else {
        setError("Failed to fetch profile");
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Unexpected error fetching profile";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = window.localStorage.getItem("token");
      if (token) {
        instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }
    }
    fetchProfile();
  }, []);

  const refresh = async () => {
    await fetchProfile();
  };

  const updateProfile = async (payload: UpdateCitizenProfilePayload): Promise<CitizenProfile | null> => {
    setIsUpdating(true);
    setUpdateError(null);
    try {
      const response = await api.put("citizens/me", payload);
      if (response?.status === 200) {
        const updated = response.data as CitizenProfile;
        setProfile({...profile, ...updated});
        return updated;
      }
      setUpdateError("Failed to update profile");
      return null;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Unexpected error updating profile";
      setUpdateError(message);
      return null;
    } finally {
      setIsUpdating(false);
    }
  };

  return { profile, isLoading, error, refresh, isUpdating, updateError, updateProfile };
};

export default useGetProfile;


