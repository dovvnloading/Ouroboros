

import { Widget } from '../types';

// Helper to inject strings based on lang
const getStrings = (lang: 'en' | 'es') => {
  if (lang === 'es') {
     return {
         webSearch: "Búsqueda Web",
         googleEnabled: "Búsqueda Google Activada",
         enterQuery: "Ingresa una consulta para buscar.",
         sources: "Fuentes",
         searching: "Buscando...",
         placeholder: "Consulta de búsqueda...",
         tasks: "Tareas",
         noTasks: "Sin tareas aún",
         newTask: "Nueva tarea...",
         timer: "Temporizador",
         focus: "Enfoque",
         break: "Descanso",
         scratchpad: "Bloc de Notas",
         typeNotes: "Escribe tus notas aquí...",
         chars: "caracteres"
     };
  }
  return {
      webSearch: "Web Search",
      googleEnabled: "Google Search Enabled",
      enterQuery: "Enter a query to search the web.",
      sources: "Sources",
      searching: "Searching...",
      placeholder: "Search query...",
      tasks: "Tasks",
      noTasks: "No tasks yet",
      newTask: "New task...",
      timer: "Timer",
      focus: "Focus",
      break: "Break",
      scratchpad: "Scratchpad",
      typeNotes: "Type your notes here...",
      chars: "chars"
  };
};

const getDesignerStrings = (lang: 'en' | 'es') => {
    if (lang === 'es') {
        return {
            suiteTitle: "Suite de Diseño",
            imgTitle: "Estudio de Imagen IA",
            imgDesc: "Generación Gemini Flash Image",
            promptPlaceholder: "Describe una imagen...",
            generate: "Generar",
            download: "Descargar",
            voiceTitle: "Narrador Neural",
            voiceDesc: "Síntesis de voz Gemini",
            textPlaceholder: "Escribe el guión aquí...",
            speak: "Hablar",
            speaking: "Reproduciendo..."
        };
    }
    return {
        suiteTitle: "Designer Suite",
        imgTitle: "AI Image Studio",
        imgDesc: "Gemini Flash Image Generation",
        promptPlaceholder: "Describe an image...",
        generate: "Generate",
        download: "Download",
        voiceTitle: "Neural Narrator",
        voiceDesc: "Gemini Speech Synthesis",
        textPlaceholder: "Type your script here...",
        speak: "Speak",
        speaking: "Playing..."
    };
};

const getAnalystStrings = (lang: 'en' | 'es') => {
  if (lang === 'es') {
    return {
      cryptoTitle: "Tablero Cripto",
      financeTitle: "Rastreador de Gastos",
      revenue: "Ingresos",
      expenses: "Gastos",
      profit: "Beneficio",
      addTx: "Agregar",
      updateTx: "Actualizar",
      cancel: "Cancelar",
      edit: "Editar",
      delete: "Borrar",
      liveData: "Datos en Vivo",
      simData: "Datos Simulados (Sin Red)",
      loading: "Cargando...",
      total: "Total",
      noTx: "Sin transacciones",
      itemName: "Nombre del ítem",
      itemValue: "Valor"
    };
  }
  return {
    cryptoTitle: "Crypto Dashboard",
    financeTitle: "Expense Tracker",
    revenue: "Revenue",
    expenses: "Expenses",
    profit: "Profit",
    addTx: "Add Item",
    updateTx: "Update",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    liveData: "Live Data",
    simData: "Simulated Data (Offline)",
    loading: "Loading...",
    total: "Total",
    noTx: "No transactions",
    itemName: "Item name",
    itemValue: "$"
  };
};

const getProductivityStrings = (lang: 'en' | 'es') => {
  if (lang === 'es') {
    return {
      kanbanTitle: "Tablero de Proyecto",
      calendarTitle: "Calendario",
      todo: "Por Hacer",
      doing: "En Progreso",
      done: "Hecho",
      addCard: "Añadir Tarjeta",
      events: "Eventos",
      months: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
      daysShort: ['D','L','M','M','J','V','S']
    };
  }
  return {
    kanbanTitle: "Project Board",
    calendarTitle: "Calendar",
    todo: "To Do",
    doing: "In Progress",
    done: "Done",
    addCard: "Add Card",
    events: "Events",
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    daysShort: ['S','M','T','W','T','F','S']
  };
};

const getArcadeStrings = (lang: 'en' | 'es') => {
  if (lang === 'es') {
    return {
      snakeTitle: "Snake Retro",
      sequencerTitle: "Creador de Ritmos",
      score: "Puntuación",
      gameOver: "Juego Terminado",
      restart: "Reiniciar",
      play: "Reproducir",
      stop: "Detener",
      clear: "Limpiar",
      paused: "PAUSA",
      highScore: "RÉCORD",
      finalScore: "PUNTUACIÓN FINAL"
    };
  }
  return {
    snakeTitle: "Retro Snake",
    sequencerTitle: "Beat Maker",
    score: "Score",
    gameOver: "Game Over",
    restart: "Restart",
    play: "Play",
    stop: "Stop",
    clear: "Clear",
    paused: "PAUSED",
    highScore: "HI",
    finalScore: "FINAL SCORE"
  };
};


