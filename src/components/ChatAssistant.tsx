/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, User, ChevronRight } from 'lucide-react';
import Markdown from 'react-markdown';
import { chatWithAssistant } from '../lib/gemini';
import { UserPreferences } from '../types';

interface Props {
  preferences: UserPreferences;
  onComplete: () => void;
  embedded?: boolean;
}

export default function ChatAssistant({ preferences, onComplete, embedded }: Props) {
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; content: string }[]>([
    { 
      role: 'model', 
      content: `Hi! I'm ${preferences.assistantName}. ${embedded ? "How can I help you with your checklist today?" : `As ${preferences.assistantPersona}, I'll help you set up your home step by step. Let's start with your move! What kind of place are you moving to? 🌿`}`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));
      
      const response = await chatWithAssistant(
        userMsg, 
        history, 
        preferences.assistantPersona,
        {
          city: preferences.targetCity,
          budget: preferences.budget,
          accommodation: preferences.accommodationType
        }
      );
      setMessages(prev => [...prev, { role: 'model', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', content: "I'm sorry, I'm having a little trouble connecting. Could you try again? 🌿" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex flex-col ${embedded ? 'h-full' : 'h-[85vh] max-h-[800px]'}`}>
      {!embedded && (
        <div className="flex items-center gap-3 mb-6 p-2 bg-sage/10 rounded-2xl border border-sage/10">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm ${
             preferences.assistantPersona === 'The Decorator' ? 'bg-terracotta' : 
             preferences.assistantPersona === 'The Budget Master' ? 'bg-sage' : 
             'bg-olive'
          }`}>
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="font-medium text-ink">{preferences.assistantName}</h2>
            <p className="text-[10px] uppercase tracking-wider text-olive font-bold">{preferences.assistantPersona}</p>
          </div>
          <button 
            onClick={onComplete}
            className="ml-auto text-olive flex items-center gap-1 font-semibold hover:bg-sage/20 px-3 py-2 rounded-xl transition-colors"
          >
            Skip to Setup <ChevronRight size={18} />
          </button>
        </div>
      )}

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-6 pb-24 scroll-smooth pr-2"
        style={{ scrollbarWidth: 'none' }}
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user' ? 'bg-terracotta text-white' : 'bg-sage text-white shadow-sm'
                }`}>
                  {msg.role === 'user' ? <User size={14} /> : <Sparkles size={14} />}
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-white rounded-tr-none text-ink border border-white/40' 
                    : 'bg-white rounded-tl-none text-ink border border-white/40 shadow-sm'
                }`}>
                  <div className={`prose prose-sm font-sans ${msg.role === 'model' ? 'serif-italic' : ''}`}>
                    <Markdown>{msg.content}</Markdown>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-sage flex items-center justify-center">
                <Sparkles size={14} className="animate-pulse text-white" />
              </div>
              <div className="bg-white/40 p-4 rounded-2xl rounded-tl-none flex gap-1 items-center border border-white/40">
                <span className="w-1.5 h-1.5 bg-olive/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-olive/40 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                <span className="w-1.5 h-1.5 bg-olive/40 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className={`fixed bottom-6 left-6 right-6 ${embedded ? 'max-w-none' : 'max-w-md mx-auto'}`}>
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={embedded ? "Ask Sage anything..." : "Talk to Sage..."}
            className="w-full bg-white backdrop-blur-[10px] border-2 border-white/40 rounded-3xl pl-5 pr-14 py-4 focus:outline-none focus:border-olive shadow-xl text-ink placeholder:text-ink/30 font-medium"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-3 bg-olive text-white rounded-2xl disabled:opacity-50 disabled:scale-95 transition-all shadow-lg hover:shadow-olive/20 disabled:hover:shadow-none"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
