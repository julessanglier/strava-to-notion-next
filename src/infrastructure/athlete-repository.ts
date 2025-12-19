// Supabase Database Repository
import { SupabaseClient } from "@supabase/supabase-js";
import { Athlete } from "../domain/types.js";

export class AthleteRepository {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Save or update athlete token information
   */
  async upsertAthlete(athlete: Athlete): Promise<Athlete> {
    const { data, error } = await this.supabase
      .from("athletes")
      .upsert(athlete, {
        onConflict: "athlete_id",
      })
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      throw error;
    }

    return data;
  }

  /**
   * Get athlete by ID
   */
  async getAthleteById(athleteId: number): Promise<Athlete | null> {
    const { data, error } = await this.supabase
      .from("athletes")
      .select("*")
      .eq("athlete_id", athleteId)
      .single();

    if (error) {
      console.error("Database error:", error);
      return null;
    }

    return data;
  }

  /**
   * Update athlete tokens
   */
  async updateTokens(
    athleteId: number,
    accessToken: string,
    refreshToken: string,
    expiresAt: string
  ): Promise<void> {
    const { error } = await this.supabase
      .from("athletes")
      .update({
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: expiresAt,
      })
      .eq("athlete_id", athleteId);

    if (error) {
      console.error("Database error:", error);
      throw error;
    }
  }
}
