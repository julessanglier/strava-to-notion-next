// Notion Service
import { NotionClient } from "../infrastructure/notion-client.js";
import { StravaActivity, NotionActivityData } from "../domain/types.js";

export class NotionService {
  constructor(private notionClient: NotionClient) {}

  /**
   * Convert Strava activity to Notion format and save it
   */
  async saveActivity(activity: StravaActivity): Promise<string> {
    const notionData = this.convertStravaToNotion(activity);
    return await this.notionClient.createActivity(notionData);
  }

  /**
   * Convert Strava activity format to Notion activity format
   */
  private convertStravaToNotion(activity: StravaActivity): NotionActivityData {
    const distanceKm = activity.distance / 1000;
    const durationMinutes = activity.moving_time / 60;

    // Calculate pace (min/km) if distance > 0
    let pace: number | undefined;
    if (distanceKm > 0) {
      pace = durationMinutes / distanceKm;
    }

    return {
      name: activity.name || "Untitled Activity",
      activityType: activity.type,
      distance: activity.distance,
      duration: activity.moving_time,
      pace,
      elevationGain: activity.total_elevation_gain,
      startDate: activity.start_date_local || activity.start_date,
      averageSpeed: activity.average_speed,
      maxSpeed: activity.max_speed,
      averageHeartRate: activity.average_heartrate,
      maxHeartRate: activity.max_heartrate,
      calories: activity.calories,
      stravaLink: `https://www.strava.com/activities/${activity.id}`,
      activityId: activity.id,
    };
  }

  /**
   * Verify Notion database is accessible
   */
  async verifyDatabase(): Promise<boolean> {
    return await this.notionClient.verifyDatabase();
  }
}
