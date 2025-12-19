// API Endpoint Types
import { Request } from "express";

// Auth callback query parameters
export interface AuthCallbackQuery {
  code?: string;
  scope?: string;
  error?: string;
  [key: string]: any;
}

export interface AuthCallbackRequest extends Request {
  query: AuthCallbackQuery;
}

// Webhook verification query parameters
export interface WebhookVerificationQuery {
  "hub.verify_token"?: string;
  "hub.challenge"?: string;
  "hub.mode"?: string;
  [key: string]: any;
}

export interface WebhookVerificationRequest extends Request {
  query: WebhookVerificationQuery;
}

// Webhook event body
export interface WebhookEventBody {
  aspect_type: "create" | "update" | "delete";
  object_id: number;
  object_type: "activity" | "athlete";
  owner_id: number;
  subscription_id?: number;
  event_time?: number;
  updates?: Record<string, any>;
}

export interface WebhookEventRequest extends Request {
  body: WebhookEventBody;
}

// Response types
export interface WebhookVerificationResponse {
  "hub.challenge": string;
}

export interface WebhookEventResponse {
  received: boolean;
  processed?: boolean;
  skipped?: boolean;
  activity?: string;
  error?: string;
}
