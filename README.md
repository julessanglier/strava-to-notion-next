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
- Notion account and integration (see [Notion Setup Guide](./NOTION_SETUP.md))

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

📖 **See [NOTION_SETUP.md](./NOTION_SETUP.md) for detailed step-by-step instructions.**

Quick summary:
1. Create a Notion integration at [notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Create a database with 14 properties (Name, Activity Type, Distance, Duration, etc.)
3. Share the database with your integration
4. Get the database ID from the URL
5. Set `NOTION_API_KEY` and `NOTION_DATABASE_ID` environment variables

## API Endpoints

- `GET /` - Home page with Strava connect button
- `GET /auth/strava` - Initiates OAuth flow
- `GET /auth/callback` - OAuth callback handler
- `GET /import` - Webhook verification endpoint
- `POST /import` - Webhook event handler

