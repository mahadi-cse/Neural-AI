'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from 'next-themes';
import { 
  Copy, Check, ChevronDown, Sparkles, 
  MessageSquare, Plus, Trash2, Menu, Send, User, 
  Bot, Terminal, Mail, Bug, Sun, Moon, X, FileText, Image as ImageIcon, AlertCircle, Edit3, Mic, MicOff
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
}

interface FilePreview {
  file: File;
  previewUrl: string;
  type: string;
}

const MOD_OPTIONS = [
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash', desc: 'Fast & Experimental' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', desc: 'Robust & Stable' },
];

const SUGGESTIONS = [
  { icon: <Sparkles size={16} />, text: "Explain quantum computing simply" },
  { icon: <Terminal size={16} />, text: "Write a Python web scraper" },
  { icon: <Mail size={16} />, text: "Draft a professional email" },
  { icon: <Bug size={16} />, text: "Debug my JavaScript code" },
];

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB

const CodeBlock = ({ language, value }: { language: string, value: string }) => {
  const [copied, setCopied] = useState(false);
  const copyToClipboard = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-6 rounded-2xl overflow-hidden border border-[var(--border)] shadow-xl bg-[var(--bg-sidebar)]">
      <div className="flex items-center justify-between px-5 py-3 bg-[var(--bg-card)] border-b border-[var(--border)] text-[10px] font-mono tracking-widest text-[var(--text-muted)] uppercase">
        <span>{language || 'code'}</span>
        <button onClick={copyToClipboard} className="flex items-center gap-2 hover:text-[var(--text-main)] transition-colors">
          {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <SyntaxHighlighter 
        language={language || 'text'} 
        style={vscDarkPlus} 
        customStyle={{ margin: 0, padding: '1.5rem', fontSize: '0.85rem', backgroundColor: 'transparent' }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
};

export default function ChatInterface() {
  const [chats, setChats] = useState<Chat[]>([
    { id: '1', title: 'New Conversation', messages: [] }
  ]);
  const [activeChatId, setActiveChatId] = useState('1');
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [selectedModel, setSelectedModel] = useState(MOD_OPTIONS[0].id);
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FilePreview[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const { setTheme, resolvedTheme } = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const modelMenuRef = useRef<HTMLDivElement>(null);
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
          const transcript = Array.from(event.results)
            .map((result: any) => result[0])
            .map((result: any) => result.transcript)
            .join('');
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modelMenuRef.current && !modelMenuRef.current.contains(event.target as Node)) {
        setIsModelMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!mounted) return null;

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setError(null);

    const validFiles: FilePreview[] = [];
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        setError(`File ${file.name} is too large (max 4MB)`);
        continue;
      }
      
      const isImage = file.type.startsWith('image/');
      const isDoc = file.type === 'application/pdf' || file.type === 'text/plain';

      if (!isImage && !isDoc) {
        setError(`${file.name} type not supported`);
        continue;
      }

      validFiles.push({
        file,
        previewUrl: isImage ? URL.createObjectURL(file) : '',
        type: file.type
      });
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => {
      const newFiles = [...prev];
      if (newFiles[index].previewUrl) URL.revokeObjectURL(newFiles[index].previewUrl);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleNewChat = () => {
    const newChat: Chat = { id: Date.now().toString(), title: 'New Conversation', messages: [] };
    setChats(prev => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    setIsMobileMenuOpen(false);
  };

  const deleteChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChats(prev => {
      const filtered = prev.filter(c => c.id !== id);
      if (filtered.length === 0) return [{ id: Date.now().toString(), title: 'New Conversation', messages: [] }];
      if (activeChatId === id) setActiveChatId(filtered[0].id);
      return filtered;
    });
  };

  const startEditing = (chat: Chat, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditingTitle(chat.title);
  };

  const saveTitle = () => {
    if (editingChatId && editingTitle.trim()) {
      setChats(prev => prev.map(c => c.id === editingChatId ? { ...c, title: editingTitle } : c));
    }
    setEditingChatId(null);
  };

  const handleSuggestion = (text: string) => {
    setInput(text);
    if (textareaRef.current) {
      textareaRef.current.focus();
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
          textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
      }, 0);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && selectedFiles.length === 0) || isLoading) return;

    const userMessage: Message = { role: 'user', content: input || "Analyzed attached files." };
    
    let newTitle = activeChat.title;
    if (activeChat.messages.length === 0 && input.trim()) {
      newTitle = input.slice(0, 30) + (input.length > 30 ? '...' : '');
    }

    setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, title: newTitle, messages: [...c.messages, userMessage] } : c));
    
    const formData = new FormData();
    formData.append('messages', JSON.stringify([...activeChat.messages, userMessage]));
    formData.append('model', selectedModel);
    selectedFiles.forEach(f => formData.append('files', f.file));

    setInput('');
    setSelectedFiles([]);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setIsLoading(true);
    setStreamingMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        body: formData,
      });

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let assistantResponse = '';
      setIsLoading(false);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantResponse += decoder.decode(value, { stream: true });
        setStreamingMessage(assistantResponse);
      }

      setChats(prev => prev.map(c => c.id === activeChatId ? { 
        ...c, 
        messages: [...c.messages, { role: 'assistant', content: assistantResponse }] 
      } : c));
      setStreamingMessage('');
    } catch (error) {
      console.error('Error:', error);
      setChats(prev => prev.map(c => c.id === activeChatId ? { 
        ...c, 
        messages: [...c.messages, { role: 'assistant', content: 'Error: Connection lost.' }] 
      } : c));
    } finally {
      setIsLoading(false);
    }
  };

  const MarkdownRenderer = ({ content }: { content: string }) => (
    <ReactMarkdown components={{
      code({ node, inline, className, children, ...props }: any) {
        const match = /language-(\w+)/.exec(className || '');
        return !inline && match ? (
          <CodeBlock language={match[1]} value={String(children).replace(/\n$/, '')} />
        ) : (
          <code className="bg-[var(--bg-sidebar)] px-1.5 py-0.5 rounded-lg text-[var(--accent)] text-sm font-mono font-bold" {...props}>
            {children}
          </code>
        );
      },
      p: ({ children }) => <p className="mb-5 last:mb-0">{children}</p>,
      ul: ({ children }) => <ul className="list-disc ml-6 mb-5 space-y-2">{children}</ul>,
      ol: ({ children }) => <ol className="list-decimal ml-6 mb-5 space-y-2">{children}</ol>,
    }}>
      {content}
    </ReactMarkdown>
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-5 border-b border-[var(--border)] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] flex items-center justify-center shadow-lg">
            <Sparkles size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight whitespace-nowrap">Neural AI</span>
        </div>
        <button 
          onClick={() => setIsSidebarCollapsed(true)} 
          className="md:block hidden p-2.5 hover:bg-[var(--bg-card)] rounded-xl transition-all text-[var(--text-muted)] hover:text-[var(--text-main)]"
        >
          <Menu size={20} />
        </button>
      </div>

      <div className="p-5 shrink-0">
        <button 
          onClick={handleNewChat} 
          className="flex items-center gap-2.5 w-full py-3 px-5 rounded-2xl bg-[var(--accent)] text-white font-semibold transition-all shadow-xl shadow-blue-500/10 hover:scale-[1.02] active:scale-95"
        >
          <Plus size={20} />
          <span>New Chat</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 space-y-1.5 scrollbar-hide pb-20">
        {chats.map(chat => (
          <div 
            key={chat.id} 
            onClick={() => { setActiveChatId(chat.id); setIsMobileMenuOpen(false); }} 
            className={`group flex items-center gap-3.5 p-3.5 rounded-2xl cursor-pointer transition-all ${activeChatId === chat.id ? 'bg-[var(--bg-card)] shadow-soft text-[var(--text-main)]' : 'hover:bg-[var(--bg-card)]/40 text-[var(--text-muted)]'}`}
          >
            <MessageSquare size={16} className={activeChatId === chat.id ? 'text-[var(--accent)]' : ''} />
            <div className="flex-1 truncate text-[13.5px] font-medium">
              {editingChatId === chat.id ? (
                <input
                  autoFocus
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onBlur={saveTitle}
                  onKeyDown={(e) => e.key === 'Enter' && saveTitle()}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full bg-transparent border-none outline-none text-[var(--accent)] font-bold p-0"
                />
              ) : (
                <span>{chat.title}</span>
              )}
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
              <button 
                onClick={(e) => startEditing(chat, e)}
                className="p-1.5 hover:bg-[var(--bg-sidebar)] rounded-lg transition-all text-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                <Edit3 size={14} />
              </button>
              <button 
                onClick={(e) => deleteChat(chat.id, e)}
                className="p-1.5 hover:bg-red-500/10 text-red-500 rounded-lg transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-full bg-[var(--bg-main)] text-[var(--text-main)] overflow-hidden font-sans transition-all duration-700">
      <aside className={`hidden md:flex flex-col bg-[var(--bg-sidebar)] border-r border-[var(--border)] transition-all duration-500 ease-in-out ${isSidebarCollapsed ? 'w-0 border-none opacity-0' : 'w-72'}`}>
        <SidebarContent />
      </aside>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <aside className="w-72 h-full bg-[var(--bg-sidebar)]" onClick={e => e.stopPropagation()}>
            <SidebarContent />
            <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-5 right-5 p-2 bg-[var(--bg-card)] rounded-xl border border-[var(--border)] shadow-xl"><X size={20}/></button>
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-16 md:h-20 flex items-center justify-between px-4 md:px-10 border-b border-[var(--border)] bg-[var(--bg-header)] backdrop-blur-xl z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => isSidebarCollapsed ? setIsSidebarCollapsed(false) : setIsMobileMenuOpen(true)} 
              className={`p-2.5 hover:bg-[var(--bg-card)] rounded-xl text-[var(--text-muted)] transition-all ${!isSidebarCollapsed ? 'md:hidden' : ''}`}
            >
              <Menu size={20} />
            </button>
            <div className="flex flex-col">
              <div className="text-sm md:text-base font-bold leading-none mb-1">Neural AI</div>
              <div className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] opacity-50 font-bold hidden md:block">Conversation</div>
            </div>
          </div>
          <button onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')} className="p-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] shadow-soft hover:scale-110 active:scale-95 transition-all">
            {resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 scroll-smooth">
          <div className="max-w-6xl mx-auto space-y-10 pb-12">
            {activeChat.messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-10 md:py-20 animate-in fade-in zoom-in-95 duration-1000">
                <div className="w-20 h-20 rounded-[2.5rem] bg-gradient-to-br from-[#3b82f6] to-[#7c3aed] flex items-center justify-center shadow-2xl mb-8">
                  <Bot size={40} className="text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">How can I help today?</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl px-4">
                  {SUGGESTIONS.map((s, i) => (
                    <button 
                      key={i} 
                      onClick={() => handleSuggestion(s.text)}
                      className="flex flex-col gap-2 p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border)] hover:bg-[var(--bg-sidebar)] hover:scale-[1.02] active:scale-95 transition-all text-left group shadow-soft"
                    >
                      <div className="w-8 h-8 rounded-xl bg-[var(--bg-sidebar)] flex items-center justify-center text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white transition-all">{s.icon}</div>
                      <span className="text-sm font-semibold text-[var(--text-main)]">{s.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              activeChat.messages.map((msg, index) => (
                <div key={index} className={`flex gap-3 md:gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${msg.role === 'user' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--accent)]'}`}>
                    {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                  </div>
                  <div className={`px-5 py-4 rounded-2xl max-w-[92%] md:max-w-[85%] text-[15px] leading-relaxed shadow-soft ${msg.role === 'user' ? 'bg-[var(--accent)] text-white rounded-tr-none' : 'bg-[var(--bg-card)] border border-[var(--border)] rounded-tl-none'}`}>
                    <div className="markdown-content"><MarkdownRenderer content={msg.content} /></div>
                  </div>
                </div>
              ))
            )}
            
            {streamingMessage && (
              <div className="flex gap-3 md:gap-6 animate-in fade-in duration-300">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)] shadow-lg"><Bot size={18} /></div>
                <div className="px-5 py-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] shadow-soft max-w-[92%] md:max-w-[85%] rounded-tl-none">
                  <div className="markdown-content"><MarkdownRenderer content={streamingMessage} /></div>
                  <span className="inline-block w-1.5 h-5 ml-1 bg-[var(--accent)] animate-pulse rounded-full translate-y-1"></span>
                </div>
              </div>
            )}

            {isLoading && !streamingMessage && (
              <div className="flex gap-3 md:gap-6 animate-in fade-in duration-300">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)] shadow-lg"><Bot size={18} /></div>
                <div className="px-6 py-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] shadow-soft flex gap-1.5 items-center rounded-tl-none">
                  <div className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-bounce"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="px-4 md:px-10 pb-4 md:pb-10 pt-4 bg-gradient-to-t from-[var(--bg-main)] shrink-0">
          <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-4">
            {error && <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-xl text-xs font-bold animate-in fade-in slide-in-from-bottom-2"><AlertCircle size={14} />{error}</div>}
            
            {selectedFiles.length > 0 && (
              <div className="flex flex-wrap gap-3 animate-in fade-in slide-in-from-bottom-4">
                {selectedFiles.map((file, i) => (
                  <div key={i} className="relative group p-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-soft flex items-center gap-3 pr-4">
                    {file.previewUrl ? <img src={file.previewUrl} className="w-10 h-10 rounded-lg object-cover" /> : <div className="w-10 h-10 rounded-lg bg-[var(--bg-sidebar)] flex items-center justify-center text-[var(--accent)]"><FileText size={20} /></div>}
                    <div className="flex flex-col"><span className="text-[10px] font-bold truncate max-w-[100px]">{file.file.name}</span><span className="text-[8px] uppercase tracking-widest opacity-50 font-black">{(file.file.size/1024).toFixed(0)} KB</span></div>
                    <button onClick={() => removeFile(i)} className="p-1 hover:bg-red-500/10 text-red-500 rounded-lg transition-all"><X size={14} /></button>
                  </div>
                ))}
              </div>
            )}

            <div className="relative bg-[var(--bg-card)] border border-[var(--border)] rounded-[1.8rem] md:rounded-[2.5rem] shadow-soft p-2 md:p-3 focus-within:shadow-2xl focus-within:shadow-blue-500/5 transition-all">
              <div className="flex flex-col">
                <textarea ref={textareaRef} value={input} onChange={e => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px'; }} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }}} className="px-4 md:px-6 py-2 bg-transparent outline-none border-none focus:ring-0 resize-none min-h-[44px] max-h-[160px] text-[15px] md:text-[16px] font-medium" placeholder="Write a message..." rows={1} />
                <div className="flex items-center justify-between px-4 md:px-6 pb-2 pt-2">
                  <div className="flex items-center gap-2">
                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} multiple className="hidden" accept="image/*,application/pdf,text/plain" />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2.5 rounded-xl bg-[var(--bg-sidebar)]/50 hover:bg-[var(--bg-sidebar)] transition-all shadow-sm"><Plus size={20} /></button>
                    
                    <button 
                      type="button" 
                      onClick={toggleListening} 
                      className={`relative p-2.5 rounded-xl transition-all shadow-sm ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-[var(--bg-sidebar)]/50 hover:bg-[var(--bg-sidebar)]'}`}
                    >
                      <Mic size={20} />
                      {isListening && <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>}
                    </button>

                    <div className="md:relative" ref={modelMenuRef}>
                      <button type="button" onClick={() => setIsModelMenuOpen(!isModelMenuOpen)} className="px-4 py-2 hover:bg-[var(--bg-sidebar)] rounded-xl text-xs font-bold transition-all text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border)] bg-[var(--bg-sidebar)]/30">{MOD_OPTIONS.find(m => m.id === selectedModel)?.name} <ChevronDown size={14} className="inline ml-1"/></button>
                      {isModelMenuOpen && (
                        <div className="absolute bottom-full left-0 mb-4 w-64 bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-2 backdrop-blur-3xl p-2">
                          {MOD_OPTIONS.map(opt => (
                            <button key={opt.id} type="button" onClick={() => { setSelectedModel(opt.id); setIsModelMenuOpen(false); }} className={`w-full px-5 py-4 text-left rounded-2xl transition-all hover:bg-[var(--bg-sidebar)] flex flex-col gap-1 ${selectedModel === opt.id ? 'bg-[var(--bg-sidebar)] border border-[var(--border)]' : ''}`}>
                              <span className={`text-[13px] font-bold ${selectedModel === opt.id ? 'text-[var(--accent)]' : 'text-[var(--text-main)]'}`}>{opt.name}</span>
                              <span className="text-[10px] text-[var(--text-muted)] font-medium leading-none">{opt.desc}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <button type="submit" disabled={isLoading || (!input.trim() && selectedFiles.length === 0)} className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${input.trim() || selectedFiles.length > 0 ? 'bg-[var(--accent)] text-white shadow-lg shadow-blue-500/20' : 'bg-[var(--bg-sidebar)]/50 opacity-40'}`}><Send size={20} /></button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
