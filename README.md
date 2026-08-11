# PrepMate – Deep Implementation Guide

PrepMate is an AI-powered learning assistant built to turn uploaded PDFs into an interactive study experience. The main idea is simple: users upload a document, the app extracts its content, stores it in a structured way, and then uses that content to power chat, flashcards, quizzes, summaries, and progress tracking.

Live demo: https://prepmate-study-buddy.onrender.com/

---

## 1. What this project is really doing

This project combines four major ideas:

1. Document ingestion
   - A user uploads a PDF.
   - The app extracts the text.
   - The text is split into smaller chunks for retrieval.

2. Retrieval-based AI assistance
   - When a user asks a question, the app finds the most relevant chunks from the uploaded document.
   - Those chunks are sent to Gemini with the question.
   - This makes the answer grounded in the user’s own notes instead of a generic AI response.

3. Active learning tools
   - The app generates flashcards, quizzes, and summaries from the document content.
   - These tools are designed to help students revise and remember better.

4. Learning analytics
   - The app tracks what the user studied, how they performed on quizzes, and how their streak grows.

---

## 2. The big picture architecture

At a high level, the app works like this:

Client page -> Service layer -> API route -> Auth middleware -> Controller -> Model/Database -> AI service -> Response back to UI

A simple flow looks like this:

```text
React page
  -> docService / aiService / authService
  -> axiosInstance (adds auth token, base URL)
  -> Express route
  -> auth middleware
  -> controller
  -> MongoDB model
  -> utility functions (PDF parser, chunker, Gemini service)
  -> JSON response back to client
```

This is a classic layered architecture:

- Frontend: React pages and UI components
- Service layer: API wrappers for each feature
- Backend: Express routes and controllers
- Data layer: MongoDB models
- Intelligence layer: Gemini API calls and text chunking logic

---

## 3. Frontend structure and how it behaves

The frontend is organized around feature pages:

- Document management
  - DocumentListPage: shows the user’s uploaded documents and allows upload/delete actions.
  - DocumentDetailPage: opens a document and shows the full document experience.

- AI learning tools
  - ChatInte rface: lets the user chat with the document.
  - AiAction: provides quick actions like summarizing, explaining a concept, generating flashcards, and generating quizzes.

- Flashcards
  - FlashcardManager: shows flashcard sets and allows generation, deletion, and starred card actions.

- Quizzes
  - QuizManager and QuizResult: manage quiz generation, quiz submission, and results.

- Dashboard
  - The progress dashboard shows counts and recent activity.

### How the frontend talks to the backend

The frontend does not call the backend directly. It uses service modules:

- docService.js for document operations
- aiService.js for AI features
- authService.js for login/signup/profile
- quizService.js, flashcardService.js, progressService.js for their respective areas

These service modules call axiosInstance, which:

- adds the JWT token from localStorage to the Authorization header
- uses the base API URL from environment variables
- handles common error behavior

This gives the app a clean and centralized way to communicate with the server.

---

## 4. Backend architecture

The backend is a Node.js + Express server with clear separation:

- routes: define API endpoints
- controllers: handle request logic
- models: define MongoDB schema and data shape
- utils: hold reusable logic like PDF parsing, chunking, and Gemini integration
- middlewares: handle authentication and error handling

### Request lifecycle

Every request usually follows this path:

1. Client sends an HTTP request
2. Express route matches the URL
3. Auth middleware checks the JWT token
4. Controller performs business logic
5. Model interacts with MongoDB
6. Response is returned as JSON

---

## 5. Authentication flow

Authentication is handled by the protect middleware.

How it works:

1. The frontend sends a Bearer token in the Authorization header.
2. The middleware reads it.
3. It verifies the token using JWT_SECRET.
4. If valid, it attaches req.user with the decoded user information.
5. The request continues to the controller.

If no token is present or the token is invalid, the request is rejected with a 401 error.

Why this matters:
- every user’s documents, flashcards, quizzes, and chat history stay private
- the backend never mixes one user’s data with another user’s data

---

## 6. Upload PDF flow: from button click to database entry

This is the most important feature of the project.

### Step-by-step

1. User opens the document list page.
2. They click Upload Document and select a PDF.
3. The document list page builds a FormData object with:
   - the file
   - the title
4. The request goes to docService.uploadDocument.
5. axiosInstance sends the request to /api/docs/upload.
6. The route matches the upload endpoint.
7. The auth middleware verifies the token.
8. The uploadDoc controller runs.

### What the controller does

Inside uploadDoc:

- checks that a file exists
- validates that the file is a PDF
- checks size limits
- validates that a title was provided
- preserves the temporary file path
- uploads the file to Cloudinary
- creates a new Document record in MongoDB with status = processing
- starts background processing of the PDF

### Why Cloudinary is used

Cloudinary stores the original uploaded file so the application can keep a reliable file URL and avoid relying only on local server storage.

### Why the app does not block the request on extraction

The PDF processing step is started asynchronously after the document record is created. This means the user gets an immediate response, and the app can continue working while the document is being processed in the background.

### What happens during background processing

The processPDF helper does the following:

- reads the temporary PDF file
- extracts text using PDF parsing
- splits the text into chunks
- updates the Document record with:
  - extractedText
  - chunks
  - status = ready

If processing fails, the document is marked as failed.

### Why this strategy is good

- faster user experience
- the app feels responsive
- the document becomes usable as soon as the content is ready
- the system can handle larger files without locking the upload request

---

## 7. How the PDF text becomes usable for AI

Once the PDF is processed, the extracted text is not used directly for every question. Instead, it is split into chunks.

### Why chunking is needed

