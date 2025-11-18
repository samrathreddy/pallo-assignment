import { NextRequest } from 'next/server';

// Placeholder API route - will be implemented in task 3
// This will use Vercel AI SDK with streamText for real-time responses
export async function POST(req: NextRequest) {
  return new Response(
    JSON.stringify({ 
      message: 'Chat API endpoint, will implement later :)' 
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}