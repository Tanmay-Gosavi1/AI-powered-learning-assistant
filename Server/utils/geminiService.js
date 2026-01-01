import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

if (!process.env.GEMINI_API_KEY) {
  console.error('FATAL ERROR: GEMINI_API_KEY is not set in the environment variables.');
  process.exit(1);
}

/**
 * Generate flashcards from text
 * @param {string} text - Document text
 * @param {number} count - Number of flashcards to generate
 * @returns {Promise<Array<{question: string, answer: string, difficulty: string}>>}
 */
export const generateFlashcards = async (text, count = 10) => {
  const prompt = `Generate exactly ${count} educational flashcards from the following text.
Format each flashcard as:
Q: (Clear, specific question)
A: (Concise, accurate answer)
D: (Difficulty level: easy, medium, or hard)

Separate each flashcard with "---"

Text:
${text.substring(0, 15000)}`;

  try {
    const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: prompt,
  });

  const generatedText = response.text;

  // Parse the response
  const flashcards = [];
  const cards = generatedText.split('---').filter(c => c.trim());

  for (const card of cards) {
    const lines = card.trim().split('\n');
    let question = '', answer = '', difficulty = 'medium';

    for (const line of lines) {
      if (line.startsWith('Q:')) {
        question = line.substring(2).trim();
      } else if (line.startsWith('A:')) {
        answer = line.substring(2).trim();
      } else if (line.startsWith('D:')) {
        const diff = line.substring(2).trim().toLowerCase();
        if (['easy', 'medium', 'hard'].includes(diff)) {
          difficulty = diff;
        }
      }
    }

    if (question && answer) {
      flashcards.push({ question, answer, difficulty });
    }
  }
    return flashcards.slice(0, count);
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to generate flashcards');
  }
};

/**
 * Generate quiz questions
 * @param {string} text - Document text
 * @param {number} numQuestions - Number of questions
 * @returns {Promise<Array<{question: string, options: Array, correctAnswer: string, explanation: string, difficulty: string}>>}
 */
export const generateQuiz = async (text, numQuestions = 5) => {
  const prompt = `Generate exactly ${numQuestions} multiple choice questions from the following text.
Format each question as:
Q: (Question)
O1: (Option 1)
O2: (Option 2)
O3: (Option 3)
O4: (Option 4)
C: (Correct option - exactly as written above)
E: (Brief explanation)
D: (Difficulty: easy, medium, or hard)

Separate questions with "---"

Text:
  ${text.substring(0, 15000)}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    const generatedText = response.text;

    const questions = [];
    const questionBlocks = generatedText.split('---').filter(q => q.trim());

    for (const block of questionBlocks) {
      const lines = block.trim().split('\n');
      let question = '', options = [], correctAnswer = '', explanation = '', difficulty = 'medium';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('Q:')) {
          question = trimmed.substring(2).trim();
        } else if (trimmed.match(/^O\d:/)) {
          options.push(trimmed.substring(3).trim());
        } else if (trimmed.startsWith('C:')) {
          correctAnswer = trimmed.substring(2).trim();
        } else if (trimmed.startsWith('E:')) {
          explanation = trimmed.substring(2).trim();
        } else if (trimmed.startsWith('D:')) {
                    } else if (trimmed.startsWith('D:')) {
          const diff = trimmed.substring(2).trim().toLowerCase();
          if (['easy', 'medium', 'hard'].includes(diff)) {
            difficulty = diff;
          }
        }
      }

      if (question && options.length === 4 && correctAnswer) {
        questions.push({ question, options, correctAnswer, explanation, difficulty });
      }
    }

    return questions.slice(0, numQuestions);
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to generate quiz');
  }
};

/**
 * Generate document summary
 * @param {string} text - Document text
 * @returns {Promise<string>}
 */
export const generateSummary = async (text) => {
  const prompt = `Provide a concise summary of the following text, highlighting the key concepts, main ideas, and
Keep the summary clear and structured.

Text:
${text.substring(0, 20000)}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });
    const generatedText = response.text;
    return generatedText;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to generate summary');
  }
};


export const chatWithContext = async (question, chunks) => {
  if (!chunks || chunks.length === 0) {
    return "I don't have any relevant context to answer your question. Please make sure the document is properly processed.";
  }

  const context = chunks.map((c, i) => {
    const content = c.content || '';
    return `--- Context Chunk ${i + 1} ---\n${content.trim()}`;
  }).join('\n\n');

  const prompt = `You are an AI assistant helping users understand document content. Based ONLY on the following context from a document, provide a helpful and detailed answer to the user's question.

IMPORTANT INSTRUCTIONS:
- Use the provided context to answer the question
- If the context contains relevant information, provide a comprehensive answer
- Be specific and reference the content when possible
- If the context truly doesn't contain the requested information, then say so
- Don't make assumptions beyond what's in the context

CONTEXT FROM DOCUMENT:
${context}

---

USER QUESTION: ${question}

PLEASE PROVIDE A DETAILED ANSWER BASED ON THE CONTEXT ABOVE:`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });
    const generatedText = response.text;
    return generatedText;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to process chat request');
  }
};


export const explainConcept = async (concept, context) => {
  const prompt = `Explain the concept of "${concept}" based on the following context.
Provide a clear, educational explanation that's easy to understand.
Include examples if relevant.

Context:
${context.substring(0, 10000)}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });
    const generatedText = response.text;
    return generatedText;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to explain concept');
  }
};
