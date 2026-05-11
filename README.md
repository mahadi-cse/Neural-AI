# 🤖 Neural AI Chatbot

A premium, high-performance AI conversation interface built with **Next.js**, **Node.js**, and the **Google Gemini API**. This project features a sophisticated "Neural Interface" aesthetic, prioritizing soft visuals, organic shapes, and a seamless user experience.

![Neural AI Interface](https://raw.githubusercontent.com/your-username/ai-chatbot/main/screenshot.png) *(Replace with your actual screenshot after pushing)*

## ✨ Key Features

### 🌌 Atmospheric "Neural" Design
- **Soft Vibe Aesthetics**: A low-contrast, organic design language featuring translucent glassmorphism, ghost borders, and velvet-smooth transitions.
- **Variable-First Theme System**: Custom CSS variable architecture ensures 100% flicker-free switching between Deep Dark and Soft Light modes.
- **Claude-Inspired Input**: A highly refined, professional prompt area with a clean top-positioned text area and an integrated action bar.

### 🧠 Intelligent Core
- **Dual Gemini Engine**: Switch seamlessly between **Gemini 3 Flash (Experimental)** and **Gemini 2.5 Flash (Stable)**.
- **Real-Time Streaming**: Watch responses materialize instantly with low-latency server-sent events (SSE).
- **Session Management**: Full support for multiple chat threads with persistent client-side history and easy conversation switching.

### 🛠️ Developer-First Features
- **Markdown & Code Rendering**: Full support for rich text formatting and professional syntax highlighting with one-click copy-to-clipboard functionality.
- **Responsive Mastery**: Fully optimized for mobile with an adaptive overlay sidebar and fluid content scaling.
- **Performance Optimized**: Built with Next.js Turbopack for lightning-fast development and optimized production builds.

## 🚀 Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/) (App Router), [Tailwind CSS v4](https://tailwindcss.com/), [Lucide React](https://lucide.dev/)
- **Backend**: [Node.js](https://nodejs.org/), [Express](https://expressjs.com/), [@google/generative-ai](https://www.npmjs.com/package/@google/generative-ai)
- **Styling**: Pure CSS Variables + Tailwind Utility Classes
- **AI Models**: Google Gemini 1.5/2.0 Flash

## ⚙️ Quick Start

### 1. Prerequisites
- Node.js (v18+)
- A Google AI Studio [API Key](https://aistudio.google.com/)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-username/neural-ai-chatbot.git
cd neural-ai-chatbot

# Install Client dependencies
cd client
npm install

# Install Server dependencies
cd ../server
npm install
```

### 3. Environment Setup
Create a `.env` file in the `server` directory:
```env
PORT=5000
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 4. Run Development Servers
**Start Server:**
```bash
cd server
npm run dev
```

**Start Client:**
```bash
cd client
npm run dev
```

Visit `http://localhost:3000` to start chatting!

## 📱 Mobile Support
The interface is designed to be fully responsive. On mobile devices:
- The sidebar collapses into a clean hamburger menu.
- Content width expands to 92% of the screen for maximum readability.
- Input rounding and padding adjust dynamically for touch comfort.

---
*Built with ❤️ for the future of AI interfaces.*
