import { NextResponse } from 'next/server';

const HASURA_URL = "https://hasura-graph.fly.dev/v1/graphql";

const EVENTS_QUERY = `
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

const PROFILES_QUERY = `
  query Profiles($where: profiles_bool_exp) {
    profiles(where: $where) {
      events {
        id
        owner_id
        title
        participants {
          id
          profile {
            id
            email
          }
        }
      }
    }
  }
`;

async function fetchGraphQL(query: string, variables: object) {
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
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { queryType, email } = body;
    const emails = Array.isArray(email) ? email : [email];

    if (!queryType || !email) {
      return NextResponse.json({ error: "Missing queryType or email" }, { status: 400 });
    }

    if (queryType === 'events') {
      const variables = {
        where: { participants: { profile: { email: { _in: emails } } } },
      };
      
      const data = await fetchGraphQL(EVENTS_QUERY, variables);
      const events = data.events;

      // Redact emails of other participants
      const sanitizedEvents = events.map((event: any) => ({
        ...event,
        participants: event.participants.map((participant: any) => {
          const profile = participant.profile;
          if (!profile) return participant;

          const isCurrentUser = emails.includes(profile.email);
          return {
            ...participant,
            profile: {
              ...profile,
              email: isCurrentUser ? profile.email : null, // Redact email if not the current user
              // Keep other public fields like nickname, username, image_url, id
            }
          };
        })
      }));

      return NextResponse.json({ events: sanitizedEvents });

    } else if (queryType === 'profiles') {
      const variables = { where: { email: { _in: emails } } };
      const data = await fetchGraphQL(PROFILES_QUERY, variables);
      const profiles = data.profiles;

       // Redact emails in nested events participants
       const sanitizedProfiles = profiles.map((profile: any) => ({
        ...profile,
        events: profile.events.map((event: any) => ({
          ...event,
          participants: event.participants.map((participant: any) => {
             const pProfile = participant.profile;
             if(!pProfile) return participant;
             
             // For profiles query, we are looking up the current user's profile, 
             // so the nested participants are others in the same events.
             // We should check if the nested participant is one of the requested emails (the user).
             const isCurrentUser = emails.includes(pProfile.email);
             
             return {
               ...participant,
               profile: {
                 ...pProfile,
                 email: isCurrentUser ? pProfile.email : null 
               }
             }
          })
        }))
      }));

      return NextResponse.json({ profiles: sanitizedProfiles });
    }

    return NextResponse.json({ error: "Invalid queryType" }, { status: 400 });

  } catch (error: any) {
    console.error("SocialLayer API Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

