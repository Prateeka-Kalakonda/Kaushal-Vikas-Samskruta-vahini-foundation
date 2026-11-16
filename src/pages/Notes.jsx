import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { FileText, Trash2, Search, BookOpen } from 'lucide-react';

const Notes = () => {
  const [notes, setNotes] = useState([]); // Initialized as array
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await api.get('/notes');
        if (res.data.success) {
          const data = res.data.data;
          setNotes(Array.isArray(data) ? data : []);
        }
      } catch (err) { console.error(err); setNotes([]); }
      finally { setLoading(false); }
    };
    fetchNotes();
  }, []);

  const deleteNote = async (id) => {
    if (!window.confirm("Delete this note?")) return;
    await api.delete(`/notes/${id}`);
    setNotes(notes.filter(n => n.id !== id));
  };

  // Safe Filter
  const filteredNotes = Array.isArray(notes) ? notes.filter(n => 
    n.content.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  if (loading) return <div className="p-20 text-center text-primary font-bold">Opening Vault...</div>;

  return (
    <div className="space-y-10 animate-in fade-in">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <h1 className="text-3xl font-bold dark:text-white text-slate-800">Study Vault</h1>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" placeholder="Search notes..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 pr-6 py-3 w-full md:w-80 bg-card border border-app rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all dark:text-white"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.length > 0 ? filteredNotes.map((note) => (
          <div key={note.id} className="bg-card p-6 rounded-[2rem] border border-app shadow-sm group relative">
            <FileText className="text-primary mb-4" size={20} />
            <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-6 italic">"{note.content}"</p>
            <div className="flex justify-between items-center pt-4 border-t border-app">
              <span className="text-[10px] font-bold text-slate-400 uppercase">{note.chapter_name || 'General'}</span>
              <button onClick={() => deleteNote(note.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-app rounded-[3rem] text-slate-400">
             <BookOpen className="mx-auto mb-4 opacity-20" size={48} />
             <p className="font-bold uppercase tracking-widest text-xs">No notes found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;