const getSearchToolCode = (lang: 'en' | 'es') => {
  const s = getStrings(lang);
  return `
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Globe, Loader2, ExternalLink } from 'lucide-react';
import { useChat } from 'ouroboros';

export default function WebSearch() {
  const { sendMessage, messages, loading, groundingMetadata } = useChat({ mode: 'search' });
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;
    const txt = input;
    setInput('');
    await sendMessage(txt);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0">
        <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
           <Globe size={18} />
        </div>
        <div>
           <h2 className="text-sm font-bold">${s.webSearch}</h2>
           <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">${s.googleEnabled}</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
         {messages.length === 0 && (
            <div className="text-center mt-20 text-zinc-400">
               <Globe size={32} className="mx-auto mb-2 opacity-20" />
               <p className="text-xs">${s.enterQuery}</p>
            </div>
         )}
         {messages.map((m, i) => (
           <div key={i} className={\`flex \${m.role === 'user' ? 'justify-end' : 'justify-start'}\`}>
              <div className={\`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed \${m.role === 'user' ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200'}\`}>
                 {m.text}
              </div>
           </div>
         ))}
         
         {/* Sources Area */}
         {groundingMetadata?.groundingChunks && (
            <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl p-3 mt-4">
               <div className="flex items-center gap-2 mb-2">
                  <Globe size={12} className="text-blue-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">${s.sources}</span>
               </div>
               <div className="space-y-1.5">
                  {groundingMetadata.groundingChunks.map((chunk, idx) => chunk.web?.uri && (
                     <a key={idx} href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-zinc-800 p-1.5 rounded transition-colors group">
                        <span className="truncate flex-1 mr-2">{chunk.web.title || chunk.web.uri}</span>
                        <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                     </a>
                  ))}
               </div>
            </div>
         )}
         
         {loading && (
             <div className="flex justify-start">
               <div className="bg-zinc-100 dark:bg-zinc-800 rounded-2xl px-4 py-3 flex items-center gap-2">
                 <Loader2 size={14} className="animate-spin text-zinc-400" />
                 <span className="text-xs text-zinc-500">${s.searching}</span>
               </div>
             </div>
         )}
      </div>

      <form onSubmit={handleSend} className="pl-4 pr-8 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="relative">
          <input 
             className="w-full pl-4 pr-10 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-zinc-400"
             placeholder="${s.placeholder}"
             value={input}
             onChange={e => setInput(e.target.value)}
             disabled={loading}
          />
          <button 
             type="submit" 
             disabled={!input.trim() || loading}
             className="absolute right-2 top-2 p-1.5 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-700 text-white dark:text-zinc-900 rounded-lg disabled:opacity-50 disabled:bg-zinc-300 transition-colors"
          >
             <Send size={14} />
          </button>
        </div>
      </form>
    </div>
  );
}
`;
};

const getTaskListCode = (lang: 'en' | 'es') => {
  const s = getStrings(lang);
  return `
import React, { useState } from 'react';
import { Plus, Check, Trash2, CheckSquare, PenLine } from 'lucide-react';

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");

  const addTask = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: input, completed: false }]);
    setInput("");
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const removeTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950 font-sans">
      <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 dark:border-zinc-800">
         <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100">
                <CheckSquare size={18} />
            </div>
            <h2 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">${s.tasks}</h2>
         </div>
         <span className="text-xs font-mono text-zinc-400">{tasks.filter(t => t.completed).length}/{tasks.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
         {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-400">
                <p className="text-xs">${s.noTasks}</p>
            </div>
         ) : (
             <div className="space-y-2">
                {tasks.map(task => (
                <div key={task.id} className="group flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-xl hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                    <button 
                        onClick={() => toggleTask(task.id)}
                        className={\`w-5 h-5 rounded-full border flex items-center justify-center transition-all \${task.completed ? 'bg-zinc-900 dark:bg-zinc-100 border-zinc-900 dark:border-zinc-100 text-white dark:text-zinc-900' : 'bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600'}\`}
                    >
                        {task.completed && <Check size={12} strokeWidth={3} />}
                    </button>
                    <span className={\`flex-1 text-sm \${task.completed ? 'text-zinc-400 line-through' : 'text-zinc-700 dark:text-zinc-300'}\`}>
                        {task.text}
                    </span>
                    <button onClick={() => removeTask(task.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-400 hover:text-red-500 transition-all">
                        <Trash2 size={14} />
                    </button>
                </div>
                ))}
            </div>
         )}
      </div>

      <form onSubmit={addTask} className="pl-4 pr-8 py-4 border-t border-zinc-100 dark:border-zinc-800">
         <div className="flex gap-2">
            <div className="relative flex-1">
                <PenLine size={16} className="absolute left-3 top-3 text-zinc-400" />
                <input 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="${s.newTask}"
                  className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm outline-none focus:border-zinc-500 transition-colors"
                />
            </div>
            <button type="submit" disabled={!input.trim()} className="px-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg transition-colors">
               <Plus size={18} />
            </button>
         </div>
      </form>
    </div>
  );
}
`;
};

const getTimerCode = (lang: 'en' | 'es') => {
  const s = getStrings(lang);
  return `
import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

export default function Timer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('focus'); // focus | break

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const setModeType = (m) => {
    setMode(m);
    setIsActive(false);
    setTimeLeft(m === 'focus' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return \`\${mins.toString().padStart(2, '0')}:\${secs.toString().padStart(2, '0')}\`;
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950 items-center justify-center p-6 relative overflow-hidden">
       <div className="z-10 flex flex-col items-center w-full max-w-xs">
          <div className="flex gap-2 mb-8 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl">
             <button 
                onClick={() => setModeType('focus')}
                className={\`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all \${mode === 'focus' ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-zinc-100' : 'text-zinc-400 hover:text-zinc-600'}\`}
             >
                ${s.focus}
             </button>
             <button 
                onClick={() => setModeType('break')}
                className={\`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all \${mode === 'break' ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-zinc-100' : 'text-zinc-400 hover:text-zinc-600'}\`}
             >
                ${s.break}
             </button>
          </div>

          <div className="text-8xl font-mono font-bold text-zinc-900 dark:text-zinc-100 tracking-tighter mb-8 tabular-nums">
             {formatTime(timeLeft)}
          </div>

          <div className="flex items-center gap-4">
             <button 
               onClick={toggleTimer}
               className="w-16 h-16 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl"
             >
                {isActive ? <Pause fill="currentColor" /> : <Play fill="currentColor" className="ml-1" />}
             </button>
             <button 
               onClick={resetTimer}
               className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
             >
                <RotateCcw size={20} />
             </button>
          </div>
       </div>
    </div>
  );
}
`;
};

