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

## Features

- ✅ Strava OAuth integration
- ✅ Webhook support for real-time activity sync
- ✅ Automatic token refresh
- ✅ Retry logic for activity fetching
- ✅ Type-safe TypeScript throughout
- ✅ Clean, modular architecture

## API Endpoints

- `GET /` - Home page with Strava connect button
- `GET /auth/strava` - Initiates OAuth flow
- `GET /auth/callback` - OAuth callback handler
- `GET /import` - Webhook verification endpoint
- `POST /import` - Webhook event handler

