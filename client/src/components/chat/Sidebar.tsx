'use client';

import React from 'react';
import { 
  Sparkles, Menu, Plus, MessageSquare, Edit3, Trash2, X 
} from 'lucide-react';

interface SidebarProps {
  chats: any[];
  activeChatId: string;
  editingChatId: string | null;
  editingTitle: string;
  isSidebarCollapsed: boolean;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string, e: React.MouseEvent) => void;
  onStartEditing: (chat: any, e: React.MouseEvent) => void;
  onSaveTitle: () => void;
  onSetEditingTitle: (title: string) => void;
  onSetIsSidebarCollapsed: (collapsed: boolean) => void;
  onCloseMobile?: () => void;
}

export const Sidebar = ({ 
  chats, activeChatId, editingChatId, editingTitle, isSidebarCollapsed,
  onNewChat, onSelectChat, onDeleteChat, onStartEditing, onSaveTitle, 
  onSetEditingTitle, onSetIsSidebarCollapsed, onCloseMobile 
}: SidebarProps) => {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-5 border-b border-[var(--border)] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] flex items-center justify-center shadow-lg">
            <Sparkles size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight whitespace-nowrap">Neural AI</span>
        </div>
        <button 
          onClick={() => onSetIsSidebarCollapsed(true)} 
          className="md:block hidden p-2.5 hover:bg-[var(--bg-card)] rounded-xl transition-all text-[var(--text-muted)] hover:text-[var(--text-main)]"
        >
          <Menu size={20} />
        </button>
      </div>

      <div className="p-5 shrink-0">
        <button 
          onClick={onNewChat} 
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
            onClick={() => onSelectChat(chat.id)} 
            className={`group flex items-center gap-3.5 p-3.5 rounded-2xl cursor-pointer transition-all ${activeChatId === chat.id ? 'bg-[var(--bg-card)] shadow-soft text-[var(--text-main)]' : 'hover:bg-[var(--bg-card)]/40 text-[var(--text-muted)]'}`}
          >
            <MessageSquare size={16} className={activeChatId === chat.id ? 'text-[var(--accent)]' : ''} />
            <div className="flex-1 truncate text-[13.5px] font-medium">
              {editingChatId === chat.id ? (
                <input
                  autoFocus
                  value={editingTitle}
                  onChange={(e) => onSetEditingTitle(e.target.value)}
                  onBlur={onSaveTitle}
                  onKeyDown={(e) => e.key === 'Enter' && onSaveTitle()}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full bg-transparent border-none outline-none text-[var(--accent)] font-bold p-0"
                />
              ) : (
                <span>{chat.title}</span>
              )}
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
              <button 
                onClick={(e) => onStartEditing(chat, e)}
                className="p-1.5 hover:bg-[var(--bg-sidebar)] rounded-lg transition-all text-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                <Edit3 size={14} />
              </button>
              <button 
                onClick={(e) => onDeleteChat(chat.id, e)}
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
};
