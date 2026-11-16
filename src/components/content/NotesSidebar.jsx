import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Edit3 } from 'lucide-react';
import api from '../../api/axios';

const NotesSidebar = ({ chapterId, onClose }) => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    fetchNotes();
  }, [chapterId]);

  const fetchNotes = async () => {
    try {
      const res = await api.get(`/notes?chapterId=${chapterId}`);
      if (res.data.success) setNotes(res.data.data);
    } catch (err) { console.error(err); }
  };

  const handleSave = async () => {
    if (!newNote.trim()) return;
    try {
      const res = await api.post('/notes', { chapterId, content: newNote });
      if (res.data.success) {
        setNewNote('');
        fetchNotes();
      }
    } catch (err) { console.error(err); }
  };

  const deleteNote = async (id) => {
    try {
      await api.delete(`/notes/${id}`);
      fetchNotes();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="fixed right-0 top-0 h-screen w-80 bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200">
      <div className="p-4 border-b flex justify-between items-center bg-slate-50">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <Edit3 size={18} className="text-blue-600" /> Study Notes
        </h3>
        <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full"><X size={20}/></button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {notes.map((note) => (
          <div key={note.id} className="p-3 bg-amber-50 border border-amber-100 rounded-lg group relative">
            <p className="text-sm text-slate-700">{note.content}</p>
            <button 
              onClick={() => deleteNote(note.id)}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded transition-all"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="p-4 border-t bg-slate-50">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Write a note..."
          className="w-full p-3 text-sm border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none h-24"
        />
        <button 
          onClick={handleSave}
          className="w-full mt-2 py-2 bg-blue-600 text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-700"
        >
          <Save size={16} /> Save Note
        </button>
      </div>
    </div>
  );
};

export default NotesSidebar;