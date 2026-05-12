'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { 
  Sparkles, Menu, Send, User, Bot, Sun, Moon, X, AlertCircle, Activity, Box, CloudSun
} from 'lucide-react';

// Components
import { Sidebar } from './chat/Sidebar';
import { InputArea } from './chat/InputArea';
import { MarkdownRenderer } from './chat/MarkdownRenderer';

// Types & Config
interface Message { role: 'user' | 'assistant'; content: string; }
interface Chat { 
  id: string; 
  title: string; 
  messages: Message[]; 
  usage?: { prompt: number; completion: number; total: number; }; 
}
interface FilePreview { file: File; previewUrl: string; type: string; }

const MOD_OPTIONS = [
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash', desc: 'Fast & Experimental' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', desc: 'Robust & Stable' },
];

const VISUAL_MODES = [
  { id: 'auto', name: 'Auto Mode', icon: <Sparkles size={14} />, desc: 'AI decides best format' },
  { id: 'diagram', name: 'Architecture', icon: <Bot size={14} />, desc: 'Force React Flow Diagram' },
  { id: 'chart', name: 'Data Chart', icon: <Bot size={14} />, desc: 'Force Recharts Graph' },
  { id: 'physics', name: 'Physics Lab', icon: <Activity size={14} />, desc: 'Force p5.js Simulation' },
  { id: '3d', name: '3D Studio', icon: <Box size={14} />, desc: 'Force Three.js 3D Scene' },
];

const AGENT_MODES = [
  { id: 'none', name: 'No Agent', icon: <User size={14} />, desc: 'Standard Assistant' },
  { id: 'weather', name: 'Weather AI', icon: <CloudSun size={14} />, desc: 'Real-time Weather Agent' },
];

const MAX_FILE_SIZE = 4 * 1024 * 1024;

