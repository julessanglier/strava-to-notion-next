# Notion Database Setup Guide

This guide will help you set up a Notion database to work with the Strava to Notion integration.

## Step 1: Create a Notion Integration

1. Go to [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Click **"+ New integration"**
3. Give it a name (e.g., "Strava Activities")
4. Select the workspace where you want to use it
5. Click **"Submit"**
6. Copy the **Internal Integration Token** - this is your `NOTION_API_KEY`

## Step 2: Create a Notion Database

1. Open Notion and create a new page
2. Add a **Database - Full page** or **Database - Inline**
3. Name your database (e.g., "Strava Activities")

## Step 3: Add Database Properties

Add the following properties to your database with the exact names shown:

| Property Name        | Property Type | Description                          |
|---------------------|---------------|--------------------------------------|
| **Name**            | Title         | Activity name (auto-created)         |
| **Activity Type**   | Select        | Run, Ride, Swim, etc.               |
| **Distance**        | Number        | Distance in kilometers               |
| **Duration**        | Number        | Duration in minutes                  |
| **Pace**            | Number        | Pace in min/km (running only)        |
| **Elevation Gain**  | Number        | Total elevation gain in meters       |
| **Start Date**      | Date          | Activity start date                  |
| **Average Speed**   | Number        | Average speed in km/h                |
| **Max Speed**       | Number        | Maximum speed in km/h                |
| **Average Heart Rate** | Number     | Average heart rate in bpm            |
| **Max Heart Rate**  | Number        | Maximum heart rate in bpm            |
| **Calories**        | Number        | Estimated calories burned            |
| **Strava Link**     | URL           | Link to activity on Strava           |
| **Activity ID**     | Number        | Strava activity ID                   |

### Quick Setup Tips:

- The **Name** property is automatically created as the title
- For **Activity Type**, you can pre-populate common values like: Run, Ride, Swim, Walk, Hike, etc.
- Number properties don't need any special formatting
- The **Date** property should be set to "Date" type (not "Date & Time")

## Step 4: Share Database with Integration

1. Open your database in Notion
2. Click the **"..."** menu in the top right
3. Scroll down and click **"Connections"** or **"Add connections"**
4. Select your integration (e.g., "Strava Activities")
5. Click **"Confirm"**

## Step 5: Get Database ID

1. Open your database as a full page
2. Look at the URL in your browser
3. The database ID is the long string of characters after your workspace name and before the `?`

Example URL:
```
https://www.notion.so/myworkspace/abc123def456?v=...
                                 ^^^^^^^^^^^^ This is your database ID
```

4. Copy the database ID - this is your `NOTION_DATABASE_ID`

## Step 6: Configure Environment Variables

Add these to your environment variables (in Vercel, `.env` file, etc.):

```bash
NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DATABASE_ID=abc123def456789
```

## Testing the Integration

Once configured:

1. Connect your Strava account to the app
2. Complete a new activity on Strava
3. The activity should automatically appear in your Notion database within seconds
4. Check the Vercel logs if activities aren't appearing

## Troubleshooting

- **"Database not found"**: Make sure you shared the database with your integration
- **"Invalid database ID"**: Double-check you copied the correct ID from the URL
- **"Unauthorized"**: Verify your API key is correct
- **Missing data**: Some fields (heart rate, calories) may not be available for all activities

## Optional: Customize Your Database

You can add additional properties to your Notion database:
- Formula properties to calculate speed from distance/time
- Rollup properties to see monthly/yearly totals
- Relation properties to link to training plans
- Tags for workout types or goals

The integration will only populate the standard fields listed above.
