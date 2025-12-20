// Webhook Service
import { ActivityService } from "./activity-service.js";
import { NotionService } from "./notion-service.js";
import { WebhookEventBody } from "../domain/api-types.js";

export class WebhookService {
  constructor(
    private activityService: ActivityService,
    private notionService: NotionService
  ) {}

  /**
   * Process webhook event
   */
  async processEvent(event: WebhookEventBody): Promise<{
    processed: boolean;
    skipped: boolean;
    activity?: string;
    notionPageId?: string;
    notionError?: string;
  }> {
    console.log("=== Strava Webhook Event ===");
    console.log("Body:", JSON.stringify(event, null, 2));

    const { aspect_type, object_id, object_type, owner_id } = event;

    if (object_type === "activity" && aspect_type === "create") {
      console.log(
        `Processing new activity ${object_id} for athlete ${owner_id}`
      );

      const activity = await this.activityService.fetchActivityForAthlete(
        object_id,
        owner_id
      );

      console.log("Activity details:", JSON.stringify(activity, null, 2));

      // Save to Notion database
      try {
        console.log("Saving activity to Notion...");
        const notionPageId = await this.notionService.saveActivity(activity);
        console.log(`✓ Activity saved to Notion: ${notionPageId}`);

        return {
          processed: true,
          skipped: false,
          activity: activity.name,
          notionPageId,
        };
      } catch (error) {
        // Log full error details for debugging
        console.error("❌ Failed to save to Notion:", error);

        // Return sanitized error message in response
        const errorMessage = "Failed to save activity to Notion database";

        return {
          processed: true,
          skipped: false,
          activity: activity.name,
          notionError: errorMessage,
        };
      }
    } else if (object_type === "activity" && aspect_type === "update") {
      console.log(`Activity ${object_id} was updated - skipping for now`);
      return {
        processed: false,
        skipped: true,
      };
    } else {
      console.log(`Unhandled event type: ${object_type}.${aspect_type}`);
      return {
        processed: false,
        skipped: true,
      };
    }
  }
}
