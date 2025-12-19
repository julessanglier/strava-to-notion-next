import { createClient } from "@supabase/supabase-js";
import express from "express";

// Infrastructure
import { StravaClient } from "./infrastructure/strava-client.js";
import { AthleteRepository } from "./infrastructure/athlete-repository.js";

// Services
import { AuthService } from "./services/auth-service.js";
import { TokenService } from "./services/token-service.js";
import { ActivityService } from "./services/activity-service.js";
import { WebhookService } from "./services/webhook-service.js";

// Routes
import { createAuthRouter } from "./routes/auth-routes.js";
import { createWebhookRouter } from "./routes/webhook-routes.js";

// Initialize Express app
const app = express();
app.use(express.json());

// Environment variables
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY!;
const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID!;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET!;
const REDIRECT_URI = process.env.REDIRECT_URI!;
const WEBHOOK_VERIFY_TOKEN = "STRAVA";

// Initialize infrastructure
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
const stravaClient = new StravaClient(STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET);
const athleteRepository = new AthleteRepository(supabase);

// Initialize services
const authService = new AuthService(
  stravaClient,
  athleteRepository,
  REDIRECT_URI
);
const tokenService = new TokenService(stravaClient, athleteRepository);
const activityService = new ActivityService(stravaClient, tokenService);
const webhookService = new WebhookService(activityService);

// Register routes
app.use(createAuthRouter(authService));
app.use(createWebhookRouter(webhookService, WEBHOOK_VERIFY_TOKEN));

export default app;
