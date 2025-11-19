# AI Tutor Chat

A mini AI tutor for science subjects, built as a prototype to showcase a functional learning feature. This application provides an AI-powered chat that can answer student queries and generate flashcards on demand.

**Live Demo:** [https://pallo.vercel.app/](https://pallo.vercel.app)

---

## Architecture Overview

This project is a full-stack application built with **Next.js** (App Router) and **TypeScript**. It leverages the **Vercel AI SDK** for seamless integration with large language models.

-   **Frontend**: Built with **React** and styled with **Tailwind CSS**. The UI is composed of several key components:
    -   `ChatInterface`: Manages the conversation flow, renders messages, and handles user input.
    -   `FlashcardDrawer` & `FlashcardViewer`: Displays the generated flashcards in either a single-card or grid view.
    -   `Sidebar`: Allows for managing and switching between different chat sessions.
    -   The main `page.tsx` acts as the central hub, managing the application's state (messages, flashcards, chats) using React hooks.

-   **Backend**: Implemented using **Next.js API Routes**. A single endpoint (`/api/chat`) handles all communication with the AI model.
    -   It receives the chat history from the client.
    -   It uses the **Vercel AI SDK**'s `streamText` function to get a streaming response from an **OpenAI** model.
    -   It defines and executes a tool, `generateFlashcards`, which the AI can call based on user intent.

-   **AI & Tooling**:
    -   **Vercel AI SDK**: Simplifies handling streaming responses and enables robust tool-calling functionality.
    -   **OpenAI**: The LLM provider used for generating chat responses and flashcard content.
    -   **`generateFlashcards` Tool**: A server-side function the AI can invoke. When called, it uses the AI to generate question-answer pairs on a given topic and returns them to the client.

### Data Flow

1.  A user sends a message from the `ChatInterface`.
2.  The main page component sends the message history to the `/api/chat` endpoint.
3.  The API route forwards the request to the OpenAI model via the Vercel AI SDK.
4.  The response is streamed back to the client:
    -   Text responses are sent as token-by-token chunks.
    -   If the `generateFlashcards` tool is called, the resulting flashcard data is sent as a separate chunk after the tool executes.
5.  The frontend processes the stream, rendering the AI's text response in real-time and displaying the newly created flashcards in the `FlashcardDrawer`.

---

## Design Decisions

-   **Framework Choice**: **Next.js (App Router)** was chosen for its integrated front-end and back-end capabilities. This allowed for rapid development with a unified codebase, server-side rendering benefits, and simple API route creation.

-   **AI Integration**: The **Vercel AI SDK** was a clear choice due to its first-class support for streaming UI updates and its elegant API for defining and handling AI tools. This avoided the complexity of manually managing streaming connections and tool-call logic.

-   **State Management**: For this prototype, state is managed locally within the main page component using React's `useState`, `useCallback`, and `useEffect` hooks. This approach is simple and effective for the current scale of the application, avoiding the overhead of external state management libraries like Redux or Zustand.

-   **Component-Based UI**: The UI is broken down into logical components (`ChatInterface`, `FlashcardViewer`, `Sidebar`), promoting reusability and separation of concerns. This makes the codebase cleaner and easier to maintain.

-   **Custom Streaming Protocol**: The backend sends data chunks with prefixes (`0:` for text, `2:` for tool results). This simple protocol allows the frontend to easily distinguish between different types of streaming data and handle them accordingly, ensuring that both text and flashcards are processed correctly.

---

## What Was Not Built (and Why)

To deliver a functional prototype within the given timeframe, several features were intentionally left out of scope:

-   **Database & Persistence**: Chat history and flashcards are stored in the browser's memory and are lost upon refreshing the page. A production-ready application would require a database (e.g., PostgreSQL, MongoDB) to persist user data.
-   **User Authentication**: The application is anonymous. Implementing user accounts would be a necessary next step to save and sync a student's learning progress across devices.
-   **Advanced Flashcard Features**: The flashcard viewer is basic. Features like spaced repetition, editing cards, organizing decks, or tracking study progress were not implemented, as the core requirement was to simply generate and display them.
-   **More AI Tools**: The assignment required one tool, so only `generateFlashcards` was built. A more advanced tutor could include tools for summarizing text, searching for external resources, or creating quizzes.

---

## Tradeoffs Due to Time

-   **Simplified State Management**: While sufficient for the prototype, using only local component state means that passing state and callbacks between components can become cumbersome as the application grows. A shared state management solution would be more scalable.
-   **Minimal UI/UX Polish**: The focus was on functionality over aesthetics. While the UI is clean and responsive, more time could have been spent on animations, micro-interactions, and a more distinct visual identity.
-   **Limited Error Handling on UI**: The backend includes robust error logging and handling, but the frontend only displays generic error messages. A more polished app would provide more specific and user-friendly feedback for different types of errors (e.g., network issues, API key errors, tool failures).
-   **No Automated Testing**: The project was tested manually to ensure it met all functional requirements. Due to the tight deadline, no unit or end-to-end tests (using frameworks like Jest or Cypress) were written.

---

## Getting Started

### Prerequisites

-   Node.js 18+
-   An OpenAI API key

### Installation

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up your environment variables by copying the example file:
    ```bash
    cp .env.example .env.local
    ```
4.  Add your OpenAI API key to the `.env.local` file:
    ```
    OPENAI_API_KEY=your_openai_api_key_here
    ```

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.