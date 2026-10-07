import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Send, 
  Sparkles, 
  MessageSquare, 
  BookOpen, 
  Users, 
  Target, 
  TrendingUp,
  Brain,
  Lightbulb,
  FileText,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from '@/context/AuthContext';

export default function TeacherAI() {
  const outletCtx = useOutletContext<{ teacher?: any }>() || {};
  const { user: authUser } = useAuth();
  const teacher = outletCtx?.teacher || {
    id: authUser?.id || 'tea_1',
    name: authUser?.name || 'Professeur ITMC',
    email: authUser?.email || 'professeur@itmc.cm'
  };
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial welcome message
    setMessages([
      { 
        id: 1, 
        role: 'assistant', 
        content: `Bonjour ${teacher?.name || 'Professeur'}, je suis votre assistant pédagogique ITMC. Comment puis-je vous aider aujourd'hui ? Je peux analyser les performances de vos étudiants, vous aider à concevoir des quiz ou organiser votre planning.`,
        type: 'text'
      }
    ]);
  }, [teacher]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input,
          context: {
            role: 'teacher',
            teacherData: teacher
          }
        })
      });

      const data = await response.json();
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: "Désolé, j'ai rencontré une erreur technique. Veuillez réessayer." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const suggestions = [
    { title: "Analyser G1", sub: "Performance en Algorithmique", icon: Target, color: "text-blue-500" },
    { title: "Créer un Quiz", sub: "Introduction à l'IA", icon: Brain, color: "text-purple-500" },
    { title: "Planifier TP", sub: "Optimiser les créneaux", icon: TrendingUp, color: "text-emerald-500" },
  ];

  return (
    <div className="h-[calc(100vh-160px)] flex gap-6 pb-4">
      <div className="flex-1 flex flex-col gap-6">
        {/* Chat Area */}
        <Card className="flex-1 border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-900 text-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black tracking-tight">ITMC Assistant <span className="text-blue-400">Pédagogique</span></h3>
                  <Badge className="bg-blue-600/20 text-blue-400 border-blue-400/30 font-black text-[8px] uppercase">Omni Flash</Badge>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Optimisé pour CFP-ITMC v2.4</p>
              </div>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-slate-50/30 dark:bg-slate-800/10">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex gap-4",
                  msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl shrink-0 flex items-center justify-center overflow-hidden border-2",
                  msg.role === 'assistant' ? "bg-slate-900 border-slate-800" : "bg-blue-600 border-blue-500"
                )}>
                  {msg.role === 'assistant' ? <Zap className="w-5 h-5 text-white" /> : <AvatarImage src={teacher.avatar} />}
                </div>
                <div className={cn(
                  "p-6 rounded-3xl shadow-sm max-w-[80%]",
                  msg.role === 'assistant' 
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-tl-none border border-slate-100 dark:border-slate-700" 
                    : "bg-blue-600 text-white rounded-tr-none"
                )}>
                  <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white animate-pulse" />
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl rounded-tl-none border border-slate-100 shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-50 dark:border-slate-800">
            <form onSubmit={handleSend} className="flex items-center gap-4">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Posez une question sur vos cours ou vos étudiants..." 
                className="flex-1 h-14 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 font-medium focus:ring-2 ring-blue-500/20 transition-all outline-none text-sm"
              />
              <Button 
                type="submit"
                disabled={!input.trim() || isTyping}
                className="h-14 w-14 rounded-2xl bg-slate-900 dark:bg-white dark:text-slate-900 text-white flex items-center justify-center shadow-xl hover:scale-105 transition-transform disabled:opacity-50"
              >
                <Send className="w-6 h-6" />
              </Button>
            </form>
          </div>
        </Card>
      </div>

      {/* Insights Panel */}
      <div className="w-80 hidden xl:flex flex-col gap-6">
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] p-8">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Suggestions IA</h4>
          <div className="space-y-4">
            {suggestions.map((item, idx) => (
              <button 
                key={idx}
                onClick={() => setInput(item.sub)}
                className="w-full text-left p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-transparent hover:border-blue-100 transition-all group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <item.icon className={cn("w-4 h-4", item.color)} />
                  <span className="text-xs font-black text-slate-900 dark:text-white">{item.title}</span>
                </div>
                <p className="text-[10px] font-medium text-slate-500 line-clamp-1">{item.sub}</p>
              </button>
            ))}
          </div>
        </Card>

        <Card className="flex-1 border-none shadow-sm bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white overflow-hidden relative group">
          <div className="relative z-10">
            <Lightbulb className="w-8 h-8 mb-4 text-blue-200" />
            <h4 className="text-lg font-black tracking-tight mb-2">Analyse Rapide</h4>
            <div className="space-y-4 mt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-red-300 shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-blue-50">3 étudiants du G2 sont en zone rouge d'absentéisme.</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-blue-50">Taux de réussite en hausse (+12%) sur le dernier quiz.</p>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-8 bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl font-black text-[10px] uppercase h-10">Rapport Étendu</Button>
          </div>
          <Sparkles className="absolute -bottom-10 -right-10 w-40 h-40 opacity-10 group-hover:scale-125 transition-transform duration-700" />
        </Card>
      </div>
    </div>
  );
}
