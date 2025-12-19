# Architecture Diagram

## Layer Dependencies

```
┌─────────────────────────────────────────────────────────┐
│                      index.ts (50 lines)                 │
│                   Application Entry Point                │
│              (Dependency Injection & Wiring)             │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                    Routes Layer (169 lines)              │
│  ┌─────────────────┐         ┌──────────────────┐       │
│  │  auth-routes.ts │         │ webhook-routes.ts│       │
│  │  (112 lines)    │         │  (54 lines)      │       │
│  └─────────────────┘         └──────────────────┘       │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                   Services Layer (198 lines)             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ AuthService  │  │TokenService  │  │ ActivityService│  │
│  │  (43 lines)  │  │  (55 lines)  │  │  (40 lines)   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                    ┌──────────────┐                     │
│                    │WebhookService│                     │
│                    │  (55 lines)  │                     │
│                    └──────────────┘                     │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                Infrastructure Layer (203 lines)          │
│  ┌─────────────────┐         ┌──────────────────┐       │
│  │  StravaClient   │         │AthleteRepository │       │
│  │  (131 lines)    │         │  (69 lines)      │       │
│  └─────────────────┘         └──────────────────┘       │
│         │                             │                  │
│         │                             │                  │
│    ┌────▼─────┐                 ┌────▼─────┐            │
│    │ Strava   │                 │ Supabase │            │
│    │   API    │                 │    DB    │            │
│    └──────────┘                 └──────────┘            │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                    Domain Layer (108 lines)              │
│  ┌─────────────────┐         ┌──────────────────┐       │
│  │    types.ts     │         │  api-types.ts    │       │
│  │  (51 lines)     │         │   (54 lines)     │       │
│  └─────────────────┘         └──────────────────┘       │
│  • Athlete                    • AuthCallbackRequest     │
│  • StravaActivity             • WebhookEventRequest     │
│  • StravaTokenResponse        • WebhookEventResponse    │
│  • WebhookEvent               • Query parameter types   │
└─────────────────────────────────────────────────────────┘
```

## Request Flow Example: OAuth Callback

```
1. HTTP Request
   GET /auth/callback?code=xxx&scope=yyy
   │
   ▼
2. Routes Layer (auth-routes.ts)
   createAuthRouter → GET /auth/callback handler
   │
   ▼
3. Services Layer (auth-service.ts)
   AuthService.handleCallback(code, scope)
   │
   ├─→ StravaClient.exchangeToken(code)
   │   └─→ Strava API
   │
   └─→ AthleteRepository.upsertAthlete(athlete)
       └─→ Supabase DB
   │
   ▼
4. HTTP Response
   HTML success page with athlete ID
```

## Request Flow Example: Webhook Event

```
1. HTTP Request
   POST /import
   Body: { aspect_type: "create", object_id: 123, ... }
   │
   ▼
2. Routes Layer (webhook-routes.ts)
   createWebhookRouter → POST /import handler
   │
   ▼
3. Services Layer (webhook-service.ts)
   WebhookService.processEvent(event)
   │
   ▼
4. Services Layer (activity-service.ts)
   ActivityService.fetchActivityForAthlete(activityId, athleteId)
   │
   ├─→ TokenService.getValidAccessToken(athleteId)
   │   │
   │   ├─→ AthleteRepository.getAthleteById(athleteId)
   │   │   └─→ Supabase DB
   │   │
   │   └─→ StravaClient.refreshToken(refreshToken) [if expired]
   │       └─→ Strava API
   │
   └─→ StravaClient.fetchActivity(activityId, accessToken)
       └─→ Strava API (with retry logic)
   │
   ▼
5. HTTP Response
   JSON: { received: true, processed: true, activity: "Morning Run" }
```

## Key Design Patterns

### 1. Dependency Injection
```typescript
// Services receive dependencies via constructor
class AuthService {
  constructor(
    private stravaClient: StravaClient,
    private athleteRepository: AthleteRepository,
    private redirectUri: string
  ) {}
}

// Wired in index.ts
const authService = new AuthService(
  stravaClient,
  athleteRepository,
  REDIRECT_URI
);
```

### 2. Factory Pattern
```typescript
// Routes created by factory functions
function createAuthRouter(authService: AuthService): Router {
  const router = Router();
  router.get("/", ...);
  router.get("/auth/strava", ...);
  router.get("/auth/callback", ...);
  return router;
}

// Used in index.ts
app.use(createAuthRouter(authService));
```

### 3. Repository Pattern
```typescript
// Abstracts database operations
class AthleteRepository {
  constructor(private supabase: SupabaseClient) {}
  
  async getAthleteById(athleteId: number): Promise<Athlete | null> {
    // Supabase implementation details hidden
  }
}
```

### 4. Client Pattern
```typescript
// Encapsulates external API
class StravaClient {
  async fetchActivity(id: number, token: string): Promise<StravaActivity> {
    // Retry logic, error handling, etc.
  }
}
```

## Benefits Summary

✅ **Separation of Concerns** - Each layer has a distinct responsibility
✅ **Testability** - Easy to mock dependencies for unit tests
✅ **Maintainability** - Changes isolated to specific layers
✅ **Type Safety** - Strong TypeScript typing throughout
✅ **Scalability** - Easy to add new features
✅ **Documentation** - Self-documenting structure
✅ **Clean Entry Point** - index.ts reduced from 372 to 50 lines
