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
  total_elevation_gain?: number;
  start_date: string;
  start_date_local?: string;
  timezone: string;
  average_speed?: number;
  max_speed?: number;
  average_heartrate?: number;
  max_heartrate?: number;
  calories?: number;
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

// Notion Domain Types

export interface NotionActivityData {
  name: string;
  activityType: string;
  distanceKm: number; // in kilometers (converted)
  durationMinutes: number; // in minutes (converted)
  pace?: number; // min/km or min/mile
  elevationGain: number; // in meters
  startDate: string; // ISO 8601 date
  averageSpeedKmh?: number; // km/h (converted)
  maxSpeedKmh?: number; // km/h (converted)
  averageHeartRate?: number; // bpm
  maxHeartRate?: number; // bpm
  calories?: number;
  stravaLink: string; // URL to activity
  activityId: number; // Strava activity ID
}