export default function ChatInterface() {
  const [chats, setChats] = useState<Chat[]>([{ id: '1', title: 'New Conversation', messages: [] }]);
  const [activeChatId, setActiveChatId] = useState('1');
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [selectedModel, setSelectedModel] = useState(MOD_OPTIONS[0].id);
  const [visualMode, setVisualMode] = useState('auto');
  const [agentMode, setAgentMode] = useState('none');
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const [isVisualMenuOpen, setIsVisualMenuOpen] = useState(false);
  const [isAgentMenuOpen, setIsAgentMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FilePreview[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const { setTheme, resolvedTheme } = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const activeChat = chats.find(c => c.id === activeChatId) || chats[0];

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.onresult = (event: any) => {
          const transcript = Array.from(event.results).map((r: any) => r[0].transcript).join('');
          setInput(transcript);
        };
        recognitionRef.current.onend = () => setIsListening(false);
        recognitionRef.current.onerror = () => setIsListening(false);
      }
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat.messages, streamingMessage]);

  if (!mounted) return null;

  const handleInputChange = (val: string) => {
    setInput(val);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px';
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const valid: FilePreview[] = [];
    for (const f of files) {
      if (f.size > MAX_FILE_SIZE) { setError(`File ${f.name} too large`); continue; }
      const isImg = f.type.startsWith('image/');
      valid.push({ file: f, previewUrl: isImg ? URL.createObjectURL(f) : '', type: f.type });
    }
    setSelectedFiles(prev => [...prev, ...valid]);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && selectedFiles.length === 0) || isLoading) return;

    let processedInput = input;
    if (visualMode === 'diagram') processedInput += "\n[SYSTEM: Output a React Flow diagram JSON in a ```reactflow``` block. Schema: {\"nodes\":[{\"id\":\"1\",\"data\":{\"label\":\"...\", \"color\":\"#...\"}}],\"edges\":[{\"id\":\"e1-2\",\"source\":\"1\",\"target\":\"2\"}]}. Use a professional color palette (blue, emerald, amber, violet).]";
    if (visualMode === 'chart') processedInput += "\n[SYSTEM: Output a Recharts graph JSON in a ```recharts``` block. Schema: {\"type\":\"LineChart|BarChart|AreaChart\",\"data\":[{\"name\":\"A\",\"v\":10}],\"xKey\":\"name\",\"series\":[{\"key\":\"v\",\"color\":\"#...\"}]}]";
    if (visualMode === 'physics' || visualMode === '3d') processedInput += `\n[SYSTEM: Output a high-performance Neural Canvas simulation in a \`\`\`canvas\`\`\` block. 
      - FORMAT: Complete self-contained HTML (<!DOCTYPE html>).
      - STYLING: Tailwind CSS via CDN.
      - LIBRARIES: Three.js or p5.js via CDN.
      - THEME: Use a dark, premium aesthetic with glassmorphism controls.
      - PASCAL'S LAW: If requested, show 3D cylinders with moving pistons and fluid pressure. Cylinders MUST be static.]`;

    if (agentMode === 'weather') processedInput += `
[SYSTEM: ACT AS WEATHER AGENT. Output STRICT JSON only. No markdown. No explanations. No extra text. No code block formatting.
STRICT SCHEMA:
{
  "agent": "weather",
  "intent": "current_weather|weather_forecast|rain_check|temperature_check|weather_visualization",
  "location": "",
  "time": "",
  "summary": "",
  "weather": {
    "temperature": 0,
    "feelsLike": 0,
    "condition": "",
    "humidity": 0,
    "windSpeed": 0,
    "rainChance": 0,
    "hourly": [
      {"time": "08:00", "temp": 32, "condition": "Sunny"},
      {"time": "10:00", "temp": 34, "condition": "Sunny"}
    ]
  },
  "visualization": {
    "scene": "sunny|cloudy|rainy|storm|snowy|foggy|night_clear",
    "animation": "clear_sky|cloud_move|rain_fall|lightning_flash|snow_fall|fog_drift",
    "lighting": "soft|dark",
    "particles": 0,
    "camera": {
      "position": "front|top|angled",
      "rotation": "slow"
    }
  }
}
RULES: rainy -> dark + rain_fall, cloudy -> soft + cloud_move, storm -> lightning_flash, snowy -> snow_fall, foggy -> fog_drift, sunny -> clear_sky.]`;

    const userMsg: Message = { role: 'user', content: input || "Analyzed attached files." };
    const promptMsg: Message = { ...userMsg, content: processedInput };
    
    let newTitle = activeChat.title;
    if (activeChat.messages.length === 0 && input.trim()) newTitle = input.slice(0, 30) + '...';

    setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, title: newTitle, messages: [...c.messages, userMsg] } : c));
    
    const formData = new FormData();
    formData.append('messages', JSON.stringify([...activeChat.messages, promptMsg]));
    formData.append('model', selectedModel);
    selectedFiles.forEach(f => formData.append('files', f.file));

    setInput(''); setSelectedFiles([]); setIsLoading(true); setStreamingMessage('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    try {
      const response = await fetch('http://localhost:5000/api/chat', { method: 'POST', body: formData });
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');
      const decoder = new TextDecoder();
      let assistantRes = '';
      setIsLoading(false);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantRes += decoder.decode(value, { stream: true });
        
        // Handle metadata delimiter if present
        if (assistantRes.includes('\n[METADATA]:')) {
          const parts = assistantRes.split('\n[METADATA]:');
          const realContent = parts[0];
          const metadataStr = parts[1];
          
          try {
            const metadata = JSON.parse(metadataStr);
            setChats(prev => prev.map(c => c.id === activeChatId ? { 
              ...c, 
              usage: {
                prompt: (c.usage?.prompt || 0) + (metadata.promptTokenCount || 0),
                completion: (c.usage?.completion || 0) + (metadata.candidatesTokenCount || 0),
                total: (c.usage?.total || 0) + (metadata.totalTokenCount || 0)
              }
            } : c));
          } catch (e) {}
          
          assistantRes = realContent;
        }
        
        setStreamingMessage(assistantRes);
      }

      setChats(prev => prev.map(c => c.id === activeChatId ? { 
        ...c, messages: [...c.messages, { role: 'assistant', content: assistantRes }] 
      } : c));
      setStreamingMessage('');
    } catch (err) {
      console.error(err);
      setError("Connection error.");
    } finally { setIsLoading(false); }
  };

  return (
    <div className="flex h-screen w-full bg-[var(--bg-main)] text-[var(--text-main)] overflow-hidden font-sans transition-all duration-700">
      <aside className={`hidden md:flex flex-col bg-[var(--bg-sidebar)] border-r border-[var(--border)] transition-all duration-500 ease-in-out ${isSidebarCollapsed ? 'w-0 border-none opacity-0' : 'w-72'}`}>
        <Sidebar 
          chats={chats} activeChatId={activeChatId} editingChatId={editingChatId} editingTitle={editingTitle} isSidebarCollapsed={isSidebarCollapsed}
          onNewChat={() => { const id = Date.now().toString(); setChats(p => [{ id, title: 'New Conversation', messages: [] }, ...p]); setActiveChatId(id); }}
          onSelectChat={setActiveChatId}
          onDeleteChat={(id, e) => { e.stopPropagation(); setChats(p => p.filter(c => c.id !== id)); }}
          onStartEditing={(c, e) => { e.stopPropagation(); setEditingChatId(c.id); setEditingTitle(c.title); }}
          onSaveTitle={() => { if (editingChatId) setChats(p => p.map(c => c.id === editingChatId ? { ...c, title: editingTitle } : c)); setEditingChatId(null); }}
          onSetEditingTitle={setEditingTitle}
          onSetIsSidebarCollapsed={setIsSidebarCollapsed}
        />
      </aside>

      <div className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-16 md:h-20 flex items-center justify-between px-4 md:px-10 border-b border-[var(--border)] bg-[var(--bg-header)] backdrop-blur-xl z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => isSidebarCollapsed ? setIsSidebarCollapsed(false) : setIsMobileMenuOpen(true)} className={`p-2.5 hover:bg-[var(--bg-card)] rounded-xl text-[var(--text-muted)] ${!isSidebarCollapsed ? 'md:hidden' : ''}`}><Menu size={20} /></button>
            <div className="flex flex-col">
              <div className="text-sm font-bold">Neural AI</div>
              <div className="flex items-center gap-2 text-[10px] uppercase opacity-60 font-bold">
                <span className="hidden md:inline">Conversation</span>
                {activeChat.usage && (
                  <div className="flex items-center gap-2 px-2 py-0.5 bg-[var(--accent)]/10 text-[var(--accent)] rounded-full border border-[var(--accent)]/10">
                    <Activity size={10} />
                    <span>{activeChat.usage.total.toLocaleString()} Tokens</span>
                    <span className="opacity-40">/</span>
                    <span className="opacity-70">{~~(100 - (activeChat.usage.total / 1000000 * 100))}% Left</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <button onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')} className="p-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)]"><Sun size={18} /></button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
          <div className="max-w-6xl mx-auto space-y-10 pb-12">
            {activeChat.messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in-95 duration-1000">
                <div className="w-20 h-20 rounded-[2.5rem] bg-gradient-to-br from-[#3b82f6] to-[#7c3aed] flex items-center justify-center shadow-2xl mb-8"><Bot size={40} className="text-white" /></div>
                <h2 className="text-2xl font-bold mb-4">How can I help today?</h2>
              </div>
            ) : (
              activeChat.messages.map((msg, index) => (
                <div key={index} className={`flex gap-3 md:gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in duration-500`}>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-lg ${msg.role === 'user' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--accent)]'}`}>{msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}</div>
                  <div className={`px-5 py-4 rounded-2xl w-full max-w-[85%] shadow-soft ${msg.role === 'user' ? 'bg-[var(--accent)] text-white rounded-tr-none flex-none w-auto' : 'bg-[var(--bg-card)] border border-[var(--border)] rounded-tl-none'}`}>
                    <MarkdownRenderer content={msg.content} />
                  </div>
                </div>
              ))
            )}
            {isLoading && !streamingMessage && (
              <div className="flex gap-3 md:gap-6 animate-in fade-in duration-300">
                <div className="w-8 h-8 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)]"><Bot size={18} /></div>
                <div className="px-5 py-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] shadow-soft flex items-center gap-3">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">Neural AI is thinking...</span>
                </div>
              </div>
            )}
            {streamingMessage && (
              <div className="flex gap-3 md:gap-6 animate-in fade-in duration-300">
                <div className="w-8 h-8 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)]"><Bot size={18} /></div>
                <div className="px-5 py-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] shadow-soft w-full max-w-[85%] rounded-tl-none">
                  <MarkdownRenderer content={streamingMessage} enableVisuals={false} />
                  <span className="inline-block w-1.5 h-5 ml-1 bg-[var(--accent)] animate-pulse rounded-full"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <InputArea 
          input={input} isLoading={isLoading} isListening={isListening} selectedFiles={selectedFiles} error={error}
          selectedModel={selectedModel} visualMode={visualMode} agentMode={agentMode}
          isModelMenuOpen={isModelMenuOpen} isVisualMenuOpen={isVisualMenuOpen} isAgentMenuOpen={isAgentMenuOpen}
          modelOptions={MOD_OPTIONS} visualModes={VISUAL_MODES} agentModes={AGENT_MODES}
          onInputChange={handleInputChange} onSubmit={handleSubmit} 
          onToggleListening={() => { if (isListening) recognitionRef.current.stop(); else { setIsListening(true); recognitionRef.current.start(); } }}
          onFileSelect={handleFileSelect} onRemoveFile={(i) => setSelectedFiles(p => p.filter((_, idx) => idx !== i))}
          onSetSelectedModel={setSelectedModel} onSetVisualMode={setVisualMode} onSetAgentMode={setAgentMode}
          onSetIsModelMenuOpen={setIsModelMenuOpen} onSetIsVisualMenuOpen={setIsVisualMenuOpen} onSetIsAgentMenuOpen={setIsAgentMenuOpen}
          textareaRef={textareaRef} fileInputRef={fileInputRef}
        />
      </div>
    </div>
  );
}
