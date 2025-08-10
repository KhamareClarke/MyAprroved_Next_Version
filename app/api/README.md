# API Endpoints

This directory contains the API routes for the Trades Platform.

## Available Endpoints

### 1. Estimate Job Cost

- **Endpoint:** `POST /api/estimate`
- **Description:** Get an AI-powered cost estimate for a job description
- **Request Body:**
  ```json
  {
    "description": "string"
  }
  ```
- **Response:**
  ```json
  {
    "estimate": "string"
  }
  ```

### 2. Submit Lead

- **Endpoint:** `POST /api/leads`
- **Description:** Submit a new lead with contact information and job details
- **Request Body:**
  ```json
  {
    "name": "string | null",
    "email": "string",
    "phone": "string | null",
    "trade": "string",
    "postcode": "string",
    "description": "string",
    "estimate": "string"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Lead submitted successfully",
    "data": {}
  }
  ```

## Environment Variables

The following environment variables need to be set for the API to work properly:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `OPENAI_API_KEY`: (Optional) Your OpenAI API key for real AI estimates

## Error Handling

All API endpoints return appropriate HTTP status codes and error messages in the following format:

```json
{
  "error": "string",
  "message": "string"
}
```

## Rate Limiting

Consider implementing rate limiting in production to prevent abuse of the API endpoints. This can be done using a middleware like `next-rate-limiter` or at the server level.