const getScratchpadCode = (lang: 'en' | 'es') => {
  const s = getStrings(lang);
  return `
import React, { useState } from 'react';
import { StickyNote } from 'lucide-react';

export default function Scratchpad() {
  const [text, setText] = useState('');

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950 font-sans">
       <div className="flex items-center gap-3 px-6 py-5 border-b border-zinc-100 dark:border-zinc-800">
           <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-yellow-600 dark:text-yellow-500">
              <StickyNote size={18} />
           </div>
           <h2 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">${s.scratchpad}</h2>
       </div>
       <textarea 
         className="flex-1 w-full bg-zinc-50 dark:bg-zinc-900 p-6 text-sm resize-none outline-none text-zinc-700 dark:text-zinc-300 leading-relaxed custom-scrollbar placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
         placeholder="${s.typeNotes}"
         value={text}
         onChange={e => setText(e.target.value)}
       />
       <div className="pl-4 pr-8 py-2 border-t border-zinc-100 dark:border-zinc-800 text-[10px] text-zinc-400 text-right">
          {text.length} ${s.chars}
       </div>
    </div>
  );
}
`;
};

const getImageStudioCode = (lang: 'en' | 'es') => {
    const s = getDesignerStrings(lang);
    return `
import React, { useState } from 'react';
import { Image, Download, Sparkles, Loader2, Maximize2 } from 'lucide-react';
import { useImageGen } from 'ouroboros';

export default function ImageStudio() {
  const { generate, loading } = useImageGen();
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState(null);

  const handleGen = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;
    try {
        const b64 = await generate(prompt, "1K");
        setResult(b64);
    } catch (err) {
        console.error(err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">
       {/* Header */}
       <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <div className="w-8 h-8 bg-fuchsia-50 dark:bg-fuchsia-900/20 rounded-lg flex items-center justify-center text-fuchsia-600 dark:text-fuchsia-400">
             <Image size={18} />
          </div>
          <div>
             <h2 className="text-sm font-bold">${s.imgTitle}</h2>
             <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">${s.imgDesc}</p>
          </div>
       </div>

       {/* Canvas */}
       <div className="flex-1 bg-zinc-100 dark:bg-zinc-900/50 p-4 flex items-center justify-center overflow-hidden relative group">
          {result ? (
              <div className="relative w-full h-full flex items-center justify-center">
                  <img src={result} alt="Generated" className="max-w-full max-h-full rounded-lg shadow-lg object-contain" />
                  <a 
                    href={result} 
                    download="gemini-gen.png"
                    className="absolute bottom-4 right-4 p-2 bg-white dark:bg-zinc-900 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                     <Download size={16} />
                  </a>
              </div>
          ) : (
              <div className="text-center text-zinc-400">
                  <Sparkles size={48} className="mx-auto mb-4 opacity-20" />
                  <p className="text-xs">1024x1024 • Gemini Flash Image</p>
              </div>
          )}
          
          {loading && (
             <div className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-10">
                <Loader2 size={32} className="animate-spin text-fuchsia-500" />
             </div>
          )}
       </div>

       {/* Controls */}
       <form onSubmit={handleGen} className="pl-4 pr-8 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 shrink-0">
          <div className="flex gap-2">
             <input 
               value={prompt}
               onChange={e => setPrompt(e.target.value)}
               placeholder="${s.promptPlaceholder}"
               className="flex-1 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm outline-none focus:border-fuchsia-500 transition-colors"
             />
             <button 
                type="submit" 
                disabled={!prompt.trim() || loading}
                className="px-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl font-medium disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
             >
                ${s.generate}
             </button>
          </div>
       </form>
    </div>
  );
}
    `;
};

const getTTSStudioCode = (lang: 'en' | 'es') => {
    const s = getDesignerStrings(lang);
    return `
import React, { useState } from 'react';
import { Mic, Play, Square, AudioWaveform, Volume2 } from 'lucide-react';
import { useTTS } from 'ouroboros';

export default function NeuralNarrator() {
  const { speak, loading } = useTTS();
  const [text, setText] = useState('');

  const handleSpeak = () => {
    if (!text.trim() || loading) return;
    speak(text);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">
       <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400">
             <Volume2 size={18} />
          </div>
          <div>
             <h2 className="text-sm font-bold">${s.voiceTitle}</h2>
             <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">${s.voiceDesc}</p>
          </div>
       </div>

       <div className="flex-1 p-4">
          <textarea 
             value={text}
             onChange={e => setText(e.target.value)}
             placeholder="${s.textPlaceholder}"
             className="w-full h-full bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 outline-none focus:border-indigo-500 transition-colors resize-none text-sm leading-relaxed"
          />
       </div>

       <div className="pl-4 pr-8 py-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
             {loading && (
                 <>
                    <AudioWaveform size={14} className="animate-pulse text-indigo-500" />
                    <span>${s.speaking}</span>
                 </>
             )}
          </div>
          <button 
            onClick={handleSpeak}
            disabled={!text.trim() || loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:shadow-none"
          >
             {loading ? <Square size={16} /> : <Play size={16} fill="currentColor" />}
             <span>${s.speak}</span>
          </button>
       </div>
    </div>
  );
}
    `;
};

// --- New Widgets for Analyst/Productivity/Arcade ---

