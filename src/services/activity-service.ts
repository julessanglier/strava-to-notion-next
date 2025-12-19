// Activity Service
import { StravaClient } from "../infrastructure/strava-client.js";
import { TokenService } from "./token-service.js";
import { StravaActivity } from "../domain/types.js";

export class ActivityService {
  constructor(
    private stravaClient: StravaClient,
    private tokenService: TokenService
  ) {}

  /**
   * Fetch activity for an athlete (handles token refresh)
   */
  async fetchActivityForAthlete(
    activityId: number,
    athleteId: number
  ): Promise<StravaActivity> {
    // Get valid access token for this athlete
    console.log("Step 1: Getting access token...");
    const accessToken = await this.tokenService.getValidAccessToken(athleteId);
    console.log("Step 1: ✓ Access token obtained");

    // Fetch activity with retry logic
    console.log("Step 2: Fetching activity...");
    const activity = await this.stravaClient.fetchActivity(
      activityId,
      accessToken
    );

    console.log(
      "Step 2: ✓ Activity fetched:",
      activity.name,
      activity.type,
      activity.distance
    );

    return activity;
  }
}
