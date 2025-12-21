
import { translations } from './i18n';

export const getTemplates = (lang: 'en' | 'es' = 'en') => {
  const t = translations[lang].templates;

  return {
    // 1. DASHBOARD
    dashboard: `
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line 
} from 'recharts';
import { Activity, TrendingUp, Users, DollarSign, Calendar } from 'lucide-react';

// --- MOCK DATA GENERATORS ---
const generateData = () => Array.from({ length: 7 }, (_, i) => ({
  name: ${t.dashboard.days}[i],
  value: Math.floor(Math.random() * 5000) + 1000,
  prev: Math.floor(Math.random() * 5000) + 1000,
}));

export default function DashboardSkeleton() {
  const [data, setData] = useState(generateData());

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans overflow-hidden">
      
      {/* HEADER */}
      <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-lg font-bold">${t.dashboard.title}</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">${t.dashboard.subtitle}</p>
        </div>
        <div className="flex gap-2">
           {/* ACTIONS */}
           <button onClick={() => setData(generateData())} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
              <Activity size={16} />
           </button>
        </div>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="max-w-5xl mx-auto space-y-6">
          
          {/* STATS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             {/* STAT CARD 1 */}
             <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                   <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                      <TrendingUp size={18} />
                   </div>
                   <span className="text-xs font-medium text-zinc-500">${t.dashboard.revenue}</span>
                </div>
                <div className="text-2xl font-bold">$12,450</div>
             </div>
             
             {/* STAT CARD 2 */}
             <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                   <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                      <Users size={18} />
                   </div>
                   <span className="text-xs font-medium text-zinc-500">${t.dashboard.users}</span>
                </div>
                <div className="text-2xl font-bold">1,203</div>
             </div>

             {/* STAT CARD 3 */}
             <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                   <div className="p-2 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-lg">
                      <DollarSign size={18} />
                   </div>
                   <span className="text-xs font-medium text-zinc-500">${t.dashboard.profit}</span>
                </div>
                <div className="text-2xl font-bold">84%</div>
             </div>
          </div>

          {/* MAIN CHART AREA */}
          <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm h-[300px]">
             <h3 className="text-sm font-bold mb-4">${t.dashboard.trends}</h3>
             <div className="w-full h-[220px]">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                   <BarChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#52525b" opacity={0.2} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 12}} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#f4f4f5' }}
                        itemStyle={{ color: '#e4e4e7' }}
                        cursor={{fill: '#f4f4f5', opacity: 0.1}}
                      />
                      <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                   </BarChart>
                </ResponsiveContainer>
             </div>
          </div>
          
          {/* SECONDARY SECTION (List or Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Add more widgets here */}
          </div>

        </div>
      </div>
    </div>
  );
  `,

    // 2. CHAT
    chat: `
import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, Loader2, Eraser } from 'lucide-react';
import { useChat } from 'ouroboros';

export default function ChatSkeleton() {
  // Config: 'standard', 'fast', 'thinking', 'search', or 'maps'
  const { sendMessage, messages, loading } = useChat({ mode: 'standard' });
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;
    const txt = input;
    setInput('');
    await sendMessage(txt);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">
      
      {/* HEADER */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0">
        <div className="flex items-center gap-3">
           <div className="w-9 h-9 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700">
              <Bot size={18} />
           </div>
           <div>
              <h2 className="text-sm font-bold">${t.chat.title}</h2>
              <div className="flex items-center gap-1.5">
                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                 <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">${t.chat.status}</span>
              </div>
           </div>
        </div>
      </div>

      {/* MESSAGES */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar scroll-smooth">
         {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-zinc-400 dark:text-zinc-600 opacity-50">
               <Sparkles size={48} className="mb-4" strokeWidth={1} />
               <p className="text-sm">${t.chat.welcome}</p>
            </div>
         )}
         
         {messages.map((m, i) => (
           <div key={i} className={\`flex \${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300\`}>
              <div className={\`
                 max-w-[85%] rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-sm
                 \${m.role === 'user' 
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-br-none' 
                    : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-bl-none'}
              \`}>
                 {m.text}
              </div>
           </div>
         ))}
         
         {loading && (
             <div className="flex justify-start animate-in fade-in">
               <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-2">
                 <Loader2 size={14} className="animate-spin text-zinc-400" />
                 <span className="text-xs text-zinc-500 dark:text-zinc-400">${t.chat.thinking}</span>
               </div>
             </div>
         )}
      </div>

      {/* INPUT */}
      <form onSubmit={handleSend} className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0">
        <div className="relative flex items-center gap-2">
          <input 
             className="flex-1 pl-4 pr-12 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-zinc-100/10 focus:border-zinc-400 dark:focus:border-zinc-500 transition-all placeholder:text-zinc-400"
             placeholder="${t.chat.placeholder}"
             value={input}
             onChange={e => setInput(e.target.value)}
             disabled={loading}
          />
          <button 
             type="submit" 
             disabled={!input.trim() || loading}
             className="absolute right-2 p-1.5 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-700 dark:hover:bg-zinc-300 text-white dark:text-zinc-900 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
             <Send size={14} />
          </button>
        </div>
      </form>
    </div>
  );
}
  `,

    // 3. LIST / KANBAN
    list: `
import React, { useState } from 'react';
import { Plus, MoreHorizontal, Search, CheckCircle2, Circle, Trash2 } from 'lucide-react';

export default function ListSkeleton() {
  const [items, setItems] = useState([
    { id: 1, title: "${t.list.items[0].title}", tag: "${t.list.items[0].tag}", done: false },
    { id: 2, title: "${t.list.items[1].title}", tag: "${t.list.items[1].tag}", done: true },
    { id: 3, title: "${t.list.items[2].title}", tag: "${t.list.items[2].tag}", done: false },
  ]);
  const [filter, setFilter] = useState('');

  const toggle = (id) => setItems(items.map(i => i.id === id ? { ...i, done: !i.done } : i));
  const remove = (id) => setItems(items.filter(i => i.id !== id));

  const filtered = items.filter(i => i.title.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">
      
      {/* HEADER */}
      <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex flex-col gap-4 bg-white dark:bg-zinc-900">
         <div className="flex justify-between items-center">
            <h1 className="text-lg font-bold">${t.list.title}</h1>
            <button className="p-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:opacity-90 transition-opacity">
               <Plus size={16} />
            </button>
         </div>
         {/* SEARCH */}
         <div className="relative">
            <Search size={14} className="absolute left-3 top-3 text-zinc-400" />
            <input 
               value={filter}
               onChange={e => setFilter(e.target.value)}
               placeholder="${t.list.filter}"
               className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors"
            />
         </div>
      </div>

      {/* LIST */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
         <div className="space-y-2">
            {filtered.map((item) => (
               <div key={item.id} className="group flex items-center justify-between p-3 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-zinc-300 dark:hover:border-zinc-600 hover:shadow-sm transition-all">
                  <div className="flex items-center gap-3">
                     <button onClick={() => toggle(item.id)} className={\`transition-colors \${item.done ? 'text-emerald-500' : 'text-zinc-300 dark:text-zinc-600 hover:text-zinc-500'}\`}>
                        {item.done ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                     </button>
                     <div className="flex flex-col">
                        <span className={\`text-sm font-medium transition-all \${item.done ? 'text-zinc-400 line-through' : 'text-zinc-700 dark:text-zinc-200'}\`}>{item.title}</span>
                        <span className="text-[10px] text-zinc-400">{item.tag}</span>
                     </div>
                  </div>
                  <button onClick={() => remove(item.id)} className="opacity-0 group-hover:opacity-100 p-2 text-zinc-400 hover:text-red-500 transition-all">
                     <Trash2 size={14} />
                  </button>
               </div>
            ))}
         </div>
      </div>
      
      {/* FOOTER */}
      <div className="px-6 py-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 text-xs text-zinc-400 flex justify-between">
         <span>{items.filter(i => !i.done).length} ${t.list.remaining}</span>
         <span>{Math.round((items.filter(i => i.done).length / items.length) * 100)}% ${t.list.done}</span>
      </div>
    </div>
  );
}
  `,

    // 4. TOOL
    tool: `
import React, { useState } from 'react';
import { Settings, ChevronRight } from 'lucide-react';

export default function ToolSkeleton() {
  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 font-sans p-6">
       <div className="w-full max-w-md mx-auto my-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
          
          <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-800/30">
             <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center mb-4 border border-zinc-200 dark:border-zinc-700">
                <Settings size={20} className="text-zinc-700 dark:text-zinc-300" />
             </div>
             <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">${t.tool.title}</h2>
             <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">${t.tool.desc}</p>
          </div>

          <div className="p-6 space-y-4">
             {/* INPUTS GO HERE */}
             <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">${t.tool.label}</label>
                <input className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-zinc-900/5 dark:focus:ring-zinc-100/5 focus:border-zinc-400 transition-all" placeholder="${t.tool.placeholder}" />
             </div>

             <button className="w-full py-2.5 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 text-white dark:text-zinc-900 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                <span>${t.tool.calculate}</span>
                <ChevronRight size={14} />
             </button>
          </div>
          
          <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-950/50 border-t border-zinc-100 dark:border-zinc-800">
             <div className="text-xs text-center text-zinc-400 font-mono">${t.tool.output}: <span className="text-zinc-900 dark:text-zinc-100 font-bold">0.00</span></div>
          </div>
       </div>
    </div>
  );
}
`
  };
};

export type TemplateId = keyof ReturnType<typeof getTemplates>;
