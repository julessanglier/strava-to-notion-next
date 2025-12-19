// Auth Routes
import { Router, Request, Response } from "express";
import { AuthService } from "../services/auth-service.js";
import { AuthCallbackRequest } from "../domain/api-types.js";

export function createAuthRouter(authService: AuthService): Router {
  const router = Router();

  // Home route with Connect button
  router.get("/", (req: Request, res: Response) => {
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
  router.get("/auth/strava", (req: Request, res: Response) => {
    const authUrl = authService.getAuthorizationUrl();
    res.redirect(authUrl);
  });

  // Step 2: Handle OAuth callback
  router.get("/auth/callback", async (req: AuthCallbackRequest, res: Response) => {
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
      const athleteId = await authService.handleCallback(code, scope || "");

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
          <p>Your Strava account (Athlete ID: ${athleteId}) is now connected.</p>
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

  return router;
}
