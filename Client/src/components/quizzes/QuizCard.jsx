import React from 'react'
import moment from 'moment'
import { Play, BarChart2, Trash2, Award, Layers } from 'lucide-react'
import Button from '../common/Button.jsx'
import { useNavigate } from 'react-router-dom'

const QuizCard = ({ quiz, onDelete }) => {
  const questionsCount = quiz?.questions?.length || 0
  const hasAttempt = Array.isArray(quiz?.userAnswers) && quiz.userAnswers.length > 0
  const createdAt = quiz?.createdAt ? moment(quiz.createdAt).fromNow() : '—'
  const navigate = useNavigate()

  const handleDelete = (e) => {
    e.stopPropagation()
    if (typeof onDelete === 'function') onDelete(quiz?._id)
  }

  return (
    <div className="group relative bg-linear-to-br from-white via-blue-50/30 to-indigo-50/50 backdrop-blur-xl border border-blue-100 hover:border-blue-300 rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 h-full overflow-hidden">
      {/* Background decoration */}
      <div className="pointer-events-none absolute top-0 right-0 w-28 h-28 bg-linear-to-br from-blue-400/10 to-indigo-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
      <div className="pointer-events-none absolute bottom-0 left-0 w-20 h-20 bg-linear-to-tr from-cyan-400/10 to-blue-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />

      {/* Top controls */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
        <button
          onClick={handleDelete}
          title="Delete Quiz"
          className="w-9 h-9 flex items-center cursor-pointer justify-center rounded-full bg-white/70 hover:bg-rose-50 text-rose-600 border border-rose-200/60 shadow-sm hover:shadow-md transition-all duration-200 active:scale-95"
        >
          <Trash2 className="w-4.5 h-4.5" strokeWidth={2.5} />
        </button>
      </div>

      {/* Content */}
      <div className="relative space-y-4">
        {/* Badge */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200/60">
            <Award className="h-3.5 w-3.5 text-blue-600" strokeWidth={2.5} />
            <span className="text-xs font-semibold text-blue-700">
              {hasAttempt ? `Score: ${quiz?.score ?? 0}%` : 'Not attempted'}
            </span>
          </div>
        </div>

        {/* Title + meta */}
        <div>
          <h3 className="text-base font-bold text-slate-800 group-hover:text-blue-900 line-clamp-2 mb-1 transition-colors duration-300" title={quiz?.title}>
            {quiz?.title || `Quiz created on ${moment(quiz?.createdAt).format('MMM DD, YYYY')}`}
          </h3>
          <p className="text-xs font-medium text-blue-500/70 tracking-wide">Created {createdAt}</p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-2 pt-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200/60 rounded-lg">
            <Layers className="h-3.5 w-3.5 text-blue-600" strokeWidth={2.5} />
            <span className="text-sm font-semibold text-blue-700">
              {questionsCount} {questionsCount === 1 ? 'Question' : 'Questions'}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="relative mt-6 pt-4 border-t border-blue-100/60">
        {hasAttempt ? (
          <Button
            variant="success"
            className="w-full justify-center hover:scale-105"
            onClick={() => navigate(`/quizzes/${quiz._id}/results`)}
          >
            <BarChart2 strokeWidth={2.5} />
            View Results
          </Button>
        ) : (
          <Button
            onClick={() => navigate(`/quizzes/${quiz._id}`)}
            className="group/btn relative w-full h-11 justify-center bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white overflow-hidden shadow-md hover:shadow-lg hover:shadow-blue-500/40"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <Play className="h-4 w-4 group-hover/btn:rotate-12 transition-transform duration-300" strokeWidth={2.5} />
              Take Quiz
            </span>
            <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/25 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
          </Button>
        )}
      </div>
    </div>
  )
}

export default QuizCard