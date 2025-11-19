# AI Tutor Chat

An AI-powered science learning companion built with Next.js 16, TypeScript, and the Vercel AI SDK.

## Features

- Interactive AI chat interface for science topics
- Flashcard generation using AI tools
- Real-time streaming responses
- Support for Physics, Chemistry, and Biology subjects
- Responsive design with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **AI Integration**: Vercel AI SDK with OpenAI provider
- **LLM Provider**: OpenAI GPT-4.o mini (via Vercel AI SDK)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   
4. Add your OpenAI API key to `.env.local`:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Build

Build the application for production:

```bash
npm run build
```

### Project Structure

```
src/
├── app/                 # Next.js App Router pages and API routes
│   ├── api/chat/       # Chat API endpoint
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # React components
│   ├── ChatInterface.tsx
│   ├── FlashcardViewer.tsx
│   └── index.ts
├── lib/               # Configuration and utilities
│   └── config.ts
├── types/             # TypeScript type definitions
│   └── index.ts
└── utils/             # Utility functions
    └── index.ts
```

## Implementation Status

- [x] Project setup and dependencies (using Vercel AI SDK only)
- [x] Core data models and types (basic structure implemented)
- [x] Chat API endpoint with streaming
- [x] Flashcard generation tool
- [x] Chat interface component
- [x] Flashcard viewer component
- [x] Integration and state management
- [x] Error handling
- [x] Responsive design
- [x] Deployment configuration

## Key Dependencies

- `ai` - Vercel AI SDK core package
- `@ai-sdk/openai` - OpenAI provider for Vercel AI SDK

## License

This a simple prototype assignment for pallo. 