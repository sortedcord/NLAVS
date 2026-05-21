import { GoogleGenAI } from '@google/genai';
import readline from 'readline/promises';

// Initializes using the GEMINI_API_KEY environment variable
const key = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey: key });

async function startREPL() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  while (true) {
    const userInput = await rl.question('You: ');
    
    if (userInput.toLowerCase() === 'exit') {
      break;
    }

    if (!userInput.trim()) continue;

    process.stdout.write('Gemini: ');

    try {
      // Using the mainline, fast reasoning model
      const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash', 
        contents: userInput,
      });

      // Stream the response chunks directly to stdout as they arrive
      for await (const chunk of responseStream) {
        process.stdout.write(chunk.text);
      }
      console.log('\n'); // Add spacing after completion
    } catch (error) {
      console.error('\n❌ Error generating conc fr556tent:', error);
    }
  }

  rl.close();
  console.log('Goodbye!');
}

startREPL();