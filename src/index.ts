import { createClient } from "@supabase/supabase-js";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_PUBLISHABLE_KEY!
);

// Strava OAuth config
const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI; // e.g., https://yourdomain.com/auth/callback

// Home route with Connect button
app.get("/", (req, res) => {
  res.type("html").send(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8"/>
        <title>Strava to Notion</title>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            text-align: center;
          }
          .connect-btn {
            background: #FC4C02;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
            display: inline-block;
            margin-top: 20px;
          }
          .connect-btn:hover {
            background: #E34402;
          }
        </style>
      </head>
      <body>
        <h1>Strava to Notion Integration</h1>
        <p>Connect your Strava account to sync activities to Notion</p>
        <a href="/auth/strava" class="connect-btn">
          Connect with Strava
        </a>
      </body>
    </html>
  `);
});

// Step 1: Redirect to Strava OAuth
app.get("/auth/strava", (req, res) => {
  const scope = "read,activity:read_all,activity:write";
  const authUrl = `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(
    REDIRECT_URI!
  )}&approval_prompt=force&scope=${scope}`;

  res.redirect(authUrl);
});

// Step 2: Handle OAuth callback
app.get("/auth/callback", async (req, res) => {
  const { code, scope, error } = req.query;

  if (error) {
    return res.status(400).send(`
      <h1>Authorization Failed</h1>
      <p>Error: ${error}</p>
      <a href="/">Go back</a>
    `);
  }

  if (!code) {
    return res.status(400).send("No authorization code received");
  }

  try {
    // Exchange authorization code for access token
    const tokenResponse = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: STRAVA_CLIENT_ID,
        client_secret: STRAVA_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      throw new Error(`Strava API error: ${JSON.stringify(tokenData)}`);
    }

    // tokenData structure:
    // {
    //   token_type: "Bearer",
    //   expires_at: 1234567890,
    //   expires_in: 21600,
    //   refresh_token: "...",
    //   access_token: "...",
    //   athlete: { id: 123456, ... }
    // }

    const expiresAt = new Date(tokenData.expires_at * 1000);

    // Save to Supabase
    const { data, error: dbError } = await supabase
      .from("athletes")
      .upsert(
        {
          athlete_id: tokenData.athlete.id,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: expiresAt.toISOString(),
          scope: scope as string,
        },
        {
          onConflict: "athlete_id",
        }
      )
      .select();

    if (dbError) {
      console.error("Database error:", dbError);
      throw dbError;
    }

    res.send(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8"/>
          <title>Success</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              max-width: 600px;
              margin: 50px auto;
              padding: 20px;
              text-align: center;
            }
            .success { color: #2ecc71; }
          </style>
        </head>
        <body>
          <h1 class="success">✓ Connected Successfully!</h1>
          <p>Your Strava account (Athlete ID: ${tokenData.athlete.id}) is now connected.</p>
          <p>We'll sync your activities automatically.</p>
          <a href="/">Go back home</a>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("OAuth error:", error);
    res.status(500).send(`
      <h1>Error</h1>
      <p>${error instanceof Error ? error.message : "Unknown error"}</p>
      <a href="/">Try again</a>
    `);
  }
});

// Utility: Refresh access token when expired
async function refreshAccessToken(athleteId: number) {
  const { data: athlete, error } = await supabase
    .from("athletes")
    .select("*")
    .eq("athlete_id", athleteId)
    .single();

  if (error || !athlete) {
    throw new Error("Athlete not found");
  }

  const response = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      refresh_token: athlete.refresh_token,
      grant_type: "refresh_token",
    }),
  });

  const tokenData = await response.json();

  if (!response.ok) {
    throw new Error(`Token refresh failed: ${JSON.stringify(tokenData)}`);
  }

  const expiresAt = new Date(tokenData.expires_at * 1000);

  await supabase
    .from("athletes")
    .update({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: expiresAt.toISOString(),
    })
    .eq("athlete_id", athleteId);

  return tokenData.access_token;
}

// Utility: Get valid access token (refresh if needed)
async function getValidAccessToken(athleteId: number) {
  console.log(`Checking access token for athlete ${athleteId}...`);

  const { data: athlete, error } = await supabase
    .from("athletes")
    .select("*")
    .eq("athlete_id", athleteId)
    .single();

  if (error || !athlete) {
    throw new Error("Athlete not found");
  }

  const expiresAt = new Date(athlete.expires_at);
  const now = new Date();

  // Refresh if token expires in less than 1 hour
  if (expiresAt.getTime() - now.getTime() < 3600000) {
    return await refreshAccessToken(athleteId);
  }

  console.log(`✓ Access token for athlete ${athleteId} is valid`);
  return athlete.access_token;
}

// Webhook verification
app.get("/import", (req, res) => {
  console.log("=== Strava Webhook Verification ===");
  console.log("Query:", req.query);

  const verifyToken = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (verifyToken === "STRAVA") {
    res.status(200).json({ "hub.challenge": challenge });
  } else {
    res.status(403).send("Forbidden: Invalid verify token");
  }
});

// Utility: Fetch activity with retries
async function fetchActivityWithRetry(
  activityId: number,
  accessToken: string,
  maxRetries = 5,
  initialDelay = 2000
) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(
        `https://www.strava.com/api/v3/activities/${activityId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const data = await response.json();

      if (response.ok) {
        console.log(
          `✓ Activity ${activityId} fetched successfully on attempt ${
            attempt + 1
          }`
        );
        return data;
      }

      // If 404, the activity might not be available yet
      if (response.status === 404) {
        console.log(
          `⏳ Activity ${activityId} not found, attempt ${
            attempt + 1
          }/${maxRetries}`
        );

        if (attempt < maxRetries - 1) {
          // Exponential backoff: 2s, 4s, 8s, 16s, 32s
          const delay = initialDelay * Math.pow(2, attempt);
          console.log(`   Waiting ${delay}ms before retry...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
      }

      throw new Error(`API error: ${JSON.stringify(data)}`);
    } catch (error) {
      if (attempt === maxRetries - 1) {
        throw error;
      }
      console.error(`Error on attempt ${attempt + 1}:`, error);
      const delay = initialDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error(`Failed to fetch activity after ${maxRetries} attempts`);
}

// Webhook handler
app.post('/import', async (req, res) => {
  console.log('=== Strava Webhook Event ===')
  console.log('Body:', JSON.stringify(req.body, null, 2))
  
  const { aspect_type, object_id, object_type, owner_id } = req.body

  // IMPORTANT: Don't respond until processing is done in serverless environments
  try {
    if (object_type === 'activity' && aspect_type === 'create') {
      console.log(`Processing new activity ${object_id} for athlete ${owner_id}`)
      
      // Get valid access token for this athlete
      console.log('Step 1: Getting access token...')
      const accessToken = await getValidAccessToken(owner_id)
      console.log('Step 1: ✓ Access token obtained')

      // Fetch activity with retry logic
      console.log('Step 2: Fetching activity...')
      const activity = await fetchActivityWithRetry(object_id, accessToken)
      
      console.log('Step 2: ✓ Activity fetched:', activity.name, activity.type, activity.distance)
      console.log('Activity details:', JSON.stringify(activity, null, 2))

      // TODO: Send to Notion API here
      // You'll need to add Notion integration next

      // Respond after processing is complete
      res.status(200).json({ 
        received: true, 
        processed: true,
        activity: activity.name 
      })
      
    } else if (object_type === 'activity' && aspect_type === 'update') {
      console.log(`Activity ${object_id} was updated - skipping for now`)
      res.status(200).json({ received: true, skipped: true })
    } else {
      console.log(`Unhandled event type: ${object_type}.${aspect_type}`)
      res.status(200).json({ received: true })
    }
  } catch (error) {
    console.error('❌ Webhook processing error:', error)
    // Still respond with 200 so Strava doesn't retry
    res.status(200).json({ 
      received: true, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
})

export default app;
