const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_INSTRUCTION = `Visuals: Output JSON in code blocks.
1. Diagrams (flow/arch): \`\`\`reactflow\`\`\`. Schema: {"nodes":[{"id":"1","data":{"label":"..."}}],"edges":[{"id":"e1-2","source":"1","target":"2"}]}.
2. Charts (data/graphs): \`\`\`recharts\`\`\`. Schema: {"type":"LineChart|BarChart|AreaChart","data":[{"name":"..","v":10}],"xKey":"name","series":[{"key":"v","color":"#..."}]}.`;

module.exports = {
  genAI,
  SYSTEM_INSTRUCTION
};