const getCryptoTickerCode = (lang: 'en' | 'es') => {
  const s = getAnalystStrings(lang);
  return `
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Activity, RotateCcw, Wifi, WifiOff } from 'lucide-react';

const COINS = {
  BTC: { id: 'bitcoin', name: 'Bitcoin' },
  ETH: { id: 'ethereum', name: 'Ethereum' },
  SOL: { id: 'solana', name: 'Solana' }
};

export default function CryptoTicker() {
  const [selected, setSelected] = useState('BTC');
  const [priceData, setPriceData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLive, setIsLive] = useState(false);

  const fetchMarketData = async () => {
    setLoading(true);
    try {
        // Try to fetch real data from CoinGecko Public API
        const ids = Object.values(COINS).map(c => c.id).join(',');
        const res = await fetch(\`https://api.coingecko.com/api/v3/simple/price?ids=\${ids}&vs_currencies=usd&include_24hr_change=true\`);
        if (!res.ok) throw new Error("Rate Limit");
        const data = await res.json();
        setPriceData(data);
        setIsLive(true);
        generateTrend(data[COINS[selected].id].usd_24h_change);
    } catch (e) {
        // Fallback to simulation if API fails (CORS or Rate Limit)
        setIsLive(false);
        simulateData();
    } finally {
        setLoading(false);
    }
  };

  // Generate a trend curve that matches the 24h change direction
  // This ensures the "Simulation" is visually consistent with the "Real" percentage if we have it,
  // or just makes a nice looking chart if we are totally offline.
  const generateTrend = (changePct = 0) => {
     const points = 20;
     const arr = [];
     let val = 100;
     const trend = changePct > 0 ? 1 : -1;
     
     for(let i=0; i<points; i++) {
        // Random walk with drift based on trend
        const noise = (Math.random() - 0.5) * 5;
        const drift = (i / points) * (Math.abs(changePct) * 2) * trend;
        val = val + noise + drift;
        arr.push({ time: i, value: Math.max(10, val) });
     }
     setHistory(arr);
  };

  const simulateData = () => {
     const mockPrice = {
         bitcoin: { usd: 64230 + Math.random() * 100, usd_24h_change: 2.4 },
         ethereum: { usd: 3450 + Math.random() * 50, usd_24h_change: -1.2 },
         solana: { usd: 145 + Math.random() * 5, usd_24h_change: 5.7 }
     };
     setPriceData(mockPrice);
     generateTrend(mockPrice[COINS[selected.toLowerCase()]?.id || 'bitcoin'].usd_24h_change);
  };

  useEffect(() => {
     fetchMarketData();
     const interval = setInterval(fetchMarketData, 60000); // Update every minute
     return () => clearInterval(interval);
  }, []);

  useEffect(() => {
     if (priceData) {
         generateTrend(priceData[COINS[selected].id].usd_24h_change);
     }
  }, [selected]);

  const currentCoinId = COINS[selected].id;
  const currentInfo = priceData ? priceData[currentCoinId] : null;
  const price = currentInfo?.usd || 0;
  const change = currentInfo?.usd_24h_change || 0;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950 font-sans">
       {/* Header */}
       <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600 dark:text-emerald-400">
                <Activity size={18} />
             </div>
             <div>
               <h2 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">${s.cryptoTitle}</h2>
               <div className="flex gap-2 mt-1">
                 {Object.keys(COINS).map(c => (
                   <button 
                     key={c} 
                     onClick={() => setSelected(c)}
                     className={\`text-[10px] font-bold px-1.5 py-0.5 rounded transition-colors \${selected === c ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}\`}
                   >
                     {c}
                   </button>
                 ))}
               </div>
             </div>
          </div>
          
          <div className="flex flex-col items-end">
             {loading && !priceData ? (
                 <span className="text-xs text-zinc-400">${s.loading}</span>
             ) : (
                 <>
                    <div className="text-lg font-mono font-bold text-zinc-900 dark:text-zinc-100">
                        \\\${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className={\`text-xs font-medium flex items-center gap-1 \${change >= 0 ? 'text-emerald-500' : 'text-red-500'}\`}>
                        {change >= 0 ? <TrendingUp size={12} /> : <TrendingUp size={12} className="rotate-180" />}
                        {Math.abs(change).toFixed(2)}%
                    </div>
                 </>
             )}
          </div>
       </div>

       {/* Chart Area */}
       <div className="flex-1 p-4 relative">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
             <AreaChart data={history}>
                <defs>
                   <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={change >= 0 ? "#10b981" : "#ef4444"} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={change >= 0 ? "#10b981" : "#ef4444"} stopOpacity={0}/>
                   </linearGradient>
                </defs>
                <Tooltip 
                   contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '8px', fontSize: '12px' }}
                   itemStyle={{ color: '#fff' }}
                   formatter={(val) => val.toFixed(2)}
                   labelStyle={{ display: 'none' }}
                />
                <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke={change >= 0 ? "#10b981" : "#ef4444"} 
                    fillOpacity={1} 
                    fill="url(#colorVal)" 
                    strokeWidth={2} 
                    isAnimationActive={true}
                />
             </AreaChart>
          </ResponsiveContainer>
       </div>

       {/* Footer / Status */}
       <div className="pl-4 pr-8 py-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center text-[10px] text-zinc-400">
          <button 
            onClick={fetchMarketData} 
            className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 transition-colors"
          >
              <RotateCcw size={10} className={loading ? "animate-spin" : ""} />
              <span className="font-medium">${s.updateTx || "Refresh"}</span>
          </button>

          <div className="flex items-center gap-2">
             <div className="flex items-center gap-1.5" title={isLive ? "Fetching from CoinGecko" : "API limit reached, simulating based on recent trends"}>
                {isLive ? <Wifi size={12} className="text-emerald-500" /> : <WifiOff size={12} className="text-amber-500" />}
                <span>{isLive ? "${s.liveData}" : "${s.simData}"}</span>
             </div>
          </div>
       </div>
    </div>
  );
}
  `;
};

