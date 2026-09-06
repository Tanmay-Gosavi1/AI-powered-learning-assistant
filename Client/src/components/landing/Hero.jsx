import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { 
  Sparkles, ArrowRight, Play, BrainCircuit, FileText, BookOpen, 
  CheckCircle, Flame, Star, Search, Bell, TrendingUp, ChevronRight
} from 'lucide-react'

const Hero = () => {
  const {user} = useAuth();
  const { isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState('activity') // 'activity' | 'flashcard' | 'quiz'

  return (
    <section className="relative overflow-hidden saas-hero-bg text-white pt-28 sm:pt-36 pb-20 sm:pb-32">
      {/* Background Decorative Ambient Blooms & Grid */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute top-1/3 right-10 w-[30rem] h-[30rem] bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-size-[24px_24px] opacity-[0.04] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Floating Pill Badge */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full saas-pill-badge text-xs sm:text-sm text-slate-200 shadow-xl shadow-black/20 hover:border-white/20 transition-all">
            <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-semibold text-amber-300">Many Students</span>
            <span className="text-slate-400">Already Studying Smarter with AI</span>
          </div>
        </div>

        {/* Hero Main Headline */}
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] sm:leading-[1.12]">
            Turn Any Notes & PDFs Into{' '}
            <span className="relative inline-block text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-indigo-300 to-cyan-300">
              Interactive Mastery
              {/* Golden/Orange Brush Curved Underline */}
              <svg
                className="absolute -bottom-2 sm:-bottom-3.5 left-0 w-full text-amber-400 h-3 sm:h-4 overflow-visible"
                viewBox="0 0 300 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 15C75 4 225 3 297 12"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            {' '}In Seconds
          </h1>

          {/* Subheading */}
          <p className="mt-6 sm:mt-8 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            The all-in-one AI study copilot that turns lecture slides, syllabi, and textbooks into smart flashcards, practice quizzes, and instant tutor explanations.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl font-bold text-white bg-linear-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <span>Go to Your Dashboard</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <Link
                to="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl font-bold text-white bg-linear-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <span>Get Started Free</span>
                <Sparkles className="w-5 h-5 text-blue-200" />
              </Link>
            )}

            <a
              href="#workflow"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl font-semibold text-slate-200 bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 hover:border-white/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <Play className="w-4 h-4 fill-current text-slate-300" />
              <span>See How It Works</span>
            </a>
          </div>

          {/* Trust points */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> Instant PDF & Notes analysis
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> Built for exams & deep recall
            </span>
          </div>
        </div>

        {/* Floating 3D SaaS Dashboard Showcase */}
        <div className="mt-14 sm:mt-20 saas-perspective">
          <div className="relative rounded-2xl sm:rounded-3xl border border-white/20 bg-slate-900/80 p-2 sm:p-4 saas-hero-mockup">
            {/* Top Browser Bar */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-slate-950/60 rounded-t-xl sm:rounded-t-2xl mb-2 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              </div>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-md bg-white/5 border border-white/10 text-slate-300 text-[11px] font-mono">
                <span className="text-emerald-400">🔒</span> https://prepmate-study-buddy.onrender.com
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-emerald-400 font-medium">● Live Workspace</span>
              </div>
            </div>

            {/* Inner Dashboard Mockup Canvas (Clean, Bright SaaS Layout inside the Dark Frame) */}
            <div className="bg-slate-50 text-slate-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-inner overflow-hidden">
              <div className="flex flex-col lg:flex-row gap-6">
                
                {/* Left Mini Sidebar */}
                <div className="hidden md:flex flex-col w-56 bg-white border border-slate-200/80 rounded-2xl p-4 shrink-0 shadow-sm">
                  <div className="flex items-center gap-2 pb-4 mb-3 border-b border-slate-100">
                    <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                      <BrainCircuit className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-slate-900 text-sm">PrepMate</span>
                  </div>

                  <div className="space-y-1 text-xs font-semibold">
                    <div className="px-2.5 py-1 text-[10px] uppercase tracking-wider text-slate-400 font-bold">Study Menu</div>
                    <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/25">
                      <TrendingUp className="w-4 h-4" />
                      <span>Dashboard</span>
                    </button>
                    <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors">
                      <FileText className="w-4 h-4 text-slate-500" />
                      <span>Documents</span>
                    </button>
                    <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors">
                      <BookOpen className="w-4 h-4 text-slate-500" />
                      <span>Flashcards</span>
                    </button>
                    <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors">
                      <Sparkles className="w-4 h-4 text-slate-500" />
                      <span>AI Quizzes</span>
                    </button>
                  </div>

                  {/* Student Pro Upgrade Card in Mini Sidebar */}
                  <div className="mt-auto pt-4">
                    <div className="p-3 rounded-xl bg-linear-to-br from-blue-600 to-indigo-700 text-white text-xs">
                      <div className="flex items-center gap-1.5 font-bold mb-1">
                        <Flame className="w-4 h-4 text-amber-300" />
                        <span>7-Day Streak!</span>
                      </div>
                      <p className="text-[11px] text-blue-100 mb-2">You're on top 5% of active learners this week.</p>
                      <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-amber-300 h-full w-4/5 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Main Dashboard Panel */}
                <div className="flex-1 min-w-0 space-y-4">
                  {/* Top Header Row inside Mockup */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
                    <div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                        <span>Home</span>
                        <span>›</span>
                        <span className="text-blue-600 font-semibold">Dashboard</span>
                      </div>
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-1.5">
                        Good Morning, {user?.name} 👋
                      </h2>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative hidden sm:block">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                        <input
                          type="text"
                          readOnly
                          placeholder="Search lecture notes..."
                          className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 w-48 shadow-2xs"
                        />
                      </div>
                      <div className="relative p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
                        <Bell className="w-4 h-4 text-slate-600" />
                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
                      </div>
                      <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-xs shadow-md">
                        {user ? user?.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                    </div>
                  </div>

                  {/* 3 Metric Cards Row (Blue, Amber, Rose accents) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200/70 shadow-2xs flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500">Study Documents</span>
                        <div className="text-xl font-bold text-slate-900 mt-0.5">24 Docs</div>
                        <span className="text-[10px] text-emerald-600 font-medium">↑ +4 uploaded recently</span>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        <FileText className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200/70 shadow-2xs flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500">Flashcards Mastered</span>
                        <div className="text-xl font-bold text-slate-900 mt-0.5">850 Cards</div>
                        <span className="text-[10px] text-amber-600 font-medium">★ 92% retention rate</span>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                        <BookOpen className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200/70 shadow-2xs flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500">Quiz Accuracy</span>
                        <div className="text-xl font-bold text-slate-900 mt-0.5">94% Avg</div>
                        <span className="text-[10px] text-emerald-600 font-medium">Top 5% student rank</span>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                        <Star className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* Interactive Feature Demo Tabs */}
                  <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">Live Feature Preview:</span>
                        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
                          <button
                            onClick={() => setActiveTab('activity')}
                            className={`px-3 py-1 rounded-md transition-all ${
                              activeTab === 'activity' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Weekly Activity
                          </button>
                          <button
                            onClick={() => setActiveTab('flashcard')}
                            className={`px-3 py-1 rounded-md transition-all ${
                              activeTab === 'flashcard' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Flashcards
                          </button>
                          <button
                            onClick={() => setActiveTab('quiz')}
                            className={`px-3 py-1 rounded-md transition-all ${
                              activeTab === 'quiz' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            AI Quiz
                          </button>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400 hidden sm:inline">Click tabs to preview</span>
                    </div>

                    {/* Tab 1: Weekly Activity Chart */}
                    {activeTab === 'activity' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 font-medium">Daily study intensity & questions completed</span>
                          <span className="font-bold text-emerald-600">Goal: 20 min/day (Completed)</span>
                        </div>
                        <div className="h-32 flex items-end justify-between gap-2 pt-4 px-2 bg-slate-50/70 rounded-xl border border-slate-100">
                          {[
                            { day: 'Mon', h: '65%', val: '45 mins' },
                            { day: 'Tue', h: '85%', val: '60 mins' },
                            { day: 'Wed', h: '50%', val: '35 mins' },
                            { day: 'Thu', h: '95%', val: '75 mins' },
                            { day: 'Fri', h: '70%', val: '50 mins' },
                            { day: 'Sat', h: '40%', val: '25 mins' },
                            { day: 'Sun', h: '90%', val: '65 mins' }
                          ].map((item, idx) => (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group cursor-pointer">
                              <div className="w-full max-w-[36px] bg-slate-200 rounded-t-lg relative flex items-end h-24 overflow-hidden">
                                <div
                                  style={{ height: item.h }}
                                  className="w-full bg-linear-to-t from-blue-600 to-indigo-500 group-hover:from-blue-500 group-hover:to-cyan-400 transition-all rounded-t-lg"
                                />
                              </div>
                              <span className="text-[10px] font-semibold text-slate-600">{item.day}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tab 2: Flashcard Sample */}
                    {activeTab === 'flashcard' && (
                      <div className="p-4 rounded-xl bg-linear-to-br from-purple-50 to-indigo-50 border border-purple-100 text-slate-800">
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="px-2 py-0.5 bg-purple-200 text-purple-800 font-bold rounded-full text-[10px]">Biology · Cellular Respiration</span>
                          <span className="text-slate-500 text-[11px]">Card 4 of 24</span>
                        </div>
                        <p className="font-bold text-sm sm:text-base text-slate-900 mb-2">
                          What is the primary role of ATP synthase during oxidative phosphorylation?
                        </p>
                        <p className="text-xs sm:text-sm text-slate-600 bg-white/80 p-2.5 rounded-lg border border-purple-100/80">
                          <strong className="text-purple-700">Answer:</strong> Utilizes the proton gradient across the inner mitochondrial membrane to synthesize ATP from ADP and inorganic phosphate.
                        </p>
                      </div>
                    )}

                    {/* Tab 3: Quiz Sample */}
                    {activeTab === 'quiz' && (
                      <div className="p-4 rounded-xl bg-linear-to-br from-emerald-50 to-teal-50 border border-emerald-100 text-slate-800 text-xs">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-emerald-800 text-[10px] uppercase tracking-wide">Question 2 / 5</span>
                          <span className="text-emerald-700 font-bold text-[11px]">Medium Difficulty</span>
                        </div>
                        <p className="font-bold text-sm text-slate-900 mb-3">
                          Which algorithmic paradigm does Dijkstra’s shortest-path algorithm follow?
                        </p>
                        <div className="grid grid-cols-2 gap-2 font-medium">
                          <div className="p-2 rounded-lg bg-emerald-600 text-white font-semibold flex items-center justify-between shadow-2xs">
                            <span>A. Greedy Method</span>
                            <CheckCircle className="w-3.5 h-3.5" />
                          </div>
                          <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700">
                            B. Dynamic Programming
                          </div>
                          <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700">
                            C. Divide & Conquer
                          </div>
                          <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700">
                            D. Backtracking
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Notice Board & Recent Materials inside preview */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="bg-white p-3 rounded-xl border border-slate-200/70 shadow-2xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-900">Recent Materials</span>
                        <span className="text-[10px] text-blue-600 font-semibold cursor-pointer">View All</span>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                          <div className="flex items-center gap-2 truncate">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="truncate font-medium text-slate-800">Organic_Chemistry_Ch4.pdf</span>
                          </div>
                          <span className="text-[10px] text-slate-400 shrink-0">12m ago</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                          <div className="flex items-center gap-2 truncate">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="truncate font-medium text-slate-800">Operating_Systems_Midterm.pdf</span>
                          </div>
                          <span className="text-[10px] text-slate-400 shrink-0">2h ago</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200/70 shadow-2xs flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-900">Next Recommended Action</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold">Recommended</span>
                        </div>
                        <p className="text-xs text-slate-600">
                          Review 14 starred flashcards from <span className="font-semibold text-slate-900">Organic Chemistry</span> before tonight's review window.
                        </p>
                      </div>
                      <button className="mt-2.5 w-full py-1.5 text-xs font-semibold text-center rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center justify-center gap-1">
                        <span>Start 5-Min Review</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}

export default Hero