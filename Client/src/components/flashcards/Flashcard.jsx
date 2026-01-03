import React, { useState } from 'react'
import { Star, RotateCcw, Sparkles } from 'lucide-react'

const Flashcard = ({ flashcard, onToggleStar }) => {
  const [isFlipped, setIsFlipped] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  // Dynamic difficulty colors
  const getDifficultyStyles = (difficulty) => {
    const styles = {
      easy: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
      medium: 'bg-amber-100 text-amber-700 border border-amber-200',
      hard: 'bg-rose-100 text-rose-700 border border-rose-200',
    }
    return styles[difficulty?.toLowerCase()] || 'bg-slate-100 text-slate-600 border border-slate-200'
  }

  return (
    <div 
      className='relative w-full h-80 group' 
      style={{ perspective: '1200px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Ambient glow effect */}
      <div className={`absolute -inset-1 bg-linear-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-xl transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
      
      <div 
        className={`relative w-full h-full transition-all duration-700 ease-out transform-gpu cursor-pointer ${isHovered && !isFlipped ? 'scale-[1.02]' : ''}`}
        style={{ 
          transformStyle: 'preserve-3d', 
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
        onClick={handleFlip}
      >
        {/* Front */}
        <div
          className='absolute inset-0 w-full h-full bg-linear-to-br from-white via-white to-slate-50 border border-slate-200/60 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-6 flex flex-col justify-between overflow-hidden'
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          {/* Decorative elements */}
          <div className='absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-blue-100/40 to-purple-100/40 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2' />
          <div className='absolute bottom-0 left-0 w-24 h-24 bg-linear-to-tr from-pink-100/30 to-orange-100/30 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2' />
          
          {/* Header */}
          <div className='relative flex items-center justify-between'>
            <div className={`text-[10px] font-semibold uppercase tracking-wider rounded-full px-3 py-1.5 ${getDifficultyStyles(flashcard.difficulty)}`}>
              {flashcard.difficulty}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleStar(flashcard._id)
              }}
              className={`w-10 h-10 flex items-center justify-center transition-all duration-300 rounded-full cursor-pointer transform hover:scale-110 active:scale-95
                ${flashcard.isStarred 
                  ? 'bg-linear-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30' 
                  : 'bg-slate-100/80 hover:bg-slate-200/80 text-slate-400 hover:text-amber-500'}`}
            >
              <Star 
                className={`w-4 h-4 transition-transform duration-300 ${flashcard.isStarred ? 'animate-pulse' : ''}`} 
                strokeWidth={2} 
                fill={flashcard.isStarred ? 'currentColor' : 'none'} 
              />
            </button>
          </div>

          {/* Question */}
          <div className='relative flex-1 flex items-center justify-center px-2 py-4'>
            <div className='text-center'>
              <Sparkles className='w-5 h-5 text-blue-400/60 mx-auto mb-3' />
              <p className='text-lg font-semibold text-slate-800 leading-relaxed tracking-tight'>
                {flashcard.question}
              </p>
            </div>
          </div>

          {/* Flip indicator */}
          <div className={`relative flex items-center justify-center gap-2 text-slate-400 text-sm transition-all duration-300 ${isHovered ? 'text-blue-500' : ''}`}>
            <RotateCcw className={`w-4 h-4 transition-transform duration-500 ${isHovered ? 'rotate-180' : ''}`} strokeWidth={2} />
            <span className='font-medium'>Tap to reveal</span>
          </div>
        </div>

        {/* Back */}
        <div
          className='absolute inset-0 w-full h-full bg-linear-to-br from-indigo-600 via-blue-700 to-blue-900 border border-blue-500/20 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.15)] p-6 flex flex-col justify-between overflow-hidden'
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {/* Decorative elements */}
          <div className='absolute top-0 right-0 w-40 h-40 bg-linear-to-br from-white/10 to-transparent rounded-full blur-2xl -translate-y-1/2 translate-x-1/2' />
          <div className='absolute bottom-0 left-0 w-32 h-32 bg-linear-to-tr from-purple-500/20 to-transparent rounded-full blur-2xl translate-y-1/2 -translate-x-1/2' />
          <div className='absolute top-1/2 left-1/2 w-64 h-64 bg-blue-400/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2' />
          
          {/* Header */}
          <div className='relative flex items-center justify-between'>
            <div className='text-[10px] font-semibold uppercase tracking-wider rounded-full px-3 py-1.5 bg-white/15 text-white/90 border border-white/10 backdrop-blur-sm'>
              {flashcard.difficulty}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleStar(flashcard._id)
              }}
              className={`w-10 h-10 flex items-center justify-center transition-all duration-300 rounded-full cursor-pointer transform hover:scale-110 active:scale-95
                ${flashcard.isStarred 
                  ? 'bg-linear-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30' 
                  : 'bg-white/15 hover:bg-white/25 text-white/70 hover:text-amber-400 backdrop-blur-sm'}`}
            >
              <Star 
                className={`w-4 h-4 transition-transform duration-300 ${flashcard.isStarred ? 'animate-pulse' : ''}`} 
                strokeWidth={2} 
                fill={flashcard.isStarred ? 'currentColor' : 'none'} 
              />
            </button>
          </div>

          {/* Answer */}
          <div className='relative flex-1 flex items-center justify-center px-2 py-4'>
            <div className='text-center'>
              <div className='w-8 h-1 bg-linear-to-r from-blue-400 to-purple-400 rounded-full mx-auto mb-4' />
              <p className='text-lg font-semibold text-white leading-relaxed tracking-tight'>
                {flashcard.answer}
              </p>
            </div>
          </div>

          {/* Flip indicator */}
          <div className='relative flex items-center justify-center gap-2 text-blue-200/70 text-sm'>
            <RotateCcw className='w-4 h-4' strokeWidth={2} />
            <span className='font-medium'>Tap to see question</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Flashcard