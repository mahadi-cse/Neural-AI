const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { genAI, SYSTEM_INSTRUCTION } = require('./config/ai');

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

app.post('/api/chat', upload.array('files'), async (req, res) => {
  try {
    const { messages, model: modelId } = req.body;
    const parsedMessages = JSON.parse(messages);
    const files = req.files || [];

    const model = genAI.getGenerativeModel({
      model: modelId || "gemini-1.5-flash",
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    const promptParts = [];
    
    // Add files to the last user message if present
    for (const file of files) {
      promptParts.push({
        inlineData: {
          data: file.buffer.toString('base64'),
          mimeType: file.mimetype,
        },
      });
    }

    const lastMessage = parsedMessages[parsedMessages.length - 1].content;
    promptParts.push({ text: lastMessage });

    const chat = model.startChat({
      history: parsedMessages.slice(0, -1).map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      })),
    });

    const result = await chat.sendMessageStream(promptParts);
    
    res.setHeader('Content-Type', 'text/plain');
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      res.write(chunkText);
    }

    // After stream ends, get usage metadata
    try {
      const response = await result.response;
      if (response.usageMetadata) {
        res.write(`\n[METADATA]:${JSON.stringify(response.usageMetadata)}`);
      }
    } catch (e) {
      console.error('Error getting usage metadata:', e);
    }
    
    res.end();

  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
