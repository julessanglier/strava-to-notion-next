// Notion API Client
import { Client } from "@notionhq/client";
import { NotionActivityData } from "../domain/types.js";

export class NotionClient {
  private client: Client;
  private databaseId: string;

  constructor(apiKey: string, databaseId: string) {
    this.client = new Client({ auth: apiKey });
    this.databaseId = databaseId;
  }

  /**
   * Helper to conditionally add properties to Notion page
   */
  private addNumberProperty(key: string, value: number | undefined) {
    return value !== undefined ? { [key]: { number: value } } : {};
  }

  /**
   * Create a new activity entry in Notion database
   */
  async createActivity(activity: NotionActivityData): Promise<string> {
    const response = await this.client.pages.create({
      parent: { database_id: this.databaseId },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: activity.name,
              },
            },
          ],
        },
        "Activity Type": {
          select: {
            name: activity.activityType,
          },
        },
        Distance: {
          number: activity.distanceKm,
        },
        Duration: {
          number: activity.durationMinutes,
        },
        ...this.addNumberProperty("Pace", activity.pace),
        "Elevation Gain": {
          number: activity.elevationGain,
        },
        "Start Date": {
          date: {
            start: activity.startDate,
          },
        },
        ...this.addNumberProperty("Average Speed", activity.averageSpeedKmh),
        ...this.addNumberProperty("Max Speed", activity.maxSpeedKmh),
        ...this.addNumberProperty(
          "Average Heart Rate",
          activity.averageHeartRate
        ),
        ...this.addNumberProperty("Max Heart Rate", activity.maxHeartRate),
        ...this.addNumberProperty("Calories", activity.calories),
        "Strava Link": {
          url: activity.stravaLink,
        },
        "Activity ID": {
          number: activity.activityId,
        },
      },
    });

    return response.id;
  }

  /**
   * Check if database exists and is accessible
   */
  async verifyDatabase(): Promise<boolean> {
    try {
      await this.client.databases.retrieve({
        database_id: this.databaseId,
      });
      console.log("✓ Notion database is accessible");
      return true;
    } catch (error) {
      console.error("❌ Failed to access Notion database:", error);
      return false;
    }
  }
}
