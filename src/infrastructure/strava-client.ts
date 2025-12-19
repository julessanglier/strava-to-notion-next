// Strava API Client Utilities
import { StravaActivity, StravaTokenResponse } from "../domain/types.js";

export class StravaClient {
  private clientId: string;
  private clientSecret: string;

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeToken(code: string): Promise<StravaTokenResponse> {
    const response = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await response.json();

    if (!response.ok) {
      throw new Error(`Strava API error: ${JSON.stringify(tokenData)}`);
    }

    return tokenData;
  }

  /**
   * Refresh an expired access token
   */
  async refreshToken(refreshToken: string): Promise<StravaTokenResponse> {
    const response = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    const tokenData = await response.json();

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${JSON.stringify(tokenData)}`);
    }

    return tokenData;
  }

  /**
   * Fetch activity details with retry logic
   */
  async fetchActivity(
    activityId: number,
    accessToken: string,
    maxRetries = 5,
    initialDelay = 2000
  ): Promise<StravaActivity> {
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

  /**
   * Build OAuth authorization URL
   */
  buildAuthorizationUrl(redirectUri: string, scope: string): string {
    return `https://www.strava.com/oauth/authorize?client_id=${
      this.clientId
    }&response_type=code&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&approval_prompt=force&scope=${scope}`;
  }
}
