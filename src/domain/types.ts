// Strava Domain Types

export interface Athlete {
  athlete_id: number;
  access_token: string;
  refresh_token: string;
  expires_at: string;
  scope: string;
}

export interface StravaTokenResponse {
  token_type: string;
  expires_at: number;
  expires_in: number;
  refresh_token: string;
  access_token: string;
  athlete: {
    id: number;
    [key: string]: any;
  };
}

export interface StravaActivity {
  id: number;
  name: string;
  type: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  start_date: string;
  start_date_local: string;
  timezone: string;
  [key: string]: any;
}

export interface WebhookEvent {
  aspect_type: "create" | "update" | "delete";
  object_id: number;
  object_type: "activity" | "athlete";
  owner_id: number;
  subscription_id?: number;
  event_time?: number;
  updates?: Record<string, any>;
}

export interface WebhookVerification {
  "hub.verify_token": string;
  "hub.challenge": string;
  "hub.mode"?: string;
}
