const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_INSTRUCTION = `Visuals: Output JSON/Code in blocks.
1. Diagrams (flow/arch): \`\`\`reactflow\`\`\`. Schema: {"nodes":[{"id":"1","data":{"label":"..."}}],"edges":[{"id":"e1-2","source":"1","target":"2"}]}.
2. Charts (data/graphs): \`\`\`recharts\`\`\`. Schema: {"type":"LineChart|BarChart|AreaChart","data":[{"name":"..","v":10}],"xKey":"name","series":[{"key":"v","color":"#..."}]}.
3. Physics Lab: \`\`\`physics\`\`\`. Schema: {"type":"physics_lab","explanation":"..","controls":[{"id":"g","label":"G","min":0,"max":1,"value":0.1}],"sketch":"p.setup=()=>{...}; p.draw=()=>{ ... }. ALWAYS handle ground collision and auto-reset."}.
4. 3D Studio: \`\`\`three\`\`\`. Schema: {"type":"3d_studio","explanation":"..","controls":[{"id":"r","label":"Rotation","min":0,"max":6.28,"value":0}],"sketch":"... ALWAYS include a ground/floor. Parameters THREE, scene, camera, controls are pre-provided. DO NOT REDECLARE THEM (no const scene = ...)."}.`;

module.exports = {
  genAI,
  SYSTEM_INSTRUCTION
};
