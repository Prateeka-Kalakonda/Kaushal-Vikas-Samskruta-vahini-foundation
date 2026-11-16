import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Info, Settings2, Zap, RotateCcw } from 'lucide-react';
import ElectricFieldSim from '../components/simulations/ElectricFieldSim';

const SimulationViewer = () => {
  const navigate = useNavigate();
  const defaultParams = { distance: 4, strength: 1 };
  const [params, setParams] = useState(defaultParams);

  const handleReset = () => {
    setParams(defaultParams);
  };

  const handleParamChange = (name, value) => {
    setParams(prev => ({ ...prev, [name]: parseFloat(value) }));
  };

  return (
    <div className="flex flex-col h-[88vh] bg-sidebar rounded-[2.5rem] overflow-hidden shadow-2xl border border-app">
      {/* Header */}
      <div className="p-6 flex items-center justify-between border-b border-app bg-card">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 bg-slate-100 dark:bg-zinc-800 rounded-2xl hover:bg-primary hover:text-white transition-all">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="font-black dark:text-white text-xl uppercase tracking-tighter">3D Electric Field Lab</h1>
            <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Interactive NCERT Physics</p>
          </div>
        </div>
        <button 
          onClick={handleReset}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl text-xs font-black shadow-lg shadow-primary/20 hover:brightness-110 transition-all uppercase tracking-widest"
        >
          <RotateCcw size={16} /> Reset Scene
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Viewport */}
        <div className="flex-1 relative bg-app">
          <ElectricFieldSim params={params} />
          
          <div className="absolute bottom-6 left-6 max-w-sm bg-card/80 backdrop-blur-xl p-6 rounded-[2rem] border border-app shadow-2xl">
            <div className="flex items-center gap-2 mb-2 text-primary font-black text-[10px] uppercase">
              <Info size={14} /> Learning Objective
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed font-medium italic">
              Adjust sliders to observe how distance and charge affect the vector field orientation in real-time.
            </p>
          </div>
        </div>

        {/* Controls Sidebar */}
        <div className="w-80 border-l border-app p-8 overflow-y-auto bg-card">
          <div className="flex items-center gap-2 mb-10 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">
            <Settings2 size={16} className="text-primary" /> Configuration
          </div>
          
          <div className="space-y-12">
            <div>
              <div className="flex justify-between mb-4">
                <label className="text-[10px] font-black text-slate-500 dark:text-zinc-500 uppercase tracking-widest">Separation</label>
                <span className="text-xs font-mono text-primary font-bold">{params.distance}m</span>
              </div>
              <input type="range" min="2" max="10" step="0.1" value={params.distance} onChange={(e) => handleParamChange('distance', e.target.value)} 
                className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-primary" />
            </div>

            <div>
              <div className="flex justify-between mb-4">
                <label className="text-[10px] font-black text-slate-500 dark:text-zinc-500 uppercase tracking-widest">Intensity</label>
                <span className="text-xs font-mono text-primary font-bold">{params.strength}C</span>
              </div>
              <input type="range" min="0.5" max="3" step="0.1" value={params.strength} onChange={(e) => handleParamChange('strength', e.target.value)} 
                className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-primary" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationViewer;