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
            number: Math.round(activity.distance) / 1000, // Convert to km
          },
          Duration: {
            number: Math.round(activity.duration / 60), // Convert to minutes
          },
          ...(activity.pace && {
            Pace: {
              number: parseFloat(activity.pace.toFixed(2)),
            },
          }),
          "Elevation Gain": {
            number: Math.round(activity.elevationGain),
          },
          "Start Date": {
            date: {
              start: activity.startDate,
            },
          },
          ...(activity.averageSpeed && {
            "Average Speed": {
              number: parseFloat((activity.averageSpeed * 3.6).toFixed(2)), // Convert m/s to km/h
            },
          }),
          ...(activity.maxSpeed && {
            "Max Speed": {
              number: parseFloat((activity.maxSpeed * 3.6).toFixed(2)), // Convert m/s to km/h
            },
          }),
          ...(activity.averageHeartRate && {
            "Average Heart Rate": {
              number: Math.round(activity.averageHeartRate),
            },
          }),
          ...(activity.maxHeartRate && {
            "Max Heart Rate": {
              number: Math.round(activity.maxHeartRate),
            },
          }),
          ...(activity.calories && {
            Calories: {
              number: Math.round(activity.calories),
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
