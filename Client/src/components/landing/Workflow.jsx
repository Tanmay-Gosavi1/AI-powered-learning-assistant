import React from 'react'
import { Link } from 'react-router-dom'
import { FileText, MessageSquare, BookOpen, CheckCircle, BarChart2, ArrowRight, Upload } from 'lucide-react'

const steps = [
  {
    icon: FileText,
    title: 'Go to Documents',
    desc: 'Open your study space.',
    path: '/documents',
    gradient: 'from-blue-600 to-blue-400'
  },
  {
    icon: Upload,
    title: 'Upload PDF',
    desc: 'Add notes or lecture slides.',
    path: '/documents',
    gradient: 'from-sky-600 to-sky-400'
  },
  {
    icon: MessageSquare,
    title: 'Ask Questions',
    desc: 'Ask questions, get clear answers.',
    path: '/dashboard',
    gradient: 'from-indigo-600 to-indigo-400'
  },
  {
    icon: BookOpen,
    title: 'Generate Flashcards',
    desc: 'Create decks in one click.',
    path: '/flashcards',
    gradient: 'from-purple-600 to-purple-400'
  },
  {
    icon: CheckCircle,
    title: 'Take Quizzes',
    desc: 'Practice with instant feedback.',
    path: '/dashboard',
    gradient: 'from-emerald-600 to-teal-400'
  },
  {
    icon: BarChart2,
    title: 'Track Progress',
    desc: 'See mastery, weak spots, streaks.',
    path: '/dashboard',
    gradient: 'from-cyan-600 to-sky-400'
  }
]

const Workflow = () => {
  return (
    <section id="workflow" className="py-16 sm:py-24 text-white bg-linear-to-br from-blue-950 to-blue-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">How to Use PrepMate</h2>
          <p className="mt-3 text-base sm:text-lg text-blue-100">Go step by step — from PDFs to mastery.</p>
        </div>

        {/* Vertical timeline */}
        <div>
          <div className="flex items-center gap-3 overflow-x-auto snap-x snap-mandatory pb-2">
            {steps.map((step, idx) => (
              <React.Fragment key={idx}>
                <Link to={step.path} className="snap-start shrink-0">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/85 text-blue-950 border border-white/15 hover:bg-white hover:scale-105 transition-all duration-250">
                    <span className="px-2 py-0.5 text-[11px] rounded-full bg-blue-900 text-white/90">{idx + 1}</span>
                    <span className="text-sm font-medium">{step.title}</span>
                  </div>
                </Link>
                {idx < steps.length - 1 && (
                  <ArrowRight className="hidden md:block w-5 h-5 text-white/70" aria-hidden="true" />
                )}
              </React.Fragment>
            ))}
          </div>
          <p className="mt-4 text-center text-blue-100 text-sm">Follow steps left to right.</p>
        </div>
      </div>
    </section>
  )
}

export default Workflow
