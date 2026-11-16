import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, ChevronRight, FlaskConical, Play, 
  Cpu, Settings, Palette, Calculator, RefreshCw, Loader2, X
} from 'lucide-react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const Experiments = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  
  // PERSISTENT STATES
  const [activeCategory, setActiveCategory] = useState(null);    
  const [activeSubCategory, setActiveSubCategory] = useState(null); 
  
  const [topicCounts, setTopicCounts] = useState({}); 
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [simulations, setSimulations] = useState([]);
  const [loading, setLoading] = useState(false);

  const categoryStructure = {
    'Science': ['Astro and Space Physics', 'Physics', 'Chemistry', 'Biology'],
    'Technology': ['Robotics', 'AI', 'Circuits'],
    'Engineering': ['Structural', 'Mechanical Design'],
    'Arts': ['Visual Geometry', 'Color Theory'],
    'Mathematics': ['Algebra', 'Calculus', 'Trigonometry', 'Probability', 'Coordinate Geometry']
  };

  const scienceNested = {
    'Astro and Space Physics': ['Observational Astronomy', 'Celestial Mechanics', 'Solar and Heliospheric Physics', 'Space Weather', 'Cosmic Ray', 'Planetary Science and Astro biology', 'Orbital and Satellite Physics', 'Multi-wavelength Astronomy', 'Computational Space Physics'],
    'Physics': [
      'Electrostatics', 
      'Mechanics', 
      'Fluid Mechanics', 
      'Wave Mechanics', 
      'Gravitation', 
      'Thermal Physics', 
      'Electricity', 
      'Magnetism', 
      'Optics', 
      'Modern Physics', 
      'Electronics'
    ],
    'Chemistry': ['Physical Chemistry', 'Inorganic Chemistry', 'Organic Chemistry', 'Analytical Chemistry', 'Electrochemistry', 'Material and Surface Chemistry', 'Environmental Chemistry', 'Biochemistry', 'Experimental Chemistry', 'Industrial Chemistry'],
    'Biology': ['Cell and Molecular Biology', 'Plant Biology', 'Animal Biology', 'Human Physiology', 'Genetics and Biotechnology', 'Microbiology', 'Reproductive Biology', 'Evolutionary Biology', 'Ecology and Environmental Biology', 'Applied Biology']
  };

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/simulations/categories');
      const data = res.data?.data?.categories || res.data?.data || [];
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) { setCategories([]); }
  };

  const fetchCounts = async (name) => {
    if (topicCounts[name]) return;
    try {
      // API call to get counts for topics under a subject (e.g., physics)
      const res = await api.get(`/simulations/topics/counts?subject=${name.toLowerCase().trim()}`);
      let actualArray = [];
      if (Array.isArray(res.data?.data?.topics)) actualArray = res.data.data.topics;
      else if (Array.isArray(res.data?.data)) actualArray = res.data.data;
      else if (Array.isArray(res.data)) actualArray = res.data;

      setTopicCounts(prev => ({ ...prev, [name]: actualArray }));
    } catch (err) { 
      setTopicCounts(prev => ({ ...prev, [name]: [] })); 
    }
  };

  const handleTopicClick = async (topicName, topicId = null) => {
    setSelectedTopic(topicName);
    setActiveCategory(null);
    setActiveSubCategory(null);
    setLoading(true);
    try {
      // We prioritize the ID if available, otherwise we use the name
      const identifier = topicId || topicName;
      const res = await api.get(`/simulations/topic/${identifier}`);
      
      const data = res.data?.data?.simulations || res.data?.data || res.data || [];
      setSimulations(Array.isArray(data) ? data : []);
    } catch (err) { 
      setSimulations([]); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="relative min-h-[90vh] rounded-[3rem] overflow-hidden bg-app shadow-2xl border border-app transition-colors duration-500">
      
      <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=2070')` }}>
        <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/80 backdrop-blur-[1px]"></div>
      </div>

      <div className="relative z-50 p-6">
        <div className="flex flex-wrap gap-4 bg-white/10 dark:bg-black/30 backdrop-blur-xl p-4 rounded-[2rem] border border-white/20 shadow-2xl justify-center lg:justify-start">
          
          {Object.keys(categoryStructure).map((catName) => (
            <div key={catName} className="relative">
              <button
                onClick={() => {
                  setActiveCategory(activeCategory === catName ? null : catName);
                  setActiveSubCategory(null);
                  if (catName !== 'Science') fetchCounts(catName);
                }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl transition-all font-bold text-sm ${
                  activeCategory === catName ? 'bg-primary text-white shadow-lg' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {catName === 'Science' ? <FlaskConical size={16}/> : catName === 'Technology' ? <Cpu size={16}/> : catName === 'Mathematics' ? <Calculator size={16} /> : <Settings size={16}/>}
                <span>{catName}</span>
                <ChevronDown size={14} className={`transition-transform ${activeCategory === catName ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {activeCategory === catName && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 mt-3 w-64 bg-card border border-app rounded-[2rem] shadow-2xl py-3 z-[60]"
                  >
                    {categoryStructure[catName].map((sub) => {
                      const isScience = catName === 'Science';
                      const catList = topicCounts[catName];
                      const catCount = Array.isArray(catList) ? catList.find(t => (t.title || t.name || '').toLowerCase().trim() === sub.toLowerCase().trim()) : null;

                      return (
                        <div key={sub} className="relative">
                          <button
                            onClick={() => {
                              if (isScience) {
                                setActiveSubCategory(activeSubCategory === sub ? null : sub);
                                fetchCounts(sub);
                              } else {
                                handleTopicClick(sub, catCount?.id);
                              }
                            }}
                            className={`w-full flex items-center justify-between px-6 py-3 text-sm font-bold transition-all ${
                              activeSubCategory === sub ? 'text-primary bg-primary-glow' : 'text-slate-500 dark:text-zinc-400 hover:text-primary hover:bg-primary-glow'
                            }`}
                          >
                            <span>{sub}</span>
                            {isScience ? <ChevronRight size={14} /> : (
                              <span className="bg-primary text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm">
                                {catCount ? (catCount.simulation_count || 0) : 0}
                              </span>
                            )}
                          </button>

                          <AnimatePresence>
                            {isScience && activeSubCategory === sub && (
                              <motion.div 
                                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                                className="absolute left-[98%] top-[-10px] w-72 bg-card border border-app rounded-[2rem] shadow-2xl py-4 z-[70] max-h-[450px] overflow-y-auto custom-scrollbar"
                              >
                                <div className="px-6 pb-2 mb-2 border-b border-app">
                                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{sub}</p>
                                </div>
                                {scienceNested[sub].map(topic => {
                                  const list = topicCounts[sub];
                                  const countData = Array.isArray(list) ? list.find(t => (t.title || t.name || '').toLowerCase().trim() === topic.toLowerCase().trim()) : null;
                                  
                                  return (
                                    <button 
                                      key={topic} 
                                      onClick={() => handleTopicClick(topic, countData?.id)}
                                      className="w-full flex items-center justify-between px-6 py-2.5 text-xs font-bold text-slate-500 dark:text-zinc-400 hover:text-primary hover:bg-primary-glow transition-all"
                                    >
                                      <span>{topic}</span>
                                      <span className="bg-primary text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm">
                                        {countData ? (countData.simulation_count || 0) : 0}
                                      </span>
                                    </button>
                                  );
                                })}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 p-10 mt-10 text-center" onClick={() => { setActiveCategory(null); setActiveSubCategory(null); }}>
        {!selectedTopic ? (
          <div className="py-20 animate-in fade-in zoom-in duration-1000">
            <h1 className="text-7xl md:text-9xl font-black text-white italic tracking-tighter uppercase drop-shadow-2xl">Laboratory</h1>
            <p className="text-white/60 text-lg mt-4 font-bold uppercase tracking-[0.4em]">Select a module to begin</p>
          </div>
        ) : (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary bg-primary-glow px-4 py-1.5 rounded-full border border-primary/20 mb-4 inline-block text-white">Active Topic</span>
              <h2 className="text-5xl font-black text-white tracking-tighter uppercase">{selectedTopic}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto text-left">
              {simulations.map(sim => (
                <div 
                  key={sim.id} 
                  className="bg-card/90 backdrop-blur-xl p-6 rounded-[2.5rem] border border-app shadow-2xl group hover:border-primary transition-all cursor-pointer"
                  onClick={() => navigate(`/simulation/${sim.id}`)}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-primary-glow rounded-2xl text-primary"><FlaskConical size={24}/></div>
                    <button className="p-3 rounded-full bg-primary text-white shadow-lg scale-0 group-hover:scale-100 transition-transform"><Play size={18} fill="currentColor"/></button>
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">{sim.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{sim.description}</p>
                </div>
              ))}
              {simulations.length === 0 && !loading && (
                 <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-[3rem] text-white/20 font-bold uppercase tracking-widest text-xs">No simulation binaries found</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Experiments;