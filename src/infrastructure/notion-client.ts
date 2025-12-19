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
   * Create a new activity entry in Notion database
   */
  async createActivity(activity: NotionActivityData): Promise<string> {
    try {
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
          ...(activity.pace && {
            Pace: {
              number: activity.pace,
            },
          }),
          "Elevation Gain": {
            number: activity.elevationGain,
          },
          "Start Date": {
            date: {
              start: activity.startDate,
            },
          },
          ...(activity.averageSpeedKmh && {
            "Average Speed": {
              number: activity.averageSpeedKmh,
            },
          }),
          ...(activity.maxSpeedKmh && {
            "Max Speed": {
              number: activity.maxSpeedKmh,
            },
          }),
          ...(activity.averageHeartRate && {
            "Average Heart Rate": {
              number: activity.averageHeartRate,
            },
          }),
          ...(activity.maxHeartRate && {
            "Max Heart Rate": {
              number: activity.maxHeartRate,
            },
          }),
          ...(activity.calories && {
            Calories: {
              number: activity.calories,
            },
          }),
          "Strava Link": {
            url: activity.stravaLink,
          },
          "Activity ID": {
            number: activity.activityId,
          },
        },
      });

      console.log(`✓ Activity saved to Notion: ${response.id}`);
      return response.id;
    } catch (error) {
      console.error("❌ Failed to save activity to Notion:", error);
      throw new Error(
        `Notion API error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
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
