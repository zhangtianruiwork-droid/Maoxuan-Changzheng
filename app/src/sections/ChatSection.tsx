import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Terminal, Cpu, Key, EyeOff, Eye, Trash2 } from 'lucide-react';
import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT } from '../lib/system-prompt';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const STORAGE_KEY = 'maoxuan_api_key';

const initialMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: '系统初始化完成。\n毛选长征机已激活。\n\n同志，有什么问题，先说说你的情况。',
    timestamp: new Date(),
  },
];

const quickCommands = [
  '我的创业遇到了困境',
  '团队管理出现了严重冲突',
  '如何面对比我强大得多的对手',
  '我毕生追求的知识在AI面前毫无价值',
];

export function ChatSection() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(STORAGE_KEY) || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [showApiInput, setShowApiInput] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.05 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const saveApiKey = (key: string) => {
    setApiKey(key);
    if (key) {
      localStorage.setItem(STORAGE_KEY, key);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleSend = useCallback(async () => {
    if (!input.trim() || isStreaming) return;
    if (!apiKey.trim()) {
      setShowApiInput(true);
      setError('请先输入 API Key');
      return;
    }

    setError(null);
    const userContent = input.trim();
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userContent,
      timestamp: new Date(),
    };

    const assistantId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setIsStreaming(true);

    const history = [...messages, userMessage]
      .filter((m) => m.id !== '1')
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    try {
      const client = new Anthropic({
        apiKey: apiKey.trim(),
        dangerouslyAllowBrowser: true,
      });

      const stream = client.messages.stream({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        system: [
          {
            type: 'text',
            text: SYSTEM_PROMPT,
            // @ts-ignore cache_control is valid in the API
            cache_control: { type: 'ephemeral' },
          },
        ],
        messages: history,
      });

      abortRef.current = () => stream.abort();

      let accumulated = '';
      for await (const event of stream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          accumulated += event.delta.text;
          const snapshot = accumulated;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: snapshot } : m
            )
          );
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('aborted') || msg.includes('abort')) {
        // user aborted — leave partial content
      } else {
        setError(`请求失败：${msg}`);
        setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [input, isStreaming, apiKey, messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAbort = () => abortRef.current?.();
  const handleClear = () => {
    setMessages(initialMessages);
    setError(null);
  };

  const isConfigured = !!apiKey.trim();

  return (
    <section
      ref={sectionRef}
      id="chat"
      className="chat-section relative min-h-screen flex items-start md:items-center py-24 md:py-20 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-red-600/5 to-transparent" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto w-full px-4 md:px-12">

        {/* Header */}
        <div
          className={`mb-6 md:mb-8 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="h-1 w-14 md:w-20 bg-red-600 flex-shrink-0" />
              <div>
                <span className="text-green-500 font-mono text-xs block mb-1">SECTION 02</span>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold chat-title flex items-center gap-3 md:gap-4">
                  <Terminal className="w-8 h-8 md:w-10 md:h-10 text-red-600 flex-shrink-0" />
                  对话终端
                </h2>
              </div>
            </div>
            <button
              onClick={() => setShowApiInput((v) => !v)}
              className={`self-start md:self-center flex items-center gap-2 px-4 py-2.5 border font-mono text-xs transition-colors touch-target ${
                isConfigured
                  ? 'border-green-600/50 text-green-500 hover:border-green-500'
                  : 'border-red-600/50 text-red-400 hover:border-red-500 animate-pulse'
              }`}
            >
              <Key className="w-3 h-3" />
              {isConfigured ? 'API KEY ✓' : '设置 API KEY'}
            </button>
          </div>
        </div>

        {/* API Key input panel */}
        {showApiInput && (
          <div className="mb-4 api-key-panel border p-4 font-mono text-sm">
            <div className="panel-hint mb-3 text-xs">
              支持 Anthropic (sk-ant-*) · DeepSeek (sk-*) · OpenAI — 仅存于本地 localStorage
            </div>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => saveApiKey(e.target.value)}
                  placeholder="sk-ant-... 或 sk-..."
                  className="api-key-input w-full px-3 py-2.5 focus:outline-none text-sm font-mono"
                />
              </div>
              <button
                onClick={() => setShowApiKey((v) => !v)}
                className="px-3 py-2 panel-btn transition-colors touch-target"
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setShowApiInput(false)}
                className="px-4 py-2 bg-red-600 text-white text-xs hover:bg-red-700 transition-colors touch-target"
              >
                确认
              </button>
            </div>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="mb-4 border border-red-600/50 bg-red-900/20 px-4 py-3 font-mono text-sm text-red-400">
            ✗ {error}
          </div>
        )}

        {/* Terminal container */}
        <div
          className={`terminal-container transition-all duration-700 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          {/* Terminal header */}
          <div className="terminal-header flex items-center justify-between px-4 py-3 border-b">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <span className="terminal-hint font-mono text-xs">mao-xuan.terminal</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleClear}
                className="terminal-hint hover:text-red-500 transition-colors touch-target"
                title="清空对话"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <Cpu className="w-4 h-4 text-green-500" />
              <span className="text-green-500 font-mono text-xs">
                {isStreaming ? 'PROCESSING' : 'READY'}
              </span>
            </div>
          </div>

          {/* Messages area */}
          <div className="terminal-messages h-[58vh] md:h-[600px] min-h-[360px] overflow-y-auto p-4 md:p-6 space-y-5">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`font-mono text-base leading-relaxed ${
                  message.role === 'assistant' ? 'msg-assistant' : 'msg-user'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5 msg-meta">
                  <span className="text-xs">
                    [{message.timestamp.toLocaleTimeString('zh-CN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}]
                  </span>
                  <span className="text-xs font-semibold">
                    {message.role === 'assistant' ? '毛泽东' : '同志'}
                  </span>
                </div>
                <div className="pl-3 md:pl-4 msg-border-l border-l-2 leading-relaxed">
                  {message.role === 'assistant' && (
                    <span className="text-red-500 mr-2">&gt;</span>
                  )}
                  <span className="whitespace-pre-wrap">{message.content}</span>
                  {isStreaming &&
                    message.role === 'assistant' &&
                    message === messages[messages.length - 1] && (
                      <span className="inline-block w-2 h-[1em] bg-green-400 ml-1 animate-pulse align-middle" />
                    )}
                </div>
              </div>
            ))}

            {isStreaming && messages[messages.length - 1]?.content === '' && (
              <div className="font-mono text-base msg-assistant">
                <div className="pl-3 md:pl-4 msg-border-l border-l-2">
                  <span className="text-red-500 mr-2">&gt;</span>
                  <span className="animate-pulse">调查研究中...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="terminal-input border-t p-3 md:p-4">
            <div className="flex gap-2 md:gap-3 items-end">
              <span className="flex-shrink-0 terminal-hint font-mono text-base pb-1">&gt;</span>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
                }}
                onKeyDown={handleKeyDown}
                placeholder={isConfigured ? '说说你的情况...' : '请先设置 API Key ↗'}
                className="input-textarea flex-1 bg-transparent font-mono text-base resize-none focus:outline-none"
                rows={1}
                style={{ minHeight: '28px', maxHeight: '150px' }}
                disabled={isStreaming}
              />
              {isStreaming ? (
                <button
                  onClick={handleAbort}
                  className="flex-shrink-0 min-w-[56px] px-3 md:px-4 py-2.5 border border-red-600/50 text-red-500 hover:bg-red-600/10 transition-colors font-mono text-xs touch-target"
                >
                  停止
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || !isConfigured}
                  className="flex-shrink-0 w-11 h-11 md:w-auto md:h-auto md:px-4 md:py-2.5 flex items-center justify-center bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors touch-target"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="mt-2 text-xs terminal-hint font-mono hidden md:block">
              [Enter] 发送 · [Shift+Enter] 换行 · 模型: claude-sonnet-4-6
            </div>
            <div className="mt-2 text-xs terminal-hint font-mono md:hidden">
              Enter 发送 · Shift+Enter 换行
            </div>
          </div>
        </div>

        {/* Quick commands */}
        <div
          className={`mt-4 md:mt-6 flex flex-wrap gap-2 md:gap-3 transition-all duration-700 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {quickCommands.map((cmd) => (
            <button
              key={cmd}
              onClick={() => {
                setInput(cmd);
                textareaRef.current?.focus();
              }}
              disabled={isStreaming}
              className="quick-cmd px-3 md:px-4 py-2 border font-mono text-xs md:text-sm hover:border-red-600/50 transition-colors disabled:opacity-40 touch-target"
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
