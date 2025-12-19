export interface EventProfile {
  id: string
  email: string | null
  nickname?: string
  username?: string
  image_url?: string
  telegram?: string
  twitter?: string
  status?: string
}

export interface EventParticipant {
  id: string
  profile_id: string
  profile: EventProfile
}

export interface Event {
  id: string
  owner_id: string
  status: string
  title: string
  category: string
  end_time: string
  participants: EventParticipant[]
  location: string
  tags: string[]
}

export interface ProfileEvent {
  id: string
  owner_id: string
  title: string
  participants: {
    id: string
    profile: {
      email: string
    }
  }[]
}

export interface ProfileData {
  events: ProfileEvent[]
}