
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Trophy, ChevronLeft, CheckCircle2, XCircle, Info } from 'lucide-react'
import quizService from '../../service/quizService'
import PageHeader from '../../components/common/PageHeader'
import Spinner from '../../components/common/Spinner'
import Button from '../../components/common/Button'
import toast from 'react-hot-toast'

const QuizResult = () => {
  const { quizId } = useParams()
  const navigate = useNavigate()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await quizService.getQuizResults(quizId)
        setData(res.data)
      } catch (error) {
        const message = error?.error || error?.message || 'Failed to load results'
        toast.error(message)
      } finally {
        setLoading(false)
      }
    }
    fetchResults()
  }, [quizId])

  const metrics = useMemo(() => {
    const total = data?.quiz?.totalQuestions ?? data?.results?.length ?? 0
    const correct = (data?.results || []).filter(r => r.isCorrect).length
    const incorrect = total - correct
    const score = data?.quiz?.score ?? Math.round((correct / Math.max(total, 1)) * 100)
    let verdict = 'Keep going!'
    if (score >= 85) verdict = 'Excellent!'
    else if (score >= 70) verdict = 'Great job!'
    else if (score >= 50) verdict = 'Not bad!'
    return { total, correct, incorrect, score, verdict }
  }, [data])

  const backToDocument = () => {
    const docId = data?.quiz?.document?._id || data?.quiz?.document
    if (docId) return navigate(`/documents/${docId}`)
    return navigate('/dashboard')
  }

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner label="Loading results..." />
      </div>
    )

  if (!data)
    return (
      <div className="max-w-4xl mx-auto px-4">
        <PageHeader title="Quiz Results" />
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
          <p className="text-slate-700">No results available.</p>
          <div className="mt-4">
            <Button onClick={() => navigate('/dashboard')}>
              <ChevronLeft strokeWidth={2.5} /> Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={backToDocument}
          className='flex items-center gap-2 text-sm font-semibold py-2 cursor-pointer text-blue-800 hover:text-blue-900 hover:scale-105 transition-all duration-150'
        >
          <ChevronLeft className='w-3.5 h-3.5' strokeWidth={2.5} /> Back to Document
        </button>
      <PageHeader
        title={`${data?.quiz?.title || 'Quiz'} - Quiz Results`}
        subtitle={`${metrics.total} questions • Completed`}
      ></PageHeader>

      {/* Summary card */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 sm:p-8 mb-8 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-blue-50/40 via-indigo-50/30 to-cyan-50/40" />
        <div className="relative flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-green-50 border border-green-200 shadow-sm flex items-center justify-center">
            <Trophy className="text-green-600" strokeWidth={2.5} />
          </div>
          <span className="text-xs font-semibold text-slate-600 tracking-wide">YOUR SCORE</span>
          <div className="text-5xl font-extrabold leading-none text-orange-500">{metrics.score}%</div>
          <p className="text-sm font-medium text-slate-700">{metrics.verdict}</p>

          {/* Stats pills */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-semibold">
              <span className="inline-block w-4 h-4 rounded-full border border-slate-300" />
              {metrics.total} Total
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-green-200 bg-green-50 text-green-700 text-sm font-semibold">
              <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} /> {metrics.correct} Correct
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-sm font-semibold">
              <XCircle className="w-4 h-4" strokeWidth={2.5} /> {metrics.incorrect} Incorrect
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Review */}
      <div className="mb-3 flex items-center gap-2">
        <div className="w-5 h-5 rounded-md bg-blue-100 border border-blue-200 flex items-center justify-center">
          <Info className="w-3.5 h-3.5 text-blue-700" strokeWidth={2.5} />
        </div>
        <span className="text-sm font-bold text-slate-800">Detailed Review</span>
      </div>

      <div className="space-y-4">
        {(data?.results || []).map((item, idx) => {
          const correctText = item?.correctAnswer
          const selectedText = item?.selectedOption ?? item?.selectedAnswer
          const wasCorrect = !!item?.isCorrect
          return (
            <div
              key={idx}
              className="rounded-2xl border bg-white shadow-sm overflow-hidden border-slate-200"
            >
              {/* Header */}
              <div className="flex items-center justify-between gap-2 p-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                    Question {idx + 1}
                  </span>
                </div>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                  wasCorrect
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  {wasCorrect ? (
                    <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} />
                  ) : (
                    <XCircle className="w-4 h-4" strokeWidth={2.5} />
                  )}
                  {wasCorrect ? 'Correct' : 'Incorrect'}
                </div>
              </div>

              {/* Body */}
              <div className="p-5 sm:p-6">
                <h4 className="text-base sm:text-lg font-semibold text-slate-900 mb-4">
                  {item?.question}
                </h4>
                <div className="space-y-3">
                  {(item?.options || []).map((opt, oIdx) => {
                    const isCorrectOption = opt === correctText
                    const isSelected = opt === selectedText
                    const base = 'group relative flex items-center gap-3 rounded-xl border p-3 sm:p-4'
                    const state = isCorrectOption
                      ? 'border-green-500 bg-green-50'
                      : isSelected
                      ? 'border-rose-300 bg-rose-50'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    return (
                      <div key={oIdx} className={`${base} ${state}`}>
                        {/* Bullet */}
                        <span
                          className={`flex items-center justify-center w-5 h-5 rounded-full border ${
                            isCorrectOption ? 'border-green-600' : 'border-slate-300'
                          }`}
                        >
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              isCorrectOption ? 'bg-green-600' : 'bg-slate-300'
                            }`}
                          />
                        </span>
                        {/* Option text */}
                        <span className="flex-1 text-sm sm:text-base text-slate-800">{opt}</span>
                        {isCorrectOption && (
                          <CheckCircle2 className="text-green-600" strokeWidth={2.5} />
                        )}
                        {!isCorrectOption && isSelected && (
                          <XCircle className="text-rose-600" strokeWidth={2.5} />
                        )}
                      </div>
                    )
                  })}
                </div>

                {item?.explanation && (
                  <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
                    <p className="text-sm text-blue-800">
                      <span className="font-semibold">Explanation:</span> {item.explanation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer actions */}
      <div className="my-8 flex items-center justify-between">
        <Button variant="outline" onClick={backToDocument}>
          <ChevronLeft strokeWidth={2.5} /> Back to Document
        </Button>
        <Button onClick={() => navigate(`/quizzes/${quizId}`)}>Retake Quiz</Button>
      </div>
    </div>
  )
}

export default QuizResult