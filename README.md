# Trades Platform

A modern platform connecting customers with local tradespeople. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- Smart search with autocomplete for trade categories
- UK postcode validation
- AI-powered job cost estimation (mock implementation)
- Responsive design
- Multi-step lead capture form
- Supabase integration for data storage

## Prerequisites

- Node.js 16.14.0 or later
- npm or yarn
- Supabase account (for production)
- OpenAI API key (for real AI estimates)

## Getting Started

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd trades
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables
   - Copy `.env.local.example` to `.env.local`
   - Fill in your Supabase credentials
   - (Optional) Add your OpenAI API key for real AI estimates

4. Run the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI (optional)
OPENAI_API_KEY=your_openai_api_key
```

## Supabase Setup

1. Create a new project in Supabase
2. Create a `leads` table with the following SQL:
   ```sql
   create table leads (
     id bigint primary key generated always as identity,
     name text,
     email text not null,
     phone text,
     trade text not null,
     postcode text not null,
     description text not null,
     estimate text,
     status text not null default 'new',
     created_at timestamptz not null default now()
   );
   ```
3. Enable Row Level Security (RLS) and create policies as needed

## Project Structure

- `/app` - Next.js app router pages and layouts
- `/components` - Reusable React components
- `/lib` - Utility functions and configurations
- `/public` - Static assets
- `/styles` - Global styles and Tailwind configuration

## Tech Stack

- [Next.js](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type checking
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Supabase](https://supabase.com/) - Backend as a Service
- [Lucide Icons](https://lucide.dev/) - Icons
- [OpenAI API](https://openai.com/api/) - AI-powered estimates (optional)

## License

This project is licensed under the MIT License.
