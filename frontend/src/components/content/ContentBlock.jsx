import React from 'react';

const ContentBlock = ({ block }) => {
  switch (block.type) {
    case 'text':
      return (
        <p className="text-lg text-slate-700 leading-relaxed mb-6">
          {block.content}
        </p>
      );

    case 'formula':
      return (
        <div className="my-8 p-6 bg-blue-50 rounded-2xl flex justify-center border border-blue-100 overflow-x-auto">
          {/* We use MathML structure or KaTeX style rendering */}
          <math className="text-xl font-serif" display="block">
            <string dangerouslySetInnerHTML={{ __html: block.content }} />
          </math>
        </div>
      );

    case 'diagram':
      return (
        <div className="my-8 flex flex-col items-center">
          <div 
            className="w-full max-w-lg bg-white p-4 rounded-xl shadow-sm border border-slate-200"
            dangerouslySetInnerHTML={{ __html: block.content }} // Renders SVG string
          />
          <p className="mt-2 text-sm text-slate-500 italic">{block.caption}</p>
        </div>
      );

    case 'simulation_link':
      return (
        <div className="my-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
          <div>
            <h4 className="font-bold text-amber-900">Interactive Lab available</h4>
            <p className="text-sm text-amber-700">Try the simulation for this concept.</p>
          </div>
          <button className="px-4 py-2 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600">
            Open Lab
          </button>
        </div>
      );

    default:
      return null;
  }
};

export default ContentBlock;