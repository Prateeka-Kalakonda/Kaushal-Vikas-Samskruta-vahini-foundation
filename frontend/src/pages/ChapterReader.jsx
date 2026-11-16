import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Languages, 
  Bookmark, 
  Edit3, 
  CheckCircle, 
  BookOpen,
  Share2
} from 'lucide-react';
import api from '../api/axios';
import ContentBlock from '../components/content/ContentBlock';
import NotesSidebar from '../components/content/NotesSidebar';

/**
 * ChapterReader Component
 * The primary reading interface for NCERT chapters.
 * Supports: Multilingual switching, Bookmarking, and Inline Note-taking.
 */
const ChapterReader = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State Management
  const [chapter, setChapter] = useState(null);
  const [language, setLanguage] = useState('en');
  const [showNotes, setShowNotes] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);

  // 1. Fetch Chapter Content
  useEffect(() => {
    const fetchChapter = async () => {
      try {
        // If language is not English, hit the translation endpoint
        const url = language === 'en' 
          ? `/chapters/${id}` 
          : `/translations/chapter/${id}/${language}`;
        
        const res = await api.get(url);
        if (res.data.success) {
          setChapter(res.data.data);
          // Check if this chapter is already bookmarked
          checkBookmarkStatus();
        }
      } catch (err) {
        console.error("Error loading chapter content", err);
      }
    };
    fetchChapter();
  }, [id, language]);

  // 2. Check if already bookmarked
  const checkBookmarkStatus = async () => {
    try {
      const res = await api.get('/bookmarks');
      if (res.data.success) {
        const found = res.data.data.find(b => b.chapter_id === id);
        setIsBookmarked(!!found);
      }
    } catch (err) {
      console.error("Error checking bookmark status", err);
    }
  };

  // 3. Handle Bookmarking
  const toggleBookmark = async () => {
    try {
      if (isBookmarked) {
        await api.delete(`/bookmarks/${id}`);
        setIsBookmarked(false);
      } else {
        await api.post('/bookmarks', { chapterId: id });
        setIsBookmarked(true);
      }
    } catch (err) {
      alert("Could not update bookmark. Make sure the API is running.");
    }
  };

  // 4. Handle Chapter Completion
  const handleComplete = async () => {
    setIsMarkingComplete(true);
    try {
      await api.post('/progress', { chapterId: id, status: 'completed' });
      alert("Great job! Chapter marked as completed.");
    } catch (err) {
      console.error("Progress update failed", err);
    } finally {
      setIsMarkingComplete(false);
    }
  };

  if (!chapter) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-600 mb-4"></div>
        <p className="text-slate-500 font-medium">Fetching chapter data...</p>
      </div>
    );
  }

  return (
    <div className="relative flex">
      {/* --- Main Content Container --- */}
      <div className={`flex-1 transition-all duration-300 ${showNotes ? 'mr-80' : 'mr-0'}`}>
        <div className="max-w-4xl mx-auto bg-white min-h-screen shadow-sm border-x border-slate-100 pb-20">
          
          {/* Reader Header (Sticky) */}
          <div className="sticky top-0 bg-white/90 backdrop-blur-md z-20 border-b border-slate-100 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate(-1)} 
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <div>
                <h1 className="font-bold text-slate-800 text-sm md:text-base line-clamp-1">
                  {chapter.title}
                </h1>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    {chapter.subject_name || 'NCERT'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              {/* Language Switcher */}
              <div className="hidden md:flex bg-slate-100 p-1 rounded-xl">
                {['en', 'hi', 'te'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                      language === lang 
                        ? 'bg-white shadow-sm text-blue-600' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 border-l pl-2 border-slate-200">
                <button 
                  onClick={toggleBookmark}
                  title="Bookmark Chapter"
                  className={`p-2 rounded-lg transition-all ${isBookmarked ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
                >
                  <Bookmark size={20} fill={isBookmarked ? "currentColor" : "none"} />
                </button>
                
                <button 
                  onClick={() => setShowNotes(!showNotes)}
                  title="Open Notes"
                  className={`p-2 rounded-lg transition-all ${showNotes ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
                >
                  <Edit3 size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Chapter Text Body */}
          <div className="p-6 md:p-12">
            <header className="mb-12">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <BookOpen size={18} />
                <span className="text-sm font-bold tracking-widest uppercase">Chapter Content</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight mb-4">
                {chapter.title}
              </h2>
              <div className="flex items-center gap-4 text-slate-500 text-sm">
                <span className="flex items-center gap-1.5">
                  <Languages size={14} /> 
                  {language === 'en' ? 'English' : language === 'hi' ? 'Hindi' : 'Telugu'}
                </span>
                <span>•</span>
                <span>Class 11/12 NCERT</span>
              </div>
            </header>

            {/* Content Blocks (Text, Formulas, SVGs) */}
            <article className="prose prose-slate max-w-none">
              {chapter.content_blocks && chapter.content_blocks.length > 0 ? (
                chapter.content_blocks.map((block) => (
                  <ContentBlock key={block.id} block={block} />
                ))
              ) : (
                <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                  <p className="text-slate-400">No content blocks found for this chapter.</p>
                </div>
              )}
            </article>

            {/* Completion Footer */}
            <div className="mt-20 pt-10 border-t border-slate-100 flex flex-col items-center">
              <h4 className="text-lg font-bold text-slate-800 mb-2">Finished reading?</h4>
              <p className="text-slate-500 text-sm mb-6 text-center">Mark this chapter as complete to track your progress.</p>
              <button 
                onClick={handleComplete}
                disabled={isMarkingComplete}
                className="flex items-center gap-3 px-10 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl shadow-xl shadow-green-100 transition-all active:scale-95 disabled:opacity-50"
              >
                {isMarkingComplete ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <CheckCircle size={22} />
                )}
                Mark as Completed
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- Notes Sidebar (Conditional) --- */}
      {showNotes && (
        <NotesSidebar 
          chapterId={id} 
          onClose={() => setShowNotes(false)} 
        />
      )}
    </div>
  );
};

export default ChapterReader;