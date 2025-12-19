# Architecture Documentation

## Overview

This application follows a clean, layered architecture pattern separating concerns into distinct modules:

```
src/
├── domain/          # Domain models and types
├── infrastructure/  # External service integrations
├── services/        # Business logic layer
├── routes/          # HTTP route handlers
└── index.ts         # Application entry point
```

## Layers

### 1. Domain Layer (`src/domain/`)

Contains type definitions and models representing the core business entities and API contracts.

**Files:**
- `types.ts` - Core domain types (Athlete, StravaActivity, StravaTokenResponse, WebhookEvent)
- `api-types.ts` - API endpoint request/response types
- `index.ts` - Barrel export for domain types

**Purpose:** Defines the shape of data used throughout the application. No dependencies on other layers.

### 2. Infrastructure Layer (`src/infrastructure/`)

Handles external service integrations and data access.

**Files:**
- `strava-client.ts` - Strava API client for OAuth and activity fetching
- `athlete-repository.ts` - Supabase database operations for athlete data
- `index.ts` - Barrel export for infrastructure components

**Purpose:** Abstracts external API calls and database operations. Only depends on the domain layer.

**Key Classes:**
- `StravaClient` - Handles all Strava API interactions (OAuth, token refresh, activity fetching)
- `AthleteRepository` - Manages athlete data persistence in Supabase

### 3. Services Layer (`src/services/`)

Contains business logic and orchestrates infrastructure components.

**Files:**
- `auth-service.ts` - OAuth flow and athlete registration
- `token-service.ts` - Token management and refresh logic
- `activity-service.ts` - Activity fetching with authentication
- `webhook-service.ts` - Webhook event processing
- `index.ts` - Barrel export for services

**Purpose:** Implements business rules and coordinates between infrastructure components.

**Key Classes:**
- `AuthService` - Manages OAuth authorization flow
- `TokenService` - Ensures valid access tokens (auto-refresh when needed)
- `ActivityService` - Fetches activities with proper authentication
- `WebhookService` - Processes incoming Strava webhook events

### 4. Routes Layer (`src/routes/`)

HTTP route handlers and Express router configuration.

**Files:**
- `auth-routes.ts` - Authentication routes (/, /auth/strava, /auth/callback)
- `webhook-routes.ts` - Webhook routes (/import for GET and POST)
- `index.ts` - Barrel export for routes

**Purpose:** Handles HTTP requests/responses and delegates to services.

**Endpoints:**
- `GET /` - Home page with Strava connect button
- `GET /auth/strava` - Initiates OAuth flow
- `GET /auth/callback` - OAuth callback handler
- `GET /import` - Webhook verification
- `POST /import` - Webhook event handler

### 5. Application Entry (`src/index.ts`)

Initializes and wires all components together.

**Responsibilities:**
- Load environment variables
- Initialize infrastructure (Supabase client, Strava client)
- Create service instances with proper dependency injection
- Register routes with Express app
- Export configured Express app

## Dependency Flow

```
index.ts
  ↓
routes/ (depends on services/)
  ↓
services/ (depends on infrastructure/ and domain/)
  ↓
infrastructure/ (depends on domain/)
  ↓
domain/ (no dependencies)
```

## Key Design Patterns

1. **Dependency Injection**: Services and routes receive their dependencies through constructors
2. **Repository Pattern**: `AthleteRepository` abstracts database operations
3. **Client Pattern**: `StravaClient` encapsulates all Strava API interactions
4. **Factory Functions**: Routes are created by factory functions (`createAuthRouter`, `createWebhookRouter`)
5. **Layered Architecture**: Clear separation between domain, infrastructure, services, and presentation

## Adding New Features

### To add a new endpoint:
1. Define types in `domain/api-types.ts`
2. Create or update a route factory in `routes/`
3. Register the route in `index.ts`

### To add new business logic:
1. Define domain types in `domain/types.ts` if needed
2. Create a new service in `services/`
3. Inject required infrastructure dependencies
4. Use from routes

### To integrate a new external service:
1. Create a client class in `infrastructure/`
2. Define domain types for the service data
3. Use the client from services layer

## Benefits

- **Maintainability**: Clear separation of concerns makes code easier to understand and modify
- **Testability**: Each layer can be tested independently with mocked dependencies
- **Scalability**: Easy to add new features without affecting existing code
- **Type Safety**: TypeScript types throughout ensure compile-time checking
- **Reusability**: Infrastructure and service components can be reused across routes
