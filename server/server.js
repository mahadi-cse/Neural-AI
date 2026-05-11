const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const multer = require('multer');
const fs = require('fs');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Configure Multer for file uploads (Memory Storage)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const DIAGRAM_INSTRUCTION = [
  "You are a helpful assistant.",
  "If the user asks for a diagram (architecture, flowchart, sequence, class, ER, state, gantt, mindmap, timeline, or similar),",
  "respond with a React Flow JSON graph in a fenced code block:\n```reactflow\n{\"nodes\":[...],\"edges\":[...]}\n```.",
  "Each node must include id, position {x,y}, and data {label}.",
  "Each edge must include id, source, and target.",
  "Return strict JSON only: double quotes, no comments, no trailing commas, no extra keys.",
  "Keep the response to the React Flow code block unless the user asks for an explanation.",
  "If the user explicitly asks for ASCII art, provide ASCII instead."
].join(' ');

app.post('/api/chat', upload.array('files'), async (req, res) => {
  try {
    const { messages, model: requestedModel } = req.body;
    const files = req.files || [];

    if (!messages && !files.length) {
      return res.status(400).json({ error: 'Message or files are required.' });
    }

    const parsedMessages = typeof messages === 'string' ? JSON.parse(messages) : messages;
    const modelName = requestedModel || "gemini-1.5-flash";
    const model = genAI.getGenerativeModel({ model: modelName });

    const lastMessage = parsedMessages[parsedMessages.length - 1].content;
    
    // Prepare parts for multimodal input
    const parts = [`${DIAGRAM_INSTRUCTION}\n\nUser request:\n${lastMessage}`];

    // Process files
    for (const file of files) {
      if (file.mimetype.startsWith('image/')) {
        parts.push({
          inlineData: {
            data: file.buffer.toString('base64'),
            mimeType: file.mimetype
          }
        });
      } else if (file.mimetype === 'application/pdf') {
        // Send PDF directly to Gemini (Multimodal support)
        parts.push({
          inlineData: {
            data: file.buffer.toString('base64'),
            mimeType: 'application/pdf'
          }
        });
      } else if (file.mimetype === 'text/plain') {
        parts.push(`\n[Content of File ${file.originalname}]:\n${file.buffer.toString('utf-8')}\n`);
      }
    }

    // Set headers for streaming
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    const result = await model.generateContentStream(parts);
    
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      res.write(chunkText);
    }

    res.end();
  } catch (error) {
    console.error('Error with Gemini API:', error);
    res.status(500).json({ error: 'AI Error: ' + error.message });
  }
});

app.get('/', (req, res) => {
  res.send('Neural AI Multimodal Server is running.');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
