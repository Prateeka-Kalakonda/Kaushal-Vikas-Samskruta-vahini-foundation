import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Box, Search, MonitorPlay, AlertCircle } from 'lucide-react';
import api from '../api/axios';

const Simulations = () => {
  const navigate = useNavigate();
  const [simulations, setSimulations] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAllSimulations = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/simulations');
        if (res.data.success) {
          const simData = res.data.data?.simulations || [];
          setSimulations(Array.isArray(simData) ? simData : []);
          setTotalCount(res.data.data?.total_count || 0);
        }
      } catch (err) {
        setError("Simulator engine is offline (500 Error). Please check backend logs.");
        setSimulations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAllSimulations();
  }, []);

  const filtered = Array.isArray(simulations) ? simulations.filter(s => 
    s.title?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  if (loading) return <div className="p-20 text-center text-primary font-black animate-pulse italic">Connecting to Lab Database...</div>;

  return (
    <div className="space-y-10 animate-in fade-in">
      {error ? (
        <div className="p-10 bg-red-500/10 border border-red-500/20 rounded-[2rem] text-center flex flex-col items-center gap-4">
          <AlertCircle className="text-red-500" size={48} />
          <h2 className="text-xl font-bold text-red-500 uppercase tracking-widest">Library Offline</h2>
          <p className="text-slate-400 text-sm max-w-md">{error}</p>
        </div>
      ) : (
        <>
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-glow border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-4">
                <MonitorPlay size={12}/> {totalCount} {totalCount === 1 ? 'Simulation' : 'Simulations'} Synchronized
              </div>
              <h1 className="text-4xl font-black dark:text-white tracking-tighter uppercase">Library</h1>
            </div>
            <input type="text" placeholder="Filter index..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-6 pr-6 py-3 w-full md:w-80 bg-card border border-app rounded-2xl outline-none focus:ring-1 focus:ring-primary text-xs font-bold uppercase tracking-widest dark:text-white"
            />
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map(sim => (
              <div key={sim.id} className="bg-card p-8 rounded-[3rem] border border-app shadow-xl group hover:border-primary transition-all relative overflow-hidden">
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-accent-soft rounded-2xl flex items-center justify-center text-primary mb-6"><Box size={28} /></div>
                  <h3 className="text-xl font-bold dark:text-white mb-2">{sim.title}</h3>
                  <button onClick={() => navigate(`/simulation/${sim.id}`)} className="flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg">
                    Launch <Play size={14} fill="currentColor" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Simulations;