const getExpenseTrackerCode = (lang: 'en' | 'es') => {
  const s = getAnalystStrings(lang);
  return `
import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Plus, Trash2, Edit2, X, Check } from 'lucide-react';

export default function ExpenseTracker() {
  const [txs, setTxs] = useState([
    { id: 1, name: 'Rent', value: 1200, color: '#3b82f6' },
    { id: 2, name: 'Food', value: 450, color: '#10b981' },
    { id: 3, name: 'Transport', value: 150, color: '#f59e0b' },
  ]);
  
  const [input, setInput] = useState({ name: '', value: '' });
  const [editId, setEditId] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.name || !input.value) return;
    
    const val = parseFloat(input.value);

    if (editId) {
        // Update existing
        setTxs(txs.map(t => t.id === editId ? { ...t, name: input.name, value: val } : t));
        setEditId(null);
    } else {
        // Add new
        setTxs([...txs, { 
          id: Date.now(),
          name: input.name, 
          value: val, 
          color: '#' + Math.floor(Math.random()*16777215).toString(16) 
        }]);
    }
    setInput({ name: '', value: '' });
  };

  const handleEdit = (tx) => {
      setInput({ name: tx.name, value: tx.value });
      setEditId(tx.id);
  };

  const handleDelete = (id) => {
      setTxs(txs.filter(t => t.id !== id));
      if (editId === id) {
          setEditId(null);
          setInput({ name: '', value: '' });
      }
  };

  const handleCancel = () => {
      setEditId(null);
      setInput({ name: '', value: '' });
  };

  const total = txs.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950 font-sans">
       <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
             <DollarSign size={18} />
          </div>
          <div>
             <h2 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">${s.financeTitle}</h2>
             <p className="text-[10px] text-zinc-500">${s.profit} / ${s.expenses}</p>
          </div>
       </div>

       <div className="flex-1 flex flex-col md:flex-row p-4 gap-4 overflow-hidden">
          {/* Chart Section */}
          <div className="flex-1 min-h-[200px] relative">
             <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <PieChart>
                   <Pie 
                     data={txs} 
                     innerRadius={60} 
                     outerRadius={80} 
                     paddingAngle={5} 
                     dataKey="value"
                     stroke="none"
                   >
                     {txs.map((entry, index) => (
                       <Cell key={index} fill={entry.color} />
                     ))}
                   </Pie>
                   <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '8px', fontSize: '12px' }}
                      itemStyle={{ color: '#fff' }}
                      formatter={(val) => '${s.itemValue}' + val}
                   />
                </PieChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                   <div className="text-xs text-zinc-400">${s.total}</div>
                   <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">\\\${total}</div>
                </div>
             </div>
          </div>
          
          {/* List Section */}
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
             {txs.length === 0 && <div className="text-center text-xs text-zinc-400 mt-10">${s.noTx}</div>}
             {txs.map((t) => (
               <div key={t.id} className={\`group flex justify-between items-center text-sm p-2 rounded-lg border transition-all \${editId === t.id ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'bg-zinc-50 dark:bg-zinc-900 border-transparent hover:border-zinc-200 dark:hover:border-zinc-800'}\`}>
                  <div className="flex items-center gap-2 overflow-hidden">
                     <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                     <span className="text-zinc-700 dark:text-zinc-300 truncate font-medium">{t.name}</span>
                  </div>
                  <div className="flex items-center gap-3 pl-2">
                      <span className="font-mono text-zinc-900 dark:text-zinc-100">\\\${t.value}</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEdit(t)} className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded text-zinc-500 hover:text-blue-500">
                             <Edit2 size={12} />
                          </button>
                          <button onClick={() => handleDelete(t.id)} className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded text-zinc-500 hover:text-red-500">
                             <Trash2 size={12} />
                          </button>
                      </div>
                  </div>
               </div>
             ))}
          </div>
       </div>

       {/* Input Form */}
       <form onSubmit={handleSubmit} className="pl-4 pr-8 py-4 border-t border-zinc-100 dark:border-zinc-800 flex gap-2 items-center">
          <input 
            value={input.name} 
            onChange={e => setInput({...input, name: e.target.value})} 
            placeholder="${s.itemName}"
            className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-500"
          />
          <input 
            value={input.value}
            type="number" 
            onChange={e => setInput({...input, value: e.target.value})} 
            placeholder="${s.itemValue}"
            className="w-20 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-500"
          />
          
          {editId ? (
              <div className="flex gap-1">
                  <button type="submit" className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors" title="${s.updateTx}">
                     <Check size={14} />
                  </button>
                  <button type="button" onClick={handleCancel} className="p-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 rounded-lg transition-colors" title="${s.cancel}">
                     <X size={14} />
                  </button>
              </div>
          ) : (
              <button type="submit" className="p-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:opacity-90 transition-opacity" title="${s.addTx}">
                 <Plus size={14} />
              </button>
          )}
       </form>
    </div>
  );
}
  `;
};

