import { useState, useCallback } from "react";

const SOCIAL_LAYER_API = "/api/socialLayer";

export function useSocialLayer() {
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const fetchSocialLayer = async (queryType: 'events' | 'profiles', email: string | string[]) => {
    const response = await fetch(SOCIAL_LAYER_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ queryType, email }),
    });

    const result = await response.json();
    if (result.error) {
      throw new Error(result.error);
    }
    return result;
  };

  const getEventsFromEmail = useCallback(async (email: string | string[]) => {
    setEventsLoading(true);
    setEventsError(null);

    try {
      const data = await fetchSocialLayer('events', email);
      return data.events;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setEventsError(errorMessage);
      throw err;
    } finally {
      setEventsLoading(false);
    }
  }, []);

  const getProfileFromEmail = useCallback(async (email: string | string[]) => {
    setProfileLoading(true);
    setProfileError(null);

    try {
      const data = await fetchSocialLayer('profiles', email);
      return data.profiles;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setProfileError(errorMessage);
      throw err;
    } finally {
      setProfileLoading(false);
    }
  }, []);

  return {
    // estado para cada función
    eventsLoading,
    eventsError,
    profileLoading,
    profileError,
    // funciones
    getEventsFromEmail,
    getProfileFromEmail,
  };
}
