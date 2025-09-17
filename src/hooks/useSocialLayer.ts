import { useState, useCallback } from "react";

const HASURA_URL = "https://hasura-graph.fly.dev/v1/graphql";

export function useSocialLayer() {
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const fetchGraphQL = async (query: string, variables: object) => {
    const response = await fetch(HASURA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
    });

    const result = await response.json();
    if (result.errors) {
      throw new Error(result.errors[0].message);
    }
    return result.data;
  };

  const getEventsFromEmail = useCallback(async (email: string) => {
    setEventsLoading(true);
    setEventsError(null);

    const query = `
      query Events($where: events_bool_exp) {
        events(where: $where) {
          id
          owner_id
          status
          title
          category
          end_time
          badge_class {
            name
            title
          }
          display
          event_type
          location
          tags
          venue {
            title
          }
          participants {
            id
            profile_id
            profile {
              id
              telegram
              twitter
              status
              nickname
              email
              image_url
              username
            }
          }
        }
      }
    `;

    const variables = {
      where: { participants: { profile: { email: { _eq: email } } } },
    };

    try {
      const data = await fetchGraphQL(query, variables);
      return data.events;
    } catch (err: any) {
      setEventsError(err.message);
      throw err;
    } finally {
      setEventsLoading(false);
    }
  }, []);

  const getProfileFromEmail = useCallback(async (email: string) => {
    setProfileLoading(true);
    setProfileError(null);

    const query = `
      query Profiles($where: profiles_bool_exp) {
        profiles(where: $where) {
          events {
            id
            owner_id
            title
            participants {
              id
              profile {
                email
              }
            }
          }
        }
      }
    `;

    const variables = { where: { email: { _eq: email } } };

    try {
      const data = await fetchGraphQL(query, variables);
      return data.profiles;
    } catch (err: any) {
      setProfileError(err.message);
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