const getKanbanBoardCode = (lang: 'en' | 'es') => {
  const s = getProductivityStrings(lang);
  return `
import React, { useState } from 'react';
import { Layout, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Kanban() {
  const [cards, setCards] = useState([
    { id: 1, text: 'Research AI', status: 'todo' },
    { id: 2, text: 'Design UI', status: 'doing' },
    { id: 3, text: 'Deploy', status: 'done' },
  ]);

  const cols = [
    { id: 'todo', title: '${s.todo}', color: 'bg-zinc-100 dark:bg-zinc-800' },
    { id: 'doing', title: '${s.doing}', color: 'bg-blue-50 dark:bg-blue-900/20' },
    { id: 'done', title: '${s.done}', color: 'bg-emerald-50 dark:bg-emerald-900/20' },
  ];

  const move = (id, dir) => {
    setCards(cards.map(c => {
      if (c.id !== id) return c;
      const statuses = ['todo', 'doing', 'done'];
      const idx = statuses.indexOf(c.status);
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= statuses.length) return c;
      return { ...c, status: statuses[newIdx] };
    }));
  };

  const add = (status) => {
    const text = prompt('${s.addCard}:');
    if (text) setCards([...cards, { id: Date.now(), text, status }]);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950 font-sans">
       <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
          <Layout size={18} className="text-zinc-500" />
          <h2 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">${s.kanbanTitle}</h2>
       </div>
       <div className="flex-1 p-4 grid grid-cols-3 gap-4 overflow-x-auto min-w-0">
          {cols.map(col => (
             <div key={col.id} className={\`flex flex-col rounded-xl p-3 \${col.color} min-w-[120px]\`}>
                <div className="flex justify-between items-center mb-3">
                   <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">{col.title}</h3>
                   <button onClick={() => add(col.id)} className="hover:bg-black/10 rounded p-1"><Plus size={12} /></button>
                </div>
                <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar">
                   {cards.filter(c => c.status === col.id).map(card => (
                      <div key={card.id} className="bg-white dark:bg-zinc-900 p-3 rounded-lg shadow-sm border border-black/5 flex flex-col gap-2 group">
                         <span className="text-xs text-zinc-800 dark:text-zinc-200">{card.text}</span>
                         <div className="flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => move(card.id, -1)} disabled={col.id === 'todo'} className="text-zinc-400 hover:text-zinc-900"><ChevronLeft size={12} /></button>
                            <button onClick={() => move(card.id, 1)} disabled={col.id === 'done'} className="text-zinc-400 hover:text-zinc-900"><ChevronRight size={12} /></button>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          ))}
       </div>
    </div>
  );
}
  `;
};

const getCalendarCode = (lang: 'en' | 'es') => {
  const s = getProductivityStrings(lang);
  // Need to pass array as string to embedded code
  const monthsStr = JSON.stringify(s.months);
  const daysStr = JSON.stringify(s.daysShort);
  
  return `
import React, { useState } from 'react';
import { Calendar as CalIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export default function CalendarWidget() {
  const [date, setDate] = useState(new Date());
  
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  
  const monthNames = ${monthsStr};
  const weekDays = ${daysStr};
  
  const changeMonth = (d) => setDate(new Date(date.getFullYear(), date.getMonth() + d, 1));

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950 font-sans">
       <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <CalIcon size={18} className="text-red-500" />
             <h2 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{monthNames[date.getMonth()]} {date.getFullYear()}</h2>
          </div>
          <div className="flex gap-1">
             <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded"><ChevronLeft size={16} /></button>
             <button onClick={() => changeMonth(1)} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded"><ChevronRight size={16} /></button>
          </div>
       </div>
       <div className="p-4 flex-1">
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
             {weekDays.map((d,i) => <div key={i} className="text-[10px] font-bold text-zinc-400">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1 h-full auto-rows-fr">
             {Array.from({ length: firstDay }).map((_, i) => <div key={'empty-'+i} />)}
             {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isToday = new Date().toDateString() === new Date(date.getFullYear(), date.getMonth(), day).toDateString();
                return (
                   <button key={day} className={\`rounded-lg text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center \${isToday ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-md' : 'text-zinc-700 dark:text-zinc-300'}\`}>
                      {day}
                   </button>
                )
             })}
          </div>
       </div>
    </div>
  );
}
  `;
};

