[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/vercel/examples/tree/main/framework-boilerplates/express-bun&template=express)

# Strava to Notion Integration

A clean, modular Express application for syncing Strava activities to Notion via webhooks.

Live Example: https://example-express-bun.vercel.app/

## Architecture

This project follows a **clean, layered architecture** for maintainability and scalability:

```
src/
├── domain/          # Domain types and API contracts
├── infrastructure/  # External service clients (Strava, Supabase)
├── services/        # Business logic layer
├── routes/          # HTTP route handlers
└── index.ts         # Application entry point (DI setup)
```

📖 See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed documentation.

## Prerequisites

- [Vercel CLI](https://vercel.com/docs/cli) installed globally
- Bun runtime
- Strava API credentials
- Supabase account and database

## Development

To develop locally:

```bash
bun install
vc dev
```

Then open http://localhost:3000

## Building

To build locally:

```bash
bun install
vc build
```

## Deployment

To deploy:

```bash
bun install
vc deploy
```

## Environment Variables

Required environment variables:

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_PUBLISHABLE_KEY` - Supabase public API key
- `STRAVA_CLIENT_ID` - Strava OAuth client ID
- `STRAVA_CLIENT_SECRET` - Strava OAuth client secret
- `REDIRECT_URI` - OAuth callback URL (e.g., https://yourdomain.com/auth/callback)
- `NOTION_API_KEY` - Notion integration API key (internal integration token)
- `NOTION_DATABASE_ID` - Notion database ID where activities will be stored

## Features

- ✅ Strava OAuth integration
- ✅ Webhook support for real-time activity sync
- ✅ Automatic token refresh
- ✅ Retry logic for activity fetching
- ✅ Type-safe TypeScript throughout
- ✅ Clean, modular architecture
- ✅ Notion API integration for activity tracking

## Notion Database Setup

To use the Notion integration, you need to:

1. **Create a Notion Integration**:
   - Go to [Notion Integrations](https://www.notion.so/my-integrations)
   - Create a new integration and get the API key
   - Set the API key as `NOTION_API_KEY` environment variable

2. **Create a Notion Database** with the following properties:
   - **Name** (Title): Activity name
   - **Activity Type** (Select): Activity type (Run, Ride, Swim, etc.)
   - **Distance** (Number): Distance in kilometers
   - **Duration** (Number): Duration in minutes
   - **Pace** (Number): Average pace in min/km
   - **Elevation Gain** (Number): Total elevation gain in meters
   - **Start Date** (Date): Activity start date
   - **Average Speed** (Number): Average speed in km/h
   - **Max Speed** (Number): Maximum speed in km/h
   - **Average Heart Rate** (Number): Average heart rate in bpm
   - **Max Heart Rate** (Number): Maximum heart rate in bpm
   - **Calories** (Number): Estimated calories burned
   - **Strava Link** (URL): Direct link to activity on Strava
   - **Activity ID** (Number): Strava activity ID

3. **Share the Database** with your integration:
   - Open your database in Notion
   - Click "..." → "Connections" → Add your integration
   - Copy the database ID from the URL (it's the part after the workspace name and before the "?")
   - Set it as `NOTION_DATABASE_ID` environment variable

## API Endpoints

- `GET /` - Home page with Strava connect button
- `GET /auth/strava` - Initiates OAuth flow
- `GET /auth/callback` - OAuth callback handler
- `GET /import` - Webhook verification endpoint
- `POST /import` - Webhook event handler

