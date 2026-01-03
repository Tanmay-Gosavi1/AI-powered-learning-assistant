import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Model configuration for different tasks
const MODELS = {
  CHAT: 'gemini-2.5-flash-lite',      // For Chat / Q&A
  FLASHCARDS: 'gemini-2.5-flash',           // For Flashcards generation
  QUIZ: 'gemini-2.5-flash',                 // For Quiz generation
  SUMMARY: 'gemini-2.5-flash',              // For Summary generation
  EXPLAIN: 'gemini-2.5-flash-lite',   // For Concept explanation
};

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
  const prompt = `You are an expert educator creating study flashcards. Generate exactly ${count} high-quality flashcards based on the content provided.

IMPORTANT GUIDELINES:
- Create questions about the ACTUAL CONCEPTS, FACTS, and IDEAS in the content
- NEVER mention "chapter", "section", "page", "document", "text", "passage", "chunk", or any structural references
- NEVER ask questions like "What is discussed in..." or "According to the text..."
- Use SIMPLE, CLEAR language that students can easily understand
- Questions should test understanding of the subject matter itself
- Answers should be direct and informative

GOOD EXAMPLE:
Q: What is photosynthesis?
A: The process by which plants convert sunlight, water, and carbon dioxide into glucose and oxygen.
D: easy

BAD EXAMPLE (DO NOT DO THIS):
Q: What algorithm is described in Chapter 11?
A: The text mentions the sorting algorithm.

Format each flashcard as:
Q: (Clear question about the concept itself)
A: (Direct, helpful answer)
D: (Difficulty: easy, medium, or hard)

Separate each flashcard with "---"

Content to learn from:
${text.substring(0, 15000)}`;

  try {
    const response = await ai.models.generateContent({
    model: MODELS.FLASHCARDS,
    contents: prompt,
  });

  const generatedText = response.text;
  console.log('Generated Flashcards Text:', generatedText);

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
    if (error.status === 429) {
      throw new Error('API rate limit exceeded. Please wait a moment and try again.');
    }
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
  const prompt = `You are an expert educator creating a quiz. Generate exactly ${numQuestions} multiple choice questions based on the content provided.

IMPORTANT GUIDELINES:
- Create questions about the ACTUAL CONCEPTS, FACTS, and IDEAS in the content
- NEVER mention "chapter", "section", "page", "document", "text", "passage", "chunk", or any structural references
- NEVER ask questions like "According to the text..." or "What does the author mention..."
- Use SIMPLE, CLEAR language that students can easily understand
- Questions should test real understanding of the subject matter
- All 4 options should be plausible but only one correct
- Explanations should teach WHY the answer is correct

GOOD EXAMPLE:
Q: What is the primary function of mitochondria in a cell?
O1: Produce energy (ATP)
O2: Store genetic information
O3: Break down waste products
O4: Control cell division
C: Produce energy (ATP)
E: Mitochondria are known as the powerhouse of the cell because they generate ATP through cellular respiration.
D: medium

BAD EXAMPLE (DO NOT DO THIS):
Q: What concept is explained in the first section?
O1: The chapter discusses algorithms
...

Format each question as:
Q: (Clear question about the concept itself)
O1: (Option 1)
O2: (Option 2)
O3: (Option 3)
O4: (Option 4)
C: (Correct option - exactly as written above)
E: (Brief explanation of why this is correct)
D: (Difficulty: easy, medium, or hard)

Separate questions with "---"

Content to create quiz from:
  ${text.substring(0, 15000)}`;

  try {
    const response = await ai.models.generateContent({
      model: MODELS.QUIZ,
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
  const prompt = `Create a clear, well-organized summary of the following content.

GUIDELINES:
- Focus on the KEY CONCEPTS, MAIN IDEAS, and IMPORTANT FACTS
- Use simple, easy-to-understand language
- Structure the summary with clear sections or bullet points
- Do NOT reference "the document", "the text", "the author mentions", etc.
- Write as if you're teaching the concepts directly to a student
- Highlight practical takeaways and important definitions

Content to summarize:
${text.substring(0, 20000)}`;

  try {
    const response = await ai.models.generateContent({
      model: MODELS.SUMMARY,
      contents: prompt,
    });
    const generatedText = response.text;
    return generatedText;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to generate summary');
  }
};


export const chatWithContext = async (question, chunks, mode = 'hybrid') => {
  const hasContext = chunks && chunks.length > 0;
  
  const context = hasContext 
    ? chunks.map((c) => {
        const content = c.content || '';
        return content.trim();
      }).join('\n\n')
    : '';

  // Check if it's a greeting
  const greetingPatterns = /^(hi|hello|hey|hii|hiii|good morning|good afternoon|good evening|sup|yo|hola|greetings)[!?.\s]*$/i;
  const isGreeting = greetingPatterns.test(question.trim());

  let prompt;

  if (isGreeting) {
    prompt = `You are a friendly Prepmate AI assistant. The student just greeted you with: "${question}"

Respond warmly and naturally! Introduce yourself briefly as their AI study assistant and ask how you can help them with their studies today. Keep it short, friendly, and encouraging.`;
  } else if (mode === 'strict') {
    // STRICT MODE: Only from PDF content
    prompt = `You are a helpful AI study assistant operating in STRICT MODE (Exam-Safe Mode).

IMPORTANT RULES FOR STRICT MODE:
- Answer ONLY using information from the study material provided below
- If the study material does not contain enough information to answer the question, respond politely:
  "I don't have enough information about this in your study notes. This topic might not be covered in your current material, or you may want to check other sections."
- Do NOT add any information from your general knowledge
- This mode is designed for exam preparation where only the course material matters
- Use simple, clear language
- NEVER mention "document", "text", "passage", "context", "chunks", "PDF", etc.
- Speak as if you're a tutor who has read their notes

${hasContext ? `STUDY MATERIAL (Your ONLY source of information):
${context}

---` : 'No study material available for this query.'}

STUDENT'S QUESTION: ${question}

ANSWER USING ONLY THE STUDY MATERIAL ABOVE:`;
  } else {
    // HYBRID MODE: PDF first, then supplement with general knowledge
    prompt = `You are a friendly, expert AI tutor helping a student learn. You are in HYBRID MODE.

YOUR APPROACH:
1. FIRST, check if the study material below covers the topic
2. If it does, use that as your PRIMARY source
3. If the study material is incomplete or lacks depth, SUPPLEMENT with your expert knowledge
4. When adding information beyond the study material, clearly indicate it by saying something like:
   - "Additionally, here's some more context..."
   - "To expand on this further..."
   - "Beyond what's in your notes..."

RESPONSE GUIDELINES:
- Give thorough, in-depth explanations with examples
- Use simple, clear language
- Be friendly, encouraging, and supportive
- NEVER mention "document", "text", "passage", "context", "chunks", "PDF", etc.
- Respond naturally as a knowledgeable tutor
- Make it clear when you're adding supplementary knowledge

${hasContext ? `STUDY MATERIAL FOR REFERENCE:
${context}

---` : ''}

STUDENT'S QUESTION: ${question}

PROVIDE A HELPFUL, EDUCATIONAL ANSWER:`;
  }

  try {
    const response = await ai.models.generateContent({
      model: MODELS.CHAT,
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
  const prompt = `You are an expert tutor. A student wants to understand "${concept}" in depth.

YOUR TASK:
1. Use the study material below as a starting point
2. EXPAND and ENRICH the explanation with your expert knowledge
3. Provide a COMPREHENSIVE, in-depth explanation that truly helps the student understand

GUIDELINES:
- Give a thorough, detailed explanation
- Use simple language but don't oversimplify - students want to learn!
- Include examples, analogies, and real-world applications
- Break down complex parts step by step
- If relevant, mention related concepts they should know
- NEVER say "the material doesn't cover this" or reference any document/text
- Teach as an expert who genuinely wants the student to master this concept

STUDY MATERIAL FOR REFERENCE:
${context.substring(0, 10000)}

PROVIDE A COMPREHENSIVE EXPLANATION OF "${concept}":`;

  try {
    const response = await ai.models.generateContent({
      model: MODELS.EXPLAIN,
      contents: prompt,
    });
    const generatedText = response.text;
    return generatedText;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to explain concept');
  }
};
