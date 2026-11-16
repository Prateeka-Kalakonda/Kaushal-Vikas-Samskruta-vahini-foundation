import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Play, FileText, CheckCircle2 } from 'lucide-react';
import api from '../api/axios';

const TopicDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState(null);
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const subRes = await api.get(`/subjects/${slug}`);
        if (subRes.data.success) {
          setSubject(subRes.data.data);
          const topicRes = await api.get(`/subjects/${slug}/topics`);
          if (topicRes.data.success) setTopics(topicRes.data.data);
        }
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, [slug]);

  if (!subject) return <div className="p-10">Loading Topics...</div>;

  return (
    <div className="space-y-8 max-w-5xl">
      <button onClick={() => navigate('/subjects')} className="flex items-center gap-2 text-slate-500 font-bold hover:text-blue-600 transition-colors">
        <ChevronLeft size={20} /> Back to Subjects
      </button>

      <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-20"></div>
        <h1 className="text-5xl font-black mb-2">{subject.name}</h1>
        <p className="text-blue-400 font-bold tracking-widest uppercase">Class {subject.class_level} Curriculum</p>
      </div>

      <div className="space-y-6">
        {topics.map((topic) => (
          <div key={topic.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:border-blue-200 transition-all">
            <div className="p-6 border-b border-slate-50 bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-800">{topic.title}</h3>
            </div>
            
            <div className="divide-y divide-slate-50">
              {topic.chapters?.map((chapter) => (
                <div 
                  key={chapter.id} 
                  onClick={() => navigate(`/chapter/${chapter.id}`)}
                  className="p-5 flex items-center justify-between hover:bg-blue-50/30 cursor-pointer group transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white rounded-xl border border-slate-100 text-slate-400 group-hover:text-blue-600 group-hover:border-blue-100 shadow-sm">
                      <FileText size={20} />
                    </div>
                    <span className="font-bold text-slate-700 group-hover:text-slate-900">{chapter.title}</span>
                  </div>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-600 transition-all group-hover:translate-x-1" />
                </div>
              ))}
              
              {(!topic.chapters || topic.chapters.length === 0) && (
                <p className="p-5 text-sm text-slate-400 italic text-center">No chapters published yet in this topic.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopicDetail;