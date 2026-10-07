import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Sparkles, 
  User, 
  Bot, 
  BookOpen, 
  BrainCircuit, 
  History,
  Trash2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIChatPage() {
  const [messages, setMessages] = React.useState<Message[]>([
    {
      role: 'assistant',
      content: "Bonjour ! Je suis l'assistant IA du CFP-ITMC. Comment puis-je vous aider aujourd'hui ? Je peux vous renseigner sur nos formations, aider à la pédagogie ou répondre à vos questions techniques.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input,
          context: {
            page: 'dashboard_ai',
            institution: 'CFP-ITMC'
          }
        })
      });

      const data = await response.json();
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.text || "Désolé, je rencontre une petite difficulté technique.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="min-h-[calc(100vh-10rem)] lg:h-[calc(100vh-10rem)] flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-blue-600" />
            Assistant IA ITMC
          </h1>
          <p className="text-slate-500 mt-1">Votre partenaire pédagogique intelligent disponible 24h/7j.</p>
        </div>
        <Button variant="outline" className="gap-2 text-red-600 hover:text-red-700 w-full sm:w-auto" onClick={() => setMessages([messages[0]])}>
          <Trash2 className="w-4 h-4" />
          Effacer la discussion
        </Button>
      </div>

      <div className="flex-1 flex gap-8 min-h-0">
        {/* Sidebar Suggestions */}
        <div className="hidden lg:flex flex-col gap-6 w-80">
          <Card className="border-none shadow-sm bg-blue-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
            <CardContent className="p-6 relative z-10">
              <BrainCircuit className="w-10 h-10 mb-4 opacity-80" />
              <h3 className="font-bold text-lg mb-2">Capacités de l'IA</h3>
              <ul className="text-sm space-y-3 opacity-90">
                <li className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-white mt-1.5 shrink-0" />
                  Explication de concepts techniques complexes
                </li>
                <li className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-white mt-1.5 shrink-0" />
                  Génération de quiz et exercices d'entraînement
                </li>
                <li className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-white mt-1.5 shrink-0" />
                  Résumé de cours et supports PDF
                </li>
              </ul>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest px-2">Suggestions</h4>
            {[
              "Comment s'inscrire au CFP-ITMC ?",
              "Explique-moi le développement Web React.",
              "Crée-moi un quiz sur le Marketing Digital.",
              "Quelles sont les spécialités disponibles ?"
            ].map((suggestion) => (
              <Button 
                key={suggestion}
                variant="outline" 
                className="w-full justify-start text-left text-sm h-auto py-3 px-4 rounded-xl border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all whitespace-normal"
                onClick={() => setInput(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>

        {/* Chat Main Area */}
        <Card className="flex-1 border-none shadow-xl flex flex-col bg-white dark:bg-slate-900 overflow-hidden rounded-3xl">
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar" ref={scrollRef}>
            <div className="space-y-8 max-w-4xl mx-auto">
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex gap-4 max-w-[85%]",
                      msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                    )}
                  >
                    <Avatar className={cn(
                      "w-10 h-10 shrink-0 border-2",
                      msg.role === 'user' ? "border-blue-100" : "border-slate-100"
                    )}>
                      {msg.role === 'user' ? (
                        <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" />
                      ) : (
                        <div className="bg-blue-600 w-full h-full flex items-center justify-center text-white">
                          <Bot className="w-5 h-5" />
                        </div>
                      )}
                      <AvatarFallback>{msg.role === 'user' ? 'U' : 'AI'}</AvatarFallback>
                    </Avatar>
                    
                    <div className="space-y-2">
                      <div className={cn(
                        "p-4 rounded-3xl text-sm leading-relaxed shadow-sm",
                        msg.role === 'user' 
                          ? "bg-blue-600 text-white rounded-tr-none" 
                          : "bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-700"
                      )}>
                        {msg.content}
                      </div>
                      <span className={cn(
                        "text-[10px] text-slate-400 font-medium px-2",
                        msg.role === 'user' ? "text-right block" : ""
                      )}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isLoading && (
                <div className="flex gap-4 mr-auto max-w-[85%]">
                   <div className="bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-3xl rounded-tl-none border border-slate-100 dark:border-slate-700">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
            <div className="max-w-4xl mx-auto flex gap-4">
              <div className="flex-1 relative group">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Posez votre question pédagogique..."
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-sm outline-none focus:ring-2 ring-blue-500/20 shadow-sm transition-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
                   <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-600">
                    <History className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <Button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="h-auto px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/25 transition-all active:scale-95"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-center text-[10px] text-slate-400 mt-4">
              L'IA peut faire des erreurs. Vérifiez les informations importantes avec vos formateurs.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