const getSnakeCode = (lang: 'en' | 'es') => {
  const s = getArcadeStrings(lang);
  return `
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Gamepad2, Play, RotateCcw, Pause } from 'lucide-react';

export default function Snake() {
  // Game State
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(true);
  
  // Refs for mutable state in loop
  const snakeRef = useRef([{x: 10, y: 10}]);
  const foodRef = useRef({x: 15, y: 15});
  const dirRef = useRef({x: 1, y: 0});
  const nextDirRef = useRef({x: 1, y: 0}); // Buffer for next move
  const containerRef = useRef(null);
  
  // Render trigger
  const [, setTick] = useState(0);
  
  const size = 20; // Grid size

  const spawnFood = () => {
    let newFood;
    while(true) {
        newFood = { x: Math.floor(Math.random() * size), y: Math.floor(Math.random() * size) };
        // Don't spawn on snake
        const onSnake = snakeRef.current.some(s => s.x === newFood.x && s.y === newFood.y);
        if (!onSnake) break;
    }
    foodRef.current = newFood;
  };

  const resetGame = () => {
    snakeRef.current = [{x: 10, y: 10}];
    dirRef.current = {x: 1, y: 0};
    nextDirRef.current = {x: 1, y: 0};
    spawnFood();
    setScore(0);
    setGameOver(false);
    setPaused(false);
    containerRef.current?.focus();
  };

  // Game Loop
  useEffect(() => {
    if (paused || gameOver) return;

    const moveSnake = () => {
       const head = snakeRef.current[0];
       const dir = nextDirRef.current;
       dirRef.current = dir; // Commit direction

       const newHead = { 
           x: (head.x + dir.x + size) % size, 
           y: (head.y + dir.y + size) % size 
       };

       // Collision Self
       if (snakeRef.current.some(s => s.x === newHead.x && s.y === newHead.y)) {
           setGameOver(true);
           if (score > highScore) setHighScore(score);
           return;
       }

       const newSnake = [newHead, ...snakeRef.current];
       
       // Eat Food
       if (newHead.x === foodRef.current.x && newHead.y === foodRef.current.y) {
           setScore(s => s + 1);
           spawnFood();
       } else {
           newSnake.pop();
       }
       
       snakeRef.current = newSnake;
       setTick(t => t + 1); // Trigger re-render
    };

    const interval = setInterval(moveSnake, 150);
    return () => clearInterval(interval);
  }, [paused, gameOver, score]); // score dep ensures speed up if we wanted it

  // Controls
  const handleKey = useCallback((e) => {
    // Prevent default to stop scrolling AND stop workspace nudging
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    if (e.key === ' ' && !gameOver) {
        setPaused(p => !p);
        return;
    }

    const currentDir = dirRef.current;
    
    if (e.key === 'ArrowUp' && currentDir.y === 0) nextDirRef.current = {x: 0, y: -1};
    if (e.key === 'ArrowDown' && currentDir.y === 0) nextDirRef.current = {x: 0, y: 1};
    if (e.key === 'ArrowLeft' && currentDir.x === 0) nextDirRef.current = {x: -1, y: 0};
    if (e.key === 'ArrowRight' && currentDir.x === 0) nextDirRef.current = {x: 1, y: 0};
  }, [gameOver]);

  // Render Helpers
  const snake = snakeRef.current;
  const food = foodRef.current;

  return (
    <div 
        ref={containerRef}
        className="flex flex-col h-full bg-zinc-950 text-zinc-100 font-mono outline-none focus:ring-2 focus:ring-emerald-500/50" 
        tabIndex={0} 
        onKeyDown={handleKey}
        onClick={() => containerRef.current?.focus()}
    >
       {/* Header */}
       <div className="flex justify-between items-center px-4 py-3 border-b border-zinc-800 shrink-0 select-none">
          <div className="flex items-center gap-2">
             <div className="p-1 bg-emerald-500/20 rounded">
                 <Gamepad2 size={16} className="text-emerald-500" />
             </div>
             <span className="font-bold text-sm tracking-wide">${s.snakeTitle}</span>
          </div>
          <div className="flex gap-3 text-xs">
             <span className="text-zinc-500">${s.highScore}: {highScore}</span>
             <span className="text-emerald-400 font-bold">${s.score}: {score}</span>
          </div>
       </div>

       {/* Game Board */}
       <div className="flex-1 relative bg-[#111] overflow-hidden cursor-crosshair">
          {/* Grid Overlay */}
          <div className="absolute inset-0 opacity-[0.1]" 
               style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: \`\\\${100/size}%\` }} 
          />
          
          {/* Game Over Screen */}
          {gameOver && (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 backdrop-blur-sm animate-in fade-in">
                <h3 className="text-3xl font-black text-red-500 mb-2 tracking-tighter">${s.gameOver}</h3>
                <p className="text-zinc-400 mb-6 text-xs">${s.finalScore}: {score}</p>
                <button 
                    onClick={resetGame} 
                    className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-full text-xs font-bold uppercase tracking-widest shadow-lg hover:scale-105 transition-all"
                >
                   ${s.restart}
                </button>
             </div>
          )}

          {/* Pause Screen */}
          {paused && !gameOver && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10 pointer-events-none">
                  <div className="bg-black/80 px-4 py-2 rounded text-xs font-bold tracking-widest text-zinc-500 backdrop-blur-md">
                      ${s.paused}
                  </div>
              </div>
          )}

          {/* Rendering */}
          <div className="absolute inset-0 grid" style={{ gridTemplateColumns: \`repeat(\\\${size}, 1fr)\`, gridTemplateRows: \`repeat(\\\${size}, 1fr)\`, padding: '2px' }}>
             {Array.from({ length: size * size }).map((_, i) => {
                const x = i % size;
                const y = Math.floor(i / size);
                
                const isHead = snake[0].x === x && snake[0].y === y;
                const isBody = snake.some((s, idx) => idx > 0 && s.x === x && s.y === y);
                const isFood = food.x === x && food.y === y;
                
                let cellClass = 'rounded-sm transition-all duration-150 ';
                if (isHead) cellClass += 'bg-emerald-400 scale-100 shadow-[0_0_10px_rgba(52,211,153,0.8)] z-10';
                else if (isBody) cellClass += 'bg-emerald-600 scale-90 opacity-80';
                else if (isFood) cellClass += 'bg-rose-500 rounded-full scale-75 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.6)]';
                else cellClass += 'bg-transparent';

                return <div key={i} className={cellClass} />;
             })}
          </div>
       </div>

       {/* Footer Controls */}
       <div className="p-3 border-t border-zinc-800 flex justify-center bg-zinc-900/50">
          <button 
             onClick={() => {
                if (gameOver) resetGame();
                else {
                    setPaused(!paused);
                    containerRef.current?.focus();
                }
             }} 
             className="flex items-center gap-2 text-xs bg-zinc-800 text-zinc-300 px-6 py-2 rounded-full hover:bg-zinc-700 hover:text-white transition-all active:scale-95 font-bold"
          >
             {paused || gameOver ? <Play size={14} fill="currentColor" /> : <Pause size={14} fill="currentColor" />}
             {gameOver ? '${s.restart}' : paused ? '${s.play}' : '${s.stop}'}
          </button>
       </div>
    </div>
  );
}
  `;
};

