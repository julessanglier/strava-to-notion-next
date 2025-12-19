// Webhook Routes
import { Router, Request, Response } from "express";
import { WebhookService } from "../services/webhook-service.js";
import {
  WebhookVerificationRequest,
  WebhookEventRequest,
  WebhookEventResponse,
} from "../domain/api-types.js";

export function createWebhookRouter(
  webhookService: WebhookService,
  verifyToken: string
): Router {
  const router = Router();

  // Webhook verification (GET)
  router.get("/import", (req: WebhookVerificationRequest, res: Response) => {
    console.log("=== Strava Webhook Verification ===");
    console.log("Query:", req.query);

    const verifyTokenParam = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (verifyTokenParam === verifyToken) {
      res.status(200).json({ "hub.challenge": challenge });
    } else {
      res.status(403).send("Forbidden: Invalid verify token");
    }
  });

  // Webhook handler (POST)
  router.post("/import", async (req: WebhookEventRequest, res: Response) => {
    try {
      const result = await webhookService.processEvent(req.body);

      // Respond after processing is complete
      const response: WebhookEventResponse = {
        received: true,
        ...result,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("❌ Webhook processing error:", error);
      // Still respond with 200 so Strava doesn't retry
      res.status(200).json({
        received: true,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  return router;
}
