// Token Management Service
import { StravaClient } from "../infrastructure/strava-client.js";
import { AthleteRepository } from "../infrastructure/athlete-repository.js";

export class TokenService {
  constructor(
    private stravaClient: StravaClient,
    private athleteRepository: AthleteRepository
  ) {}

  /**
   * Get valid access token for an athlete (refresh if needed)
   */
  async getValidAccessToken(athleteId: number): Promise<string> {
    console.log(`Checking access token for athlete ${athleteId}...`);

    const athlete = await this.athleteRepository.getAthleteById(athleteId);

    if (!athlete) {
      throw new Error("Athlete not found");
    }

    const expiresAt = new Date(athlete.expires_at);
    const now = new Date();

    // Refresh if token expires in less than 1 hour
    if (expiresAt.getTime() - now.getTime() < 3600000) {
      return await this.refreshAccessToken(athleteId, athlete.refresh_token);
    }

    console.log(`✓ Access token for athlete ${athleteId} is valid`);
    return athlete.access_token;
  }

  /**
   * Refresh access token for an athlete
   */
  private async refreshAccessToken(
    athleteId: number,
    refreshToken: string
  ): Promise<string> {
    const tokenData = await this.stravaClient.refreshToken(refreshToken);

    const expiresAt = new Date(tokenData.expires_at * 1000);

    await this.athleteRepository.updateTokens(
      athleteId,
      tokenData.access_token,
      tokenData.refresh_token,
      expiresAt.toISOString()
    );

    return tokenData.access_token;
  }
}