Large documents are too big to send as-is to Gemini every time. Chunking helps the app:

- reduce token usage
- keep answers focused
- improve relevance
- lower cost and latency

### How chunking works

The chunkText utility:

- normalizes whitespace and paragraph breaks
- splits text into paragraphs
- creates chunks of a target size
- adds small overlap between chunks so nearby content remains connected

### How retrieval works

When the user asks a question, the app uses findReleventChunks:

- removes common stop words
- scores chunks based on keyword overlap
- ranks the most relevant chunks
- sends only the top few chunks to Gemini

This makes the chat experience more grounded and efficient.

---

## 8. Chat flow: from UI to AI response

The chat flow is one of the most important parts of the app.

### Frontend

The ChatInterface component:

- collects the user’s message
- stores it in local UI state
- sends the message to aiService.chat

### Service layer

aiService.chat sends a request to:

- POST /api/ai/chat

### Backend

The aiController.chat function:

- checks that the document ID and question exist
- confirms that the document is ready
- finds relevant chunks for the question
- loads or creates chat history for that document
- sends the question and chunks to Gemini
- saves the exchange to the database
- returns the answer to the frontend

### Why the app stores chat history

This allows:

- conversation continuity
- better user experience
- document-specific memory for later follow-up questions

---

## 9. Flashcard flow

The flashcard feature also starts from the document.

### Flow

1. The user clicks Generate Flashcards from the document view.
2. The frontend calls aiService.generateFlashcards.
3. The backend controller checks whether the document exists and is ready.
4. Gemini generates flashcards from the extracted text.
5. The backend stores the result in the Flashcard model.

### Data shape

Each flashcard set contains:

- userId
- documentId
- cards[]

Each card contains:

- question
- answer
- difficulty
- isStarred

### Why this design is useful

It keeps flashcards tied to a specific document and user, which is perfect for personalized revision.

---

## 10. Quiz flow

Quizzes follow the same pattern.

### Flow

1. The UI requests quiz generation.
2. The controller verifies the document exists and is ready.
3. The app asks Gemini to create quiz questions.
4. The questions are stored in the Quiz model.
5. Later, when the user submits answers, the backend scores them and saves the result.

### Why quiz submission is important

The app is not only generating questions; it is also storing:

- user answers
- correctness
- score
- completion time

This allows the app to show results and support future analytics.

---

## 11. Dashboard and progress tracking

The dashboard is built from a few simple but important data sources:

- total documents uploaded
- total flashcard sets
- total quizzes
- completed quizzes
- average score
- study streak
- recent activity

The progressController gathers this data by querying the database and computing a few derived values.

### Study streak logic

The app tracks the last study date and increments or resets the streak based on whether the user studied today, yesterday, or longer ago.

This is an example of simple behavioral analytics that keeps the app motivating and useful.

---

## 12. Core data models

### Document
Stores:
- userId
- title
- filePath
- fileName
- fileSize
- extractedText
- chunks
- status

This is the central record for each uploaded document.

### Flashcard
Stores:
- userId
- documentId
- cards

This keeps flashcards organized by document.

### Quiz
Stores:
- userId
- documentId
- title
- questions
- userAnswers
- score
- completedAt

This supports quiz history and results.

### ChatHistory
Stores chat exchanges per document and user.

---

## 13. Why the architecture was chosen

This project uses a practical and maintainable structure:

- React for interactive UI
- Express for simple backend APIs
- MongoDB for flexible document-based storage
- Gemini for AI generation and explanation
- JWT for user security

This is a solid choice for a learning app because it is:

- easy to understand
- fast to build
- flexible for future feature additions
- good for a student-focused product

---

## 14. What is happening under the hood in one sentence

A user uploads a PDF, the app stores it, extracts and chunks its content, and then uses that content to support chat, flashcards, quizzes, summaries, and progress tracking through a secure request pipeline.

---

## 15. Scope for improvement

This project already has a strong foundation, but there are several areas where it can be improved.

### High-impact improvements

1. Background job queue
   - Move PDF processing and AI generation to a job queue instead of handling them directly in the request flow.
   - This will make the app more reliable and scalable.

2. Better progress tracking
   - Show upload and processing status more clearly in the UI.
   - Add progress bars for PDF extraction and AI generation.

3. Caching and reuse
   - Cache generated flashcards, summaries, and quiz content for the same document to avoid repeated API usage.

4. Better retrieval quality
   - Use embeddings and vector search instead of only keyword-based chunk matching.
   - This would make AI answers more accurate and context-aware.

5. Better file handling
   - Support more file types such as DOCX and TXT.
   - Add better validation and malware checks.

6. Better observability
   - Add logging, request tracing, and proper error dashboards.

7. Performance optimization
   - Add indexes where needed.
   - Reduce repeated database lookups.
   - Optimize large document chunking logic.

8. User experience improvements
   - Show document processing state clearly.
   - Add retry actions for failed AI generation.
   - Improve empty states and error messages.

---

## 16. Recommended mental model for understanding the project

If you want to understand this project quickly, think of it in three layers:

- Layer 1: Content layer
  - documents, text, chunks, flashcards, quizzes

- Layer 2: Intelligence layer
  - Gemini prompts, retrieval logic, summarization, explanation

- Layer 3: Experience layer
  - chat UI, dashboard, document pages, learning actions

If you understand those three layers, the rest of the project becomes much easier to follow.

---

## 17. Short summary

PrepMate is a document-first AI learning app. The core flow is:

- upload PDF
- extract and chunk text
- store the document in MongoDB
- retrieve relevant content when the user asks questions or requests AI features
- generate flashcards, quizzes, and summaries from that content
- track study progress over time

That is the heart of the system.

