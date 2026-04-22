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
      { threshold: 0.1 }
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

    // Build conversation history for API (exclude the initial system message and the empty assistant placeholder)
    const history = [...messages, userMessage]
      .filter((m) => m.id !== '1') // exclude initial greeting
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
            // @ts-expect-error cache_control is valid in the API but not yet in all TS types
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

  const handleAbort = () => {
    abortRef.current?.();
  };

  const handleClear = () => {
    setMessages(initialMessages);
    setError(null);
  };

  const isConfigured = !!apiKey.trim();

  return (
    <section
      ref={sectionRef}
      id="chat"
      className="relative min-h-screen flex items-center py-20 bg-black overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-red-600/5 to-transparent" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto w-full px-6 md:px-12">
        {/* Header */}
        <div
          className={`flex items-center justify-between gap-6 mb-8 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="flex items-center gap-6">
            <div className="h-1 w-20 bg-red-600" />
            <div>
              <span className="text-green-500 font-mono text-sm block mb-1">SECTION 02</span>
              <h2 className="text-5xl md:text-6xl font-bold text-white flex items-center gap-4">
                <Terminal className="w-10 h-10 text-red-600" />
                对话终端
              </h2>
            </div>
          </div>
          {/* API Key toggle button */}
          <button
            onClick={() => setShowApiInput((v) => !v)}
            className={`flex items-center gap-2 px-4 py-2 border font-mono text-xs transition-colors ${
              isConfigured
                ? 'border-green-600/50 text-green-500 hover:border-green-500'
                : 'border-red-600/50 text-red-400 hover:border-red-500 animate-pulse'
            }`}
          >
            <Key className="w-3 h-3" />
            {isConfigured ? 'API KEY ✓' : '设置 API KEY'}
          </button>
        </div>

        {/* API Key input panel */}
        {showApiInput && (
          <div className="mb-4 border border-gray-800 bg-gray-900/80 p-4 font-mono text-sm">
            <div className="text-gray-400 mb-2 text-xs">
              ANTHROPIC API KEY — 仅存于本地 localStorage，不会上传
            </div>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => saveApiKey(e.target.value)}
                  placeholder="sk-ant-..."
                  className="w-full bg-black border border-gray-700 text-white px-3 py-2 focus:outline-none focus:border-red-600 text-sm font-mono"
                />
              </div>
              <button
                onClick={() => setShowApiKey((v) => !v)}
                className="px-3 py-2 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setShowApiInput(false)}
                className="px-4 py-2 bg-red-600 text-white text-xs hover:bg-red-700 transition-colors"
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
          className={`border border-gray-800 bg-black/80 transition-all duration-700 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          {/* Terminal header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-900/50">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-600" />
                <div className="w-3 h-3 rounded-full bg-yellow-600" />
                <div className="w-3 h-3 rounded-full bg-green-600" />
              </div>
              <span className="text-gray-500 font-mono text-xs">mao-xuan.terminal</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleClear}
                className="text-gray-600 hover:text-gray-400 transition-colors"
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
          <div className="h-[500px] overflow-y-auto p-4 space-y-4 scanlines">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`font-mono text-sm ${
                  message.role === 'assistant' ? 'text-green-400' : 'text-white'
                }`}
              >
                <div className="flex items-center gap-2 mb-1 opacity-50">
                  <span className="text-xs">
                    [
                    {message.timestamp.toLocaleTimeString('zh-CN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                    ]
                  </span>
                  <span className="text-xs">
                    {message.role === 'assistant' ? '毛泽东' : '同志'}
                  </span>
                </div>
                <div className="pl-4 border-l-2 border-gray-700">
                  {message.role === 'assistant' && (
                    <span className="text-red-500 mr-2">&gt;</span>
                  )}
                  <span className="whitespace-pre-wrap">{message.content}</span>
                  {/* Cursor for actively streaming message */}
                  {isStreaming &&
                    message.role === 'assistant' &&
                    message === messages[messages.length - 1] && (
                      <span className="inline-block w-2 h-4 bg-green-400 ml-1 animate-pulse align-middle" />
                    )}
                </div>
              </div>
            ))}

            {/* Streaming indicator when assistant message is empty */}
            {isStreaming && messages[messages.length - 1]?.content === '' && (
              <div className="font-mono text-sm text-green-400">
                <div className="pl-4 border-l-2 border-gray-700">
                  <span className="text-red-500 mr-2">&gt;</span>
                  <span className="animate-pulse">调查研究中...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="border-t border-gray-800 p-4">
            <div className="flex gap-3 items-end">
              <span className="flex-shrink-0 text-gray-500 font-mono text-sm pb-1">&gt;</span>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  // auto-resize
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                }}
                onKeyDown={handleKeyDown}
                placeholder={isConfigured ? '说说你的情况...' : '请先设置 API Key ↗'}
                className="flex-1 bg-transparent text-white font-mono text-sm resize-none focus:outline-none placeholder:text-gray-600"
                rows={1}
                style={{ minHeight: '24px', maxHeight: '120px' }}
                disabled={isStreaming}
              />
              {isStreaming ? (
                <button
                  onClick={handleAbort}
                  className="flex-shrink-0 px-4 py-2 border border-red-600/50 text-red-500 hover:bg-red-600/10 transition-colors font-mono text-xs"
                >
                  停止
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || !isConfigured}
                  className="flex-shrink-0 px-4 py-2 bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="mt-2 text-xs text-gray-600 font-mono">
              [Enter] 发送 · [Shift+Enter] 换行 · 模型: claude-sonnet-4-6
            </div>
          </div>
        </div>

        {/* Quick commands */}
        <div
          className={`mt-6 flex flex-wrap gap-3 transition-all duration-700 delay-500 ${
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
              className="px-4 py-2 border border-gray-800 text-gray-400 font-mono text-sm hover:border-red-600/50 hover:text-white transition-colors disabled:opacity-40"
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
