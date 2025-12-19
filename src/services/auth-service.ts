// Authentication Service
import { StravaClient } from "../infrastructure/strava-client.js";
import { AthleteRepository } from "../infrastructure/athlete-repository.js";
import { Athlete } from "../domain/types.js";

export class AuthService {
  constructor(
    private stravaClient: StravaClient,
    private athleteRepository: AthleteRepository,
    private redirectUri: string
  ) {}

  /**
   * Get OAuth authorization URL
   */
  getAuthorizationUrl(): string {
    const scope = "read,activity:read_all,activity:write";
    return this.stravaClient.buildAuthorizationUrl(this.redirectUri, scope);
  }

  /**
   * Handle OAuth callback and save athlete tokens
   */
  async handleCallback(code: string, scope: string): Promise<number> {
    // Exchange authorization code for access token
    const tokenData = await this.stravaClient.exchangeToken(code);
    
    const expiresAt = new Date(tokenData.expires_at * 1000);

    // Save to database
    const athlete: Athlete = {
      athlete_id: tokenData.athlete.id,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: expiresAt.toISOString(),
      scope: scope,
    };

    await this.athleteRepository.upsertAthlete(athlete);

    return tokenData.athlete.id;
  }
}
