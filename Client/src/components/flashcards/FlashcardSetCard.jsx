import React from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Sparkles, TrendingUp, Layers } from "lucide-react";
import moment from "moment";

const FlashcardSetCard = ({ flashcardSet }) => {

  const navigate = useNavigate();

  const handleStudyNow = () => {
    navigate(`/documents/${flashcardSet.documentId._id}/flashcards`);
  };

  const reviewedCount = flashcardSet.cards.filter(card => card.lastReviewed).length;
  const totalCards = flashcardSet.cards.length;
  const progressPercentage = totalCards > 0 ? Math.round((reviewedCount / totalCards) * 100) : 0;


  return (
    <div 
        // onClick={handleStudyNow}
        className="group relative bg-linear-to-br from-white via-blue-50/30 to-indigo-50/50 backdrop-blur-xl border border-blue-100 hover:border-blue-300 rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 h-full overflow-hidden"
    >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-blue-400/10 to-indigo-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-linear-to-tr from-cyan-400/10 to-blue-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
        
        <div className="relative space-y-4">
            {/* Icon and titles */}
            <div className="flex items-start gap-4">
                <div className="shrink-0 w-12 h-12 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 group-hover:scale-105 transition-all duration-300">
                    <BookOpen className="h-6 w-6 text-white" strokeWidth={2}/>
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-slate-800 group-hover:text-blue-900 line-clamp-2 mb-1 transition-colors duration-300" title={flashcardSet?.documentId?.title}>
                        {flashcardSet?.documentId?.title}
                    </h3>
                    <p className="text-xs font-medium text-blue-500/70 tracking-wide">
                        Created {moment(flashcardSet.createdAt).fromNow()}
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-2 pt-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200/60 rounded-lg">
                    <Layers className="h-3.5 w-3.5 text-blue-600" strokeWidth={2.5}/>
                    <span className="text-sm font-semibold text-blue-700">
                        {totalCards} {totalCards === 1 ? 'Card' : 'Cards'}
                    </span>
                </div>
                {reviewedCount > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-linear-to-r from-cyan-50 to-blue-50 border border-cyan-200/60 rounded-lg">
                        <TrendingUp className="h-3.5 w-3.5 text-cyan-600" strokeWidth={2.5}/>
                        <span className="text-sm font-semibold text-cyan-700">
                            {progressPercentage}% 
                        </span>
                    </div>
                )}
            </div>

            {/* Progress bar */}
            {totalCards > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500">
                            Study Progress
                        </span>
                        <span className="text-xs font-bold text-blue-600">
                            {reviewedCount}/{totalCards} Reviewed
                        </span>
                    </div>
                    <div className="relative h-2.5 overflow-hidden rounded-full bg-blue-100/80">
                        <div 
                            className="absolute left-0 top-0 h-full bg-linear-to-r from-blue-500 via-indigo-600 to-indigo-700 transition-all duration-500 rounded-full ease-out"
                            style={{ width: `${progressPercentage}%` }}
                        />
                        <div 
                            className="absolute left-0 top-0 h-full bg-linear-to-r from-white/0 via-white/40 to-white/0 rounded-full animate-pulse"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>
            )}
        </div>

        {/* Study Now */}
        <div className="relative mt-6 pt-4 border-t border-blue-100/60">
            <button
                onClick={(e)=>{
                    e.stopPropagation()
                    handleStudyNow()
                }}
                className="group/btn cursor-pointer relative w-full h-11 bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold text-sm rounded-xl transition-all duration-300 overflow-hidden active:scale-[0.98] shadow-md hover:shadow-lg hover:shadow-blue-500/40"
            >
                <span className="relative z-10 flex items-center justify-center gap-2">
                    <Sparkles className="h-4 w-4 group-hover/btn:rotate-12 transition-transform duration-300" strokeWidth={2.5}/>   
                    Study Now 
                </span>
                <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/25 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"/>
            </button>
        </div>
    </div>
  )
}

export default FlashcardSetCard