const getSequencerCode = (lang: 'en' | 'es') => {
  const s = getArcadeStrings(lang);
  return `
import React, { useState, useEffect, useRef } from 'react';
import { Music, Play, Square, Trash } from 'lucide-react';

export default function Sequencer() {
  const [grid, setGrid] = useState(Array(4).fill(null).map(() => Array(8).fill(false)));
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(0);
  const audioCtx = useRef(null);

  useEffect(() => {
    if (playing) {
      const interval = setInterval(() => {
        setStep(s => (s + 1) % 8);
      }, 200);
      return () => clearInterval(interval);
    } else {
        setStep(0);
    }
  }, [playing]);

  useEffect(() => {
    if (playing && grid.some(row => row[step])) {
       playNote(step);
    }
  }, [step, playing]);

  const playNote = (currentStep) => {
    if (!audioCtx.current) audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
    const ctx = audioCtx.current;
    
    const freqs = [880, 659, 587, 440]; // A5, E5, D5, A4
    
    grid.forEach((row, rowIndex) => {
       if (row[currentStep]) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.frequency.value = freqs[rowIndex];
          osc.type = 'sine';
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
          osc.stop(ctx.currentTime + 0.2);
       }
    });
  };

  const toggleCell = (r, c) => {
     const newGrid = [...grid];
     newGrid[r][c] = !newGrid[r][c];
     setGrid(newGrid);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900 text-zinc-100 font-sans">
       <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
             <Music size={18} className="text-fuchsia-500" />
             <span className="font-bold text-sm">${s.sequencerTitle}</span>
          </div>
          <button onClick={() => setGrid(Array(4).fill(null).map(() => Array(8).fill(false)))} className="text-zinc-500 hover:text-white"><Trash size={14} /></button>
       </div>
       <div className="flex-1 p-6 flex flex-col justify-center gap-2">
          {grid.map((row, r) => (
             <div key={r} className="flex gap-2 justify-center h-12">
                {row.map((active, c) => (
                   <button 
                     key={c}
                     onClick={() => toggleCell(r, c)}
                     className={\`flex-1 rounded-lg transition-all border-2 \${active ? 'bg-fuchsia-500 border-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.5)]' : 'bg-zinc-800 border-zinc-800'} \${c === step ? '!border-white/50 brightness-110' : ''}\`}
                   />
                ))}
             </div>
          ))}
       </div>
       <div className="p-4 border-t border-zinc-800 flex justify-center">
          <button 
             onClick={() => setPlaying(!playing)}
             className={\`px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-all \${playing ? 'bg-red-500 text-white' : 'bg-emerald-500 text-black'}\`}
          >
             {playing ? <Square size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
             {playing ? '${s.stop}' : '${s.play}'}
          </button>
       </div>
    </div>
  );
}
  `;
};


export const getResearcherPreset = (lang: 'en' | 'es'): Widget[] => {
    return [
        {
            id: 'preset-research-1',
            prompt: getStrings(lang).webSearch,
            code: getSearchToolCode(lang),
            x: 50,
            y: 100,
            zIndex: 10,
            expanded: false
        },
        {
            id: 'preset-research-2',
            prompt: getStrings(lang).tasks,
            code: getTaskListCode(lang),
            x: 520,
            y: 100,
            zIndex: 10,
            expanded: false
        },
        {
            id: 'preset-research-3',
            prompt: getStrings(lang).timer,
            code: getTimerCode(lang),
            x: 990,
            y: 100,
            zIndex: 10,
            expanded: false
        },
        {
            id: 'preset-research-4',
            prompt: getStrings(lang).scratchpad,
            code: getScratchpadCode(lang),
            x: 990,
            y: 620, // Below timer
            zIndex: 10,
            expanded: false
        }
    ];
};

export const getDesignerPreset = (lang: 'en' | 'es'): Widget[] => {
    const s = getDesignerStrings(lang);
    return [
        {
            id: 'preset-design-img',
            prompt: s.imgTitle,
            code: getImageStudioCode(lang),
            x: 50,
            y: 100,
            zIndex: 10,
            expanded: false,
            width: 500,
            height: 600
        },
        {
            id: 'preset-design-tts',
            prompt: s.voiceTitle,
            code: getTTSStudioCode(lang),
            x: 580,
            y: 100,
            zIndex: 10,
            expanded: false,
            width: 400,
            height: 400
        }
    ];
};

export const getAnalystPreset = (lang: 'en' | 'es'): Widget[] => {
  const s = getAnalystStrings(lang);
  return [
    {
      id: 'preset-analyst-crypto',
      prompt: s.cryptoTitle,
      code: getCryptoTickerCode(lang),
      x: 50,
      y: 100,
      width: 600,
      height: 400,
      zIndex: 10,
      expanded: false
    },
    {
      id: 'preset-analyst-finance',
      prompt: s.financeTitle,
      code: getExpenseTrackerCode(lang),
      x: 680,
      y: 100,
      width: 500,
      height: 400,
      zIndex: 10,
      expanded: false
    }
  ];
};

export const getProductivityPreset = (lang: 'en' | 'es'): Widget[] => {
  const s = getProductivityStrings(lang);
  return [
    {
      id: 'preset-prod-kanban',
      prompt: s.kanbanTitle,
      code: getKanbanBoardCode(lang),
      x: 50,
      y: 100,
      width: 700,
      height: 500,
      zIndex: 10,
      expanded: false
    },
    {
      id: 'preset-prod-calendar',
      prompt: s.calendarTitle,
      code: getCalendarCode(lang),
      x: 780,
      y: 100,
      width: 400,
      height: 500,
      zIndex: 10,
      expanded: false
    }
  ];
};

export const getArcadePreset = (lang: 'en' | 'es'): Widget[] => {
  const s = getArcadeStrings(lang);
  return [
    {
      id: 'preset-arcade-snake',
      prompt: s.snakeTitle,
      code: getSnakeCode(lang),
      x: 50,
      y: 100,
      width: 400,
      height: 500,
      zIndex: 10,
      expanded: false
    },
    {
      id: 'preset-arcade-seq',
      prompt: s.sequencerTitle,
      code: getSequencerCode(lang),
      x: 480,
      y: 100,
      width: 600,
      height: 400,
      zIndex: 10,
      expanded: false
    }
  ];
};

export type TemplateId = import('./templates').TemplateId;