import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, BookOpen, Trash2, ChevronRight } from 'lucide-react';
import api from '../api/axios';

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]); // Initialized as array
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const res = await api.get('/bookmarks');
        if (res.data.success) {
          // Safety Check: Force into array format
          const data = res.data.data;
          setBookmarks(Array.isArray(data) ? data : []);
        }
      } catch (err) { console.error(err); setBookmarks([]); }
    };
    fetchBookmarks();
  }, []);

  const removeBookmark = async (id) => {
    try {
      await api.delete(`/bookmarks/${id}`);
      setBookmarks(bookmarks.filter(b => b.id !== id));
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <h1 className="text-3xl font-bold dark:text-white text-slate-800 flex items-center gap-3">
        <Bookmark className="text-primary" fill={bookmarks.length > 0 ? "currentColor" : "none"} /> 
        Saved Content
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bookmarks.length > 0 ? bookmarks.map((b) => (
          <div key={b.id} className="bg-card p-6 rounded-[2rem] border border-app flex items-center justify-between group hover:border-primary transition-all shadow-sm">
            <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate(`/chapter/${b.chapter_id}`)}>
              <div className="w-12 h-12 bg-accent-soft rounded-2xl flex items-center justify-center text-primary">
                <BookOpen size={20} />
              </div>
              <div>
                <h3 className="font-bold dark:text-white text-slate-800">{b.chapter_title}</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{b.subject_name}</p>
              </div>
            </div>
            <button onClick={() => removeBookmark(b.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
              <Trash2 size={18} />
            </button>
          </div>
        )) : (
          <div className="col-span-2 py-20 text-center border-2 border-dashed border-app rounded-[2.5rem] text-slate-400 font-bold uppercase tracking-widest">
            No bookmarks saved yet
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookmarks;