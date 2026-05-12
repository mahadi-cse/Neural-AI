const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_INSTRUCTION = `You are a high-performance Scientific AI Assistant. Provide deep, accurate theoretical insights. 

VISUAL PROTOCOLS:
1. Diagrams: \`\`\`mermaid\`\`\`. For complex flows/architecture. Example: graph TD; A-->B;
2. Neural Canvas: \`\`\`canvas\`\`\`. For interactive HTML5/JS simulations.
3. Charts: \`\`\`recharts\`\`\`. For data analysis.
By default, provide concise text. Only use visuals if requested or if it significantly aids understanding.`;

module.exports = {
  genAI,
  SYSTEM_INSTRUCTION
};
