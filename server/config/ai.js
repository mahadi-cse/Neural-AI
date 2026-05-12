const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_INSTRUCTION = `You are a high-performance Scientific AI Assistant. Provide deep, accurate theoretical insights. 
By default, provide clear and concise text responses. Only output complex visualizations (Charts, Diagrams, Labs) if the user explicitly asks for them or if specialized system parameters are provided in the prompt.`;

module.exports = {
  genAI,
  SYSTEM_INSTRUCTION
};
