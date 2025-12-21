

import React, { useState, useEffect, useRef } from 'react';
import { X, Volume2, VolumeX, EyeOff, Activity, Shield } from 'lucide-react';
import { translations } from '../utils/i18n';
import { useSettings } from '../hooks/useSettings';

interface EmergencyModeProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyMode: React.FC<EmergencyModeProps> = ({ isOpen, onClose }) => {
  const { settings } = useSettings();
  const t = translations[settings.language || 'en'].emergency;
  
  // Initialize with localized string
  const [breathingText, setBreathingText] = useState(t.breatheIn);
  const [stage, setStage] = useState<'breathe' | 'options'>('breathe');
  const [audioEnabled, setAudioEnabled] = useState(true);
  
  // Ensure text updates if language changes while mounted (though unlikely for this modal)
  useEffect(() => {
      setBreathingText(t.breatheIn);
  }, [t.breatheIn]);

  // Audio Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // --- Brown Noise Engine ---
  const startNoise = () => {
    if (!audioEnabled) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      
      const bufferSize = ctx.sampleRate * 2; // 2 seconds buffer
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Generate Brown Noise
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5; // Gain compensation
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      
      // Lowpass filter for warmth
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 400;

      const gain = ctx.createGain();
      gain.gain.value = 0.001; // Start silent
      gainNodeRef.current = gain;

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();

      // Fade In
      gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 3);

    } catch (e) {
      console.error("Audio init failed", e);
    }
  };

  const stopNoise = () => {
    if (audioCtxRef.current && gainNodeRef.current) {
       // Fade Out
       const ctx = audioCtxRef.current;
       const gain = gainNodeRef.current;
       
       try {
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
       } catch (e) {
          console.warn("Audio gain ramp failed", e);
       }

       setTimeout(() => {
          // Check state before closing to prevent "Cannot close a closed AudioContext"
          if (ctx.state !== 'closed') {
              ctx.close().catch(e => console.warn("Context close error", e));
          }
          // Only null refs if they haven't been replaced by a new start call
          if (audioCtxRef.current === ctx) {
             audioCtxRef.current = null;
             gainNodeRef.current = null;
          }
       }, 1000);
    }
  };

  useEffect(() => {
    if (isOpen) {
        startNoise();
        setStage('breathe');
    } else {
        stopNoise();
    }
    return () => stopNoise();
  }, [isOpen]); // eslint-disable-line

  useEffect(() => {
     if (isOpen && !audioEnabled) stopNoise();
     if (isOpen && audioEnabled && !audioCtxRef.current) startNoise();
  }, [audioEnabled, isOpen]);

  // --- Breathing Cycle ---
  useEffect(() => {
    if (!isOpen) return;
    
    // 4-4-4-4 Box Breathing
    let step = 0;
    // Reset to start
    setBreathingText(t.breatheIn);
    
    const interval = setInterval(() => {
        step = (step + 1) % 4;
        if (step === 0) setBreathingText(t.breatheIn);
        if (step === 1) setBreathingText(t.hold);
        if (step === 2) setBreathingText(t.breatheOut);
        if (step === 3) setBreathingText(t.hold);
    }, 4000);

    return () => clearInterval(interval);
  }, [isOpen, t]);


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999999] bg-[#0f172a] text-slate-200 flex flex-col animate-in fade-in duration-1000">
       
       {/* Top Controls */}
       <div className="absolute top-6 right-6 flex gap-4 z-50">
          <button 
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="p-4 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
             {audioEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
          </button>
       </div>

       {/* Main Content */}
       <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
          
          {/* Breathing Visualizer */}
          {stage === 'breathe' && (
              <div className="relative flex flex-col items-center justify-center">
                 <div className="absolute w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
                 
                 <div 
                   className="w-64 h-64 bg-indigo-400/20 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-[4000ms] ease-in-out border border-white/5 shadow-2xl"
                   style={{
                       transform: breathingText === t.breatheIn ? 'scale(1.5)' : 
                                  breathingText === t.breatheOut ? 'scale(0.8)' : 'scale(1.1)'
                   }}
                 >
                     <div className="w-32 h-32 bg-indigo-300/30 rounded-full" />
                 </div>

                 <h1 className="mt-12 text-3xl font-light tracking-[0.2em] uppercase opacity-80 animate-pulse duration-[2000ms]">
                    {breathingText}
                 </h1>

                 <button 
                    onClick={() => setStage('options')}
                    className="mt-16 px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 text-sm font-medium tracking-wide text-slate-400 hover:text-white transition-all"
                 >
                    {t.needElse}
                 </button>
              </div>
          )}

          {/* Options Menu */}
          {stage === 'options' && (
              <div className="w-full max-w-4xl px-6 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in zoom-in-95 duration-500">
                  <button 
                    onClick={() => { setAudioEnabled(false); setStage('breathe'); }}
                    className="aspect-square rounded-3xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 flex flex-col items-center justify-center gap-4 transition-all hover:scale-105"
                  >
                     <VolumeX size={48} className="text-slate-400" />
                     <span className="text-xl font-medium">{t.quiet}</span>
                  </button>

                  <button 
                    onClick={() => { setAudioEnabled(true); setStage('breathe'); }}
                    className="aspect-square rounded-3xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 flex flex-col items-center justify-center gap-4 transition-all hover:scale-105"
                  >
                     <Volume2 size={48} className="text-indigo-400" />
                     <span className="text-xl font-medium">{t.sound}</span>
                  </button>

                  <button 
                    onClick={() => setStage('breathe')} // Placeholder for distraction logic
                    className="aspect-square rounded-3xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 flex flex-col items-center justify-center gap-4 transition-all hover:scale-105"
                  >
                     <EyeOff size={48} className="text-emerald-400" />
                     <span className="text-xl font-medium">{t.focus}</span>
                  </button>
              </div>
          )}

       </div>

       {/* Bottom Exit */}
       <div className="h-32 flex items-center justify-center z-50">
          <button 
            onClick={onClose}
            className="group relative px-10 py-5 bg-slate-100 text-slate-900 rounded-2xl font-bold text-lg tracking-wide shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.3)] hover:scale-105 transition-all duration-300"
          >
             <div className="flex items-center gap-3">
                 <Shield size={20} className="text-indigo-600" />
                 <span>{t.ok}</span>
             </div>
          </button>
       </div>

    </div>
  );
};