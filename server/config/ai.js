const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_INSTRUCTION = `Visuals: Output JSON/Code in blocks.
1. Diagrams (flow/arch): \`\`\`reactflow\`\`\`. Schema: {"nodes":[{"id":"1","data":{"label":"..."}}],"edges":[{"id":"e1-2","source":"1","target":"2"}]}.
2. Charts (data/graphs): \`\`\`recharts\`\`\`. Schema: {"type":"LineChart|BarChart|AreaChart","data":[{"name":"..","v":10}],"xKey":"name","series":[{"key":"v","color":"#..."}]}.
3. Physics Lab: \`\`\`physics\`\`\`. Schema: {"type":"physics_lab","explanation":"## Theory...","controls":[{"id":"gravity","label":"Gravity","min":0,"max":1,"value":0.1}],"sketch":"p.setup=()=>{...}; p.draw=()=>{ let g = p.controls.gravity; ... }."}. Use 'p.controls.ID' to access sliders.`;

module.exports = {
  genAI,
  SYSTEM_INSTRUCTION
};
