'use client';

import React from 'react';
import { 
  Plus, Mic, ChevronDown, Send, X, FileText, AlertCircle 
} from 'lucide-react';

interface InputAreaProps {
  input: string;
  isLoading: boolean;
  isListening: boolean;
  selectedFiles: any[];
  error: string | null;
  selectedModel: string;
  visualMode: string;
  isModelMenuOpen: boolean;
  isVisualMenuOpen: boolean;
  modelOptions: any[];
  visualModes: any[];
  onInputChange: (value: string) => void;
  onSubmit: (e?: React.FormEvent) => void;
  onToggleListening: () => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (index: number) => void;
  onSetSelectedModel: (id: string) => void;
  onSetVisualMode: (id: string) => void;
  onSetIsModelMenuOpen: (open: boolean) => void;
  onSetIsVisualMenuOpen: (open: boolean) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export const InputArea = React.memo(({
  input, isLoading, isListening, selectedFiles, error,
  selectedModel, visualMode, isModelMenuOpen, isVisualMenuOpen,
  modelOptions, visualModes, onInputChange, onSubmit, onToggleListening,
  onFileSelect, onRemoveFile, onSetSelectedModel, onSetVisualMode,
  onSetIsModelMenuOpen, onSetIsVisualMenuOpen, textareaRef, fileInputRef
}: InputAreaProps) => {
  return (
    <div className="px-4 md:px-10 pb-4 md:pb-10 pt-4 bg-gradient-to-t from-[var(--bg-main)] shrink-0">
      <form onSubmit={onSubmit} className="max-w-6xl mx-auto space-y-4">
        {error && <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-xl text-xs font-bold animate-in fade-in slide-in-from-bottom-2"><AlertCircle size={14} />{error}</div>}
        
        {selectedFiles.length > 0 && (
          <div className="flex flex-wrap gap-3 animate-in fade-in slide-in-from-bottom-4">
            {selectedFiles.map((file, i) => (
              <div key={i} className="relative group p-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-soft flex items-center gap-3 pr-4">
                {file.previewUrl ? <img src={file.previewUrl} className="w-10 h-10 rounded-lg object-cover" /> : <div className="w-10 h-10 rounded-lg bg-[var(--bg-sidebar)] flex items-center justify-center text-[var(--accent)]"><FileText size={20} /></div>}
                <div className="flex flex-col"><span className="text-[10px] font-bold truncate max-w-[100px]">{file.file.name}</span><span className="text-[8px] uppercase tracking-widest opacity-50 font-black">{(file.file.size/1024).toFixed(0)} KB</span></div>
                <button type="button" onClick={() => onRemoveFile(i)} className="p-1 hover:bg-red-500/10 text-red-500 rounded-lg transition-all"><X size={14} /></button>
              </div>
            ))}
          </div>
        )}

        <div className="relative bg-[var(--bg-card)] border border-[var(--border)] rounded-[1.8rem] md:rounded-[2.5rem] shadow-soft p-2 md:p-3 focus-within:shadow-2xl focus-within:shadow-blue-500/5 transition-all">
          <div className="flex flex-col">
            <textarea 
              ref={textareaRef} 
              value={input} 
              onChange={e => onInputChange(e.target.value)} 
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSubmit(); }}} 
              className="px-4 md:px-6 py-2 bg-transparent outline-none border-none focus:ring-0 resize-none min-h-[44px] max-h-[160px] text-[15px] md:text-[16px] font-medium" 
              placeholder="Write a message..." 
              rows={1} 
            />
            <div className="flex items-center justify-between px-4 md:px-6 pb-2 pt-2">
              <div className="flex items-center gap-2">
                <input type="file" ref={fileInputRef} onChange={onFileSelect} multiple className="hidden" accept="image/*,application/pdf,text/plain" />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2.5 rounded-xl bg-[var(--bg-sidebar)]/50 hover:bg-[var(--bg-sidebar)] transition-all shadow-sm"><Plus size={20} /></button>
                
                <button 
                  type="button" 
                  onClick={onToggleListening} 
                  className={`relative p-2.5 rounded-xl transition-all shadow-sm ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-[var(--bg-sidebar)]/50 hover:bg-[var(--bg-sidebar)]'}`}
                >
                  <Mic size={20} />
                  {isListening && <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>}
                </button>

                <div className="md:relative">
                  <button type="button" onClick={() => onSetIsVisualMenuOpen(!isVisualMenuOpen)} className="px-4 py-2 hover:bg-[var(--bg-sidebar)] rounded-xl text-xs font-bold transition-all text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border)] bg-[var(--bg-sidebar)]/30 flex items-center gap-2">
                    {visualModes.find(m => m.id === visualMode)?.icon}
                    {visualModes.find(m => m.id === visualMode)?.name}
                  </button>
                  {isVisualMenuOpen && (
                    <div className="absolute bottom-full left-0 mb-4 w-60 bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-2 backdrop-blur-3xl p-2">
                      {visualModes.map(opt => (
                        <button key={opt.id} type="button" onClick={() => { onSetVisualMode(opt.id); onSetIsVisualMenuOpen(false); }} className={`w-full px-5 py-3 text-left rounded-2xl transition-all hover:bg-[var(--bg-sidebar)] flex flex-col gap-0.5 ${visualMode === opt.id ? 'bg-[var(--bg-sidebar)] border border-[var(--border)]' : ''}`}>
                          <span className={`text-[12px] font-bold flex items-center gap-2 ${visualMode === opt.id ? 'text-[var(--accent)]' : 'text-[var(--text-main)]'}`}>
                            {opt.icon} {opt.name}
                          </span>
                          <span className="text-[9px] text-[var(--text-muted)] font-medium leading-none ml-5">{opt.desc}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="md:relative">
                  <button type="button" onClick={() => onSetIsModelMenuOpen(!isModelMenuOpen)} className="px-4 py-2 hover:bg-[var(--bg-sidebar)] rounded-xl text-xs font-bold transition-all text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border)] bg-[var(--bg-sidebar)]/30">{modelOptions.find(m => m.id === selectedModel)?.name} <ChevronDown size={14} className="inline ml-1"/></button>
                  {isModelMenuOpen && (
                    <div className="absolute bottom-full left-0 mb-4 w-64 bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-2 backdrop-blur-3xl p-2">
                      {modelOptions.map(opt => (
                        <button key={opt.id} type="button" onClick={() => { onSetSelectedModel(opt.id); onSetIsModelMenuOpen(false); }} className={`w-full px-5 py-4 text-left rounded-2xl transition-all hover:bg-[var(--bg-sidebar)] flex flex-col gap-1 ${selectedModel === opt.id ? 'bg-[var(--bg-sidebar)] border border-[var(--border)]' : ''}`}>
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
  );
});

InputArea.displayName = 'InputArea';
