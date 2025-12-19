// Notion Service
import { NotionClient } from "../infrastructure/notion-client.js";
import { StravaActivity, NotionActivityData } from "../domain/types.js";

// Constants
const PACE_RELEVANT_ACTIVITY_TYPES = [
  "Run",
  "Walk",
  "Hike",
  "TrailRun",
  "VirtualRun",
] as const;
const MAX_NOTION_TITLE_LENGTH = 2000;
const TRUNCATION_SUFFIX = "...";
const TRUNCATION_LENGTH = MAX_NOTION_TITLE_LENGTH - TRUNCATION_SUFFIX.length;

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
    // Convert to display units
    const distanceKm = parseFloat((activity.distance / 1000).toFixed(2));
    const durationMinutes = parseFloat(
      (activity.moving_time / 60).toFixed(2)
    );

    // Calculate pace (min/km) only for running and walking activities
    let pace: number | undefined;
    if (
      distanceKm > 0 &&
      PACE_RELEVANT_ACTIVITY_TYPES.includes(activity.type as any)
    ) {
      pace = parseFloat((durationMinutes / distanceKm).toFixed(2));
    }

    // Sanitize and validate activity name
    let activityName = activity.name || "Untitled Activity";
    if (activityName.length > MAX_NOTION_TITLE_LENGTH) {
      activityName =
        activityName.substring(0, TRUNCATION_LENGTH) + TRUNCATION_SUFFIX;
    }

    return {
      name: activityName,
      activityType: activity.type,
      distanceKm,
      durationMinutes,
      pace,
      // Use 0 for missing elevation gain to satisfy Notion's number field requirement
      elevationGain: activity.total_elevation_gain
        ? Math.round(activity.total_elevation_gain)
        : 0,
      startDate: activity.start_date_local || activity.start_date,
      averageSpeedKmh: activity.average_speed
        ? parseFloat((activity.average_speed * 3.6).toFixed(2))
        : undefined,
      maxSpeedKmh: activity.max_speed
        ? parseFloat((activity.max_speed * 3.6).toFixed(2))
        : undefined,
      averageHeartRate: activity.average_heartrate
        ? Math.round(activity.average_heartrate)
        : undefined,
      maxHeartRate: activity.max_heartrate
        ? Math.round(activity.max_heartrate)
        : undefined,
      calories: activity.calories ? Math.round(activity.calories) : undefined,
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
