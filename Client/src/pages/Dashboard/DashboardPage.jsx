import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import progressService from '../../service/progressService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { toast } from 'react-hot-toast';
import { 
  TrendingUp, FileText, BookOpen, BrainCircuit, 
  Star, CheckCircle, Flame, ArrowUpRight, 
  Plus, ChevronRight, Sparkles,
  Calendar, Layers, MessageSquare, ArrowRight,
  Filter
} from 'lucide-react';
import Spinner from '../../components/common/Spinner.jsx';

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activityFilter, setActivityFilter] = useState('all'); // 'all' | 'documents' | 'quizzes'
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await progressService.getDashboard();
        setDashboardData(data);
      } catch (error) {
        toast.error("Failed to fetch dashboard data");
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className='min-h-[85vh] flex items-center justify-center'>
        <Spinner label='Loading dashboard' />
      </div>
    );
  }

  if (!dashboardData || !dashboardData.overview) {
    return (
      <div className='min-h-[85vh] flex items-center justify-center'>
        <div className='flex flex-col items-center justify-center text-center p-8 max-w-md bg-white border border-slate-200/80 rounded-2xl shadow-sm'>
          <div className='flex items-center justify-center w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl mb-4'>
            <TrendingUp className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">Welcome to PrepMate!</h2>
          <p className="text-slate-500 text-sm mb-6">Upload your first lecture notes or textbook PDF to begin tracking your AI study progress.</p>
          <button
            onClick={() => navigate('/documents')}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/25 hover:bg-blue-500 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>
    );
  }

  const { overview, recentActivity } = dashboardData;

  // Calculate percentage rates
  const quizCompletionRate = overview.totalQuizzes > 0 
    ? Math.round((overview.completedQuizzes / overview.totalQuizzes) * 100) 
    : 0;

  const starredPercentage = overview.totalFlashcards > 0
    ? Math.round((overview.starredFlashcards / overview.totalFlashcards) * 100)
    : 0;

  const formatTimestamp = (ts) => {
    if (!ts) return 'Just now';
    const d = new Date(ts);
    return isNaN(d.getTime()) ? 'Recently' : d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Compile and filter recent activities
  const allActivities = [
    ...(recentActivity?.documents || []).map((doc) => ({
      id: doc._id,
      title: doc.title,
      fileName: doc.fileName,
      type: 'document',
      timestamp: doc.lastAccessed || doc.updatedAt || doc.createdAt,
      link: `/documents/${doc._id}`,
      status: doc.status || 'ready'
    })),
    ...(recentActivity?.quizzes || []).map((quiz) => ({
      id: quiz._id,
      title: quiz.title || quiz.documentId?.title || 'Practice Quiz',
      type: 'quiz',
      timestamp: quiz.completedAt || quiz.updatedAt || quiz.createdAt,
      link: `/quizzes/${quiz._id}`,
      score: quiz.score,
      total: quiz.totalQuestions
    }))
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const filteredActivities = allActivities.filter((act) => {
    if (activityFilter === 'documents') return act.type === 'document';
    if (activityFilter === 'quizzes') return act.type === 'quiz';
    return true;
  }).slice(0, 5);

  // Circular gauge for Quiz Mastery
  const MasteryRing = ({ percentage = 0, size = 130, strokeWidth = 10 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (Math.min(Math.max(percentage, 0), 100) / 100) * circumference;

    return (
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            className="text-slate-100"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          <circle
            className="text-emerald-500 transition-all duration-1000 ease-out"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold text-slate-900 tracking-tight">{percentage}%</span>
          <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Score</span>
        </div>
      </div>
    );
  };

  // Mock days of week for streak visualization
  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const currentDayIndex = (new Date().getDay() + 6) % 7; // Monday = 0

  return (
    <div className='min-h-screen pb-12 pt-2 px-1 sm:px-2'>
      <div className='max-w-7xl mx-auto space-y-6'>

        {/* Top Greeting & Header Bar */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs'>
          <div>
            <div className='flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1'>
              <span className='hover:text-slate-700 cursor-pointer' onClick={() => navigate('/')}>Home</span>
              <span className='text-slate-300'>›</span>
              <span className='text-blue-600 font-bold'>Dashboard</span>
            </div>
            <h1 className='text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight'>
              Welcome back, {user?.name || 'Student'}! 👋
            </h1>
            <p className='text-slate-500 text-sm mt-0.5'>
              Here is your AI learning momentum and study overview for today.
            </p>
          </div>

          <div className='flex items-center gap-3 shrink-0'>
            <button
              onClick={() => navigate('/documents')}
              className='flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-all cursor-pointer'
            >
              <FileText className='w-4 h-4 text-slate-600' />
              <span>Browse Documents</span>
            </button>
            <button
              onClick={() => navigate('/documents')}
              className='flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer'
            >
              <Plus className='w-4 h-4' />
              <span>Upload Material</span>
            </button>
          </div>
        </div>

        {/* 4 Clean Metric Stat Cards */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          {/* Card 1: Documents */}
          <div className='bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-300 hover:shadow-md transition-all duration-200'>
            <div className='flex items-center justify-between mb-3'>
              <span className='text-xs font-bold uppercase tracking-wider text-slate-500'>Study Documents</span>
              <div className='w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold'>
                <FileText className='w-5 h-5' />
              </div>
            </div>
            <div className='text-3xl font-extrabold text-slate-900 tracking-tight'>
              {overview.totalDocuments}
            </div>
            <div className='flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs'>
              <span className='text-slate-500'>Uploaded notes & PDFs</span>
              <span className='font-semibold text-blue-600 cursor-pointer hover:underline' onClick={() => navigate('/documents')}>
                Manage →
              </span>
            </div>
          </div>

          {/* Card 2: Flashcards */}
          <div className='bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-purple-300 hover:shadow-md transition-all duration-200'>
            <div className='flex items-center justify-between mb-3'>
              <span className='text-xs font-bold uppercase tracking-wider text-slate-500'>Flashcards</span>
              <div className='w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold'>
                <BookOpen className='w-5 h-5' />
              </div>
            </div>
            <div className='text-3xl font-extrabold text-slate-900 tracking-tight'>
              {overview.totalFlashcards}
            </div>
            <div className='flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs'>
              <span className='text-slate-500'>{overview.totalFlashcardSets} study decks</span>
              <span className='font-semibold text-amber-600 flex items-center gap-1'>
                <Star className='w-3 h-3 fill-current' /> {overview.starredFlashcards} Starred
              </span>
            </div>
          </div>

          {/* Card 3: Quiz Mastery */}
          <div className='bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all duration-200'>
            <div className='flex items-center justify-between mb-3'>
              <span className='text-xs font-bold uppercase tracking-wider text-slate-500'>Quiz Performance</span>
              <div className='w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold'>
                <BrainCircuit className='w-5 h-5' />
              </div>
            </div>
            <div className='text-3xl font-extrabold text-slate-900 tracking-tight'>
              {overview.averageScore}%
            </div>
            <div className='flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs'>
              <span className='text-slate-500'>Avg test score</span>
              <span className='font-semibold text-emerald-600'>
                {overview.completedQuizzes}/{overview.totalQuizzes} completed
              </span>
            </div>
          </div>

          {/* Card 4: Study Streak */}
          <div className='bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-amber-300 hover:shadow-md transition-all duration-200'>
            <div className='flex items-center justify-between mb-3'>
              <span className='text-xs font-bold uppercase tracking-wider text-slate-500'>Study Streak</span>
              <div className='w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold'>
                <Flame className='w-5 h-5 fill-current' />
              </div>
            </div>
            <div className='text-3xl font-extrabold text-slate-900 tracking-tight flex items-baseline gap-1.5'>
              {overview.studyStreak} <span className='text-base font-semibold text-slate-500'>Days</span>
            </div>
            <div className='flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs'>
              <span className='text-slate-500'>Active daily habit</span>
              <span className='font-semibold text-amber-600'>
                {overview.studyStreak > 0 ? '🔥 On Fire' : 'Start Today'}
              </span>
            </div>
          </div>
        </div>

        {/* Main 2-Column SaaS Workspace */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          
          {/* Left Column (Primary Analytics & Study Materials) */}
          <div className='lg:col-span-2 space-y-6'>

            {/* Weekly Learning Activity Chart Card */}
            <div className='bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs'>
              <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6'>
                <div>
                  <h2 className='text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2'>
                    <TrendingUp className='w-5 h-5 text-blue-600' />
                    <span>Learning Momentum</span>
                  </h2>
                  <p className='text-xs text-slate-500 mt-0.5'>Daily study distribution & practice intensity</p>
                </div>
                <div className='flex items-center gap-2 text-xs'>
                  <span className='px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 flex items-center gap-1'>
                    <span className='w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse' />
                    Target: 20 min/day
                  </span>
                </div>
              </div>

              {/* Visual Daily Intensity Bars */}
              <div className='pt-2 pb-4 px-2 bg-slate-50/60 rounded-xl border border-slate-100'>
                <div className='h-40 flex items-end justify-between gap-2 sm:gap-4 px-2'>
                  {[
                    { day: 'Mon', height: '65%', score: '35 min' },
                    { day: 'Tue', height: '80%', score: '45 min' },
                    { day: 'Wed', height: '45%', score: '20 min' },
                    { day: 'Thu', height: '90%', score: '55 min' },
                    { day: 'Fri', height: '70%', score: '40 min' },
                    { day: 'Sat', height: '55%', score: '25 min' },
                    { day: 'Sun', height: '85%', score: '50 min' },
                  ].map((item, idx) => {
                    const isToday = idx === currentDayIndex;
                    return (
                      <div key={idx} className='flex-1 flex flex-col items-center gap-2 group cursor-pointer'>
                        {/* Tooltip on hover */}
                        <span className='text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity bg-white px-2 py-0.5 rounded shadow-xs border border-slate-200'>
                          {item.score}
                        </span>
                        {/* Bar */}
                        <div className='w-full max-w-[42px] bg-slate-200/80 rounded-xl relative flex items-end h-28 overflow-hidden'>
                          <div
                            style={{ height: item.height }}
                            className={`w-full transition-all duration-500 rounded-t-lg ${
                              isToday 
                                ? 'bg-linear-to-t from-blue-600 to-indigo-500 shadow-md' 
                                : 'bg-linear-to-t from-slate-400 to-slate-300 group-hover:from-blue-500 group-hover:to-cyan-400'
                            }`}
                          />
                        </div>
                        {/* Day label */}
                        <div className='flex flex-col items-center'>
                          <span className={`text-xs font-bold ${isToday ? 'text-blue-600' : 'text-slate-500'}`}>
                            {item.day}
                          </span>
                          {isToday && (
                            <span className='w-1 h-1 rounded-full bg-blue-600 mt-0.5' />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Recent Study Materials Card */}
            <div className='bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs'>
              <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5'>
                <div>
                  <h2 className='text-base sm:text-lg font-bold text-slate-900'>Recent Study Materials</h2>
                  <p className='text-xs text-slate-500 mt-0.5'>Pick up right where you left off</p>
                </div>

                {/* Filter Pills */}
                <div className='flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto'>
                  <button
                    onClick={() => setActivityFilter('all')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      activityFilter === 'all' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All ({allActivities.length})
                  </button>
                  <button
                    onClick={() => setActivityFilter('documents')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      activityFilter === 'documents' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Documents
                  </button>
                  <button
                    onClick={() => setActivityFilter('quizzes')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      activityFilter === 'quizzes' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Quizzes
                  </button>
                </div>
              </div>

              {/* Activity List */}
              {filteredActivities.length > 0 ? (
                <div className='space-y-2.5'>
                  {filteredActivities.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      onClick={() => navigate(item.link)}
                      className='group flex items-center justify-between p-3.5 sm:p-4 rounded-xl border border-slate-200/70 hover:border-blue-300 hover:bg-blue-50/20 hover:shadow-xs transition-all duration-200 cursor-pointer bg-white'
                    >
                      <div className='flex items-center gap-3.5 min-w-0'>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          item.type === 'document'
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-emerald-50 text-emerald-600'
                        }`}>
                          {item.type === 'document' ? (
                            <FileText className='w-5 h-5' />
                          ) : (
                            <BrainCircuit className='w-5 h-5' />
                          )}
                        </div>

                        <div className='min-w-0'>
                          <p className='text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate'>
                            {item.title}
                          </p>
                          <div className='flex items-center gap-2 mt-0.5 text-xs text-slate-500'>
                            <span className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full text-[10px] ${
                              item.type === 'document' 
                                ? 'bg-blue-100/70 text-blue-700' 
                                : 'bg-emerald-100/70 text-emerald-700'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${item.type === 'document' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                              {item.type === 'document' ? 'Document' : 'Quiz'}
                            </span>
                            <span>•</span>
                            <span>{formatTimestamp(item.timestamp)}</span>
                          </div>
                        </div>
                      </div>

                      <div className='flex items-center gap-3 shrink-0'>
                        {item.type === 'quiz' && item.score !== undefined && (
                          <div className='text-right'>
                            <span className='text-sm font-bold text-emerald-600'>{item.score}%</span>
                            <span className='block text-[10px] text-slate-400'>Score</span>
                          </div>
                        )}
                        <button className='w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 group-hover:bg-blue-600 group-hover:text-white text-slate-500 transition-all'>
                          <ArrowUpRight className='w-4 h-4' />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='text-center py-10 border border-dashed border-slate-200 rounded-xl bg-slate-50/50'>
                  <Layers className='w-10 h-10 text-slate-400 mx-auto mb-2' />
                  <p className='text-sm font-bold text-slate-800'>No study materials found</p>
                  <p className='text-xs text-slate-500 mt-0.5 mb-4'>Upload a lecture note or textbook to start learning.</p>
                  <button
                    onClick={() => navigate('/documents')}
                    className='inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs shadow-md hover:bg-blue-500 cursor-pointer'
                  >
                    <Plus className='w-3.5 h-3.5' /> Upload First Document
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Right Column (Mastery, Consistency & Fast Actions) */}
          <div className='space-y-6'>

            {/* Quiz Performance Gauge */}
            <div className='bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs'>
              <div className='flex items-center justify-between mb-4'>
                <div>
                  <h3 className='text-base font-bold text-slate-900'>Mastery & Retention</h3>
                  <p className='text-xs text-slate-500 mt-0.5'>Overall comprehension rate</p>
                </div>
                <span className='p-2 rounded-xl bg-emerald-50 text-emerald-600'>
                  <BrainCircuit className='w-4 h-4' />
                </span>
              </div>

              <div className='flex items-center justify-center my-4'>
                <MasteryRing percentage={overview.averageScore} size={140} strokeWidth={11} />
              </div>

              <div className='grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs'>
                <div className='p-2.5 rounded-xl bg-slate-50 text-center'>
                  <span className='block text-slate-400 text-[10px] uppercase font-bold'>Completed</span>
                  <span className='text-base font-extrabold text-slate-800'>{overview.completedQuizzes} Quizzes</span>
                </div>
                <div className='p-2.5 rounded-xl bg-slate-50 text-center'>
                  <span className='block text-slate-400 text-[10px] uppercase font-bold'>Starred Rate</span>
                  <span className='text-base font-extrabold text-amber-600'>{starredPercentage}% Cards</span>
                </div>
              </div>
            </div>

            {/* 7-Day Consistency Tracker Card */}
            <div className='bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs'>
              <div className='flex items-center justify-between mb-3'>
                <div className='flex items-center gap-2'>
                  <span className='w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold'>
                    <Flame className='w-4 h-4 fill-current' />
                  </span>
                  <div>
                    <h3 className='text-sm font-bold text-slate-900'>Weekly Consistency</h3>
                    <p className='text-[11px] text-slate-500'>{overview.studyStreak} day streak active</p>
                  </div>
                </div>
                <span className='text-xs font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full'>
                  {overview.studyStreak} Days
                </span>
              </div>

              {/* 7 Day Dots */}
              <div className='flex items-center justify-between gap-1 py-3 px-2 bg-slate-50/80 rounded-xl my-3'>
                {daysOfWeek.map((day, idx) => {
                  const isActive = idx <= currentDayIndex && overview.studyStreak > 0;
                  return (
                    <div key={idx} className='flex flex-col items-center gap-1.5'>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-slate-200 text-slate-500'
                      }`}>
                        {isActive ? '✓' : day}
                      </div>
                      <span className='text-[10px] font-semibold text-slate-400'>{day}</span>
                    </div>
                  );
                })}
              </div>
              <p className='text-xs text-slate-500 text-center'>
                Study at least 10 minutes today to maintain your learning streak!
              </p>
            </div>

            {/* Quick Actions Card */}
            <div className='bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs'>
              <div className='flex items-center gap-2 mb-4'>
                <Sparkles className='w-4 h-4 text-blue-600' />
                <h3 className='text-sm font-bold text-slate-900'>Quick Study Actions</h3>
              </div>

              <div className='space-y-2.5'>
                <button
                  onClick={() => navigate('/documents')}
                  className='w-full flex items-center justify-between p-3 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 text-white font-semibold text-xs shadow-md shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 transition-all cursor-pointer'
                >
                  <div className='flex items-center gap-2.5'>
                    <Plus className='w-4 h-4' />
                    <span>Upload New PDF / Notes</span>
                  </div>
                  <ChevronRight className='w-4 h-4' />
                </button>

                <button
                  onClick={() => navigate('/flashcards')}
                  className='w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/40 text-slate-800 font-semibold text-xs transition-all cursor-pointer bg-white'
                >
                  <div className='flex items-center gap-2.5'>
                    <BookOpen className='w-4 h-4 text-purple-600' />
                    <span>Review Flashcards ({overview.totalFlashcards})</span>
                  </div>
                  <ChevronRight className='w-4 h-4 text-slate-400' />
                </button>

                <button
                  onClick={() => navigate('/documents')}
                  className='w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 text-slate-800 font-semibold text-xs transition-all cursor-pointer bg-white'
                >
                  <div className='flex items-center gap-2.5'>
                    <BrainCircuit className='w-4 h-4 text-emerald-600' />
                    <span>Practice AI Quiz</span>
                  </div>
                  <ChevronRight className='w-4 h-4 text-slate-400' />
                </button>

                {overview.starredFlashcards > 0 && (
                  <button
                    onClick={() => navigate('/flashcards')}
                    className='w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/40 text-slate-800 font-semibold text-xs transition-all cursor-pointer bg-white'
                  >
                    <div className='flex items-center gap-2.5'>
                      <Star className='w-4 h-4 text-amber-500 fill-current' />
                      <span>Review Starred Cards ({overview.starredFlashcards})</span>
                    </div>
                    <ChevronRight className='w-4 h-4 text-slate-400' />
                  </button>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default DashboardPage;