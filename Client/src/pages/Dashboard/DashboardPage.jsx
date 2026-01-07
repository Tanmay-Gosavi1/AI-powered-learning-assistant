import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import progressService from '../../service/progressService.js';
import { toast } from 'react-hot-toast';
import { 
  Clock, TrendingUp, FileText, BookOpen, BrainCircuit, 
  Star, CheckCircle, Flame, ArrowUpRight, 
  Plus, ChevronRight, Sparkles, BarChart3,
  Award, Zap
} from 'lucide-react';
import Spinner from '../../components/common/Spinner.jsx';

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
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
        <div className='flex flex-col items-center justify-center'>
          <div className='flex items-center justify-center w-16 h-16 bg-slate-100 rounded-2xl mb-4'>
            <TrendingUp className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-600 text-sm text-center">No dashboard data available.</p>
        </div>
      </div>
    );
  }

  const { overview, recentActivity } = dashboardData;

  // Calculate percentages for charts
  const quizCompletionRate = overview.totalQuizzes > 0 
    ? Math.round((overview.completedQuizzes / overview.totalQuizzes) * 100) 
    : 0;

  const starredPercentage = overview.totalFlashcards > 0
    ? Math.round((overview.starredFlashcards / overview.totalFlashcards) * 100)
    : 0;

  const formatTimestamp = (ts) => {
    if (!ts) return '—';
    const d = new Date(ts);
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Circular Progress Component
  const CircularProgress = ({ percentage, size = 120, strokeWidth = 10, color = 'blue' }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;
    
    const colorClasses = {
      blue: { stroke: 'stroke-blue-500', text: 'text-blue-600', bg: 'stroke-blue-100' },
      purple: { stroke: 'stroke-purple-500', text: 'text-purple-600', bg: 'stroke-purple-100' },
      emerald: { stroke: 'stroke-emerald-500', text: 'text-emerald-600', bg: 'stroke-emerald-100' },
      amber: { stroke: 'stroke-amber-500', text: 'text-amber-600', bg: 'stroke-amber-100' },
    };

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            className={colorClasses[color].bg}
            strokeWidth={strokeWidth}
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          <circle
            className={`${colorClasses[color].stroke} transition-all duration-1000 ease-out`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: offset,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-2xl font-bold ${colorClasses[color].text}`}>{percentage}%</span>
        </div>
      </div>
    );
  };

  return (
    <div className='min-h-screen pb-8'>
      {/* Background Pattern */}
      <div className='absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] opacity-30 pointer-events-none' />
      
      <div className='max-w-7xl mx-auto relative'>
        {/* Header */}
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight text-slate-900 mb-1'>
              Dashboard
            </h1>
            <p className='text-slate-500 text-sm'>
              Track your learning progress and activity
            </p>
          </div>
          <div className='flex items-center gap-3'>
            <button
              onClick={() => navigate('/documents')}
              className='flex items-center gap-2 px-4 py-2.5 cursor-pointer bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm'
            >
              <FileText className='w-4 h-4' />
              Documents
            </button>
            <button
              onClick={() => navigate('/documents')}
              className='flex items-center gap-2 px-4 py-2.5 cursor-pointer btn-primary text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200'
            >
              <Plus className='w-4 h-4' />
              Upload New
            </button>
          </div>
        </div>

        {/* Top Stats Row */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
          {/* Documents */}
          <div className='group relative card-base card-hover hover-glow p-5 overflow-hidden'>
            <div className='absolute top-0 right-0 w-20 h-20 bg-linear-to-br from-blue-400/10 to-cyan-400/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2' />
            <div className='relative'>
              <div className='flex items-center justify-between mb-3'>
                <span className='text-xs font-semibold text-slate-500 uppercase tracking-wide'>Documents</span>
                <div className='w-9 h-9 rounded-lg bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30'>
                  <FileText className='w-4 h-4 text-white' />
                </div>
              </div>
              <div className='text-3xl font-bold text-slate-900'>{overview.totalDocuments}</div>
              <p className='text-xs text-slate-500 mt-1'>Total uploaded</p>
            </div>
          </div>

          {/* Flashcard Sets */}
          <div className='group relative card-base card-hover hover-glow p-5 overflow-hidden'>
            <div className='absolute top-0 right-0 w-20 h-20 bg-linear-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2' />
            <div className='relative'>
              <div className='flex items-center justify-between mb-3'>
                <span className='text-xs font-semibold text-slate-500 uppercase tracking-wide'>Flashcard Sets</span>
                <div className='w-9 h-9 rounded-lg bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30'>
                  <BookOpen className='w-4 h-4 text-white' />
                </div>
              </div>
              <div className='text-3xl font-bold text-slate-900'>{overview.totalFlashcardSets}</div>
              <p className='text-xs text-slate-500 mt-1'>{overview.totalFlashcards} total cards</p>
            </div>
          </div>

          {/* Quizzes */}
          <div className='group relative card-base card-hover hover-glow p-5 overflow-hidden'>
            <div className='absolute top-0 right-0 w-20 h-20 bg-linear-to-br from-emerald-400/10 to-teal-400/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2' />
            <div className='relative'>
              <div className='flex items-center justify-between mb-3'>
                <span className='text-xs font-semibold text-slate-500 uppercase tracking-wide'>Quizzes</span>
                <div className='w-9 h-9 rounded-lg bg-linear-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30'>
                  <BrainCircuit className='w-4 h-4 text-white' />
                </div>
              </div>
              <div className='text-3xl font-bold text-slate-900'>{overview.totalQuizzes}</div>
              <p className='text-xs text-slate-500 mt-1'>{overview.completedQuizzes} completed</p>
            </div>
          </div>

          {/* Study Streak */}
          <div className='group relative card-base card-hover hover-glow p-5 overflow-hidden'>
            <div className='absolute top-0 right-0 w-20 h-20 bg-linear-to-br from-amber-400/10 to-orange-400/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2' />
            <div className='relative'>
              <div className='flex items-center justify-between mb-3'>
                <span className='text-xs font-semibold text-slate-500 uppercase tracking-wide'>Study Streak</span>
                <div className='w-9 h-9 rounded-lg bg-linear-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30'>
                  <Flame className='w-4 h-4 text-white' />
                </div>
              </div>
              <div className='text-3xl font-bold text-slate-900'>{overview.studyStreak}</div>
              <p className='text-xs text-slate-500 mt-1'>days in a row</p>
            </div>
          </div>
        </div>

        {/* Second Row - Charts & Progress */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6'>
          {/* Starred Cards Overview */}
          <div className='card-base p-6'>
            <div className='flex items-center justify-between mb-6'>
              <div>
                <h3 className='text-base font-semibold text-slate-900'>Starred Cards</h3>
                <p className='text-xs text-slate-500 mt-0.5'>Important cards to focus on</p>
              </div>
              <div className='flex items-center gap-1 px-2.5 py-1 bg-amber-50 rounded-lg'>
                <Star className='w-3.5 h-3.5 text-amber-600' fill='currentColor' />
                <span className='text-xs font-semibold text-amber-700'>{overview.starredFlashcards}</span>
              </div>
            </div>
            <div className='flex items-center justify-center'>
              <CircularProgress percentage={starredPercentage} color="amber" />
            </div>
            <div className='flex items-center justify-center gap-6 mt-6'>
              <div className='flex items-center gap-2'>
                <div className='w-3 h-3 rounded-full bg-amber-500' />
                <span className='text-xs text-slate-600'>Starred ({overview.starredFlashcards})</span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='w-3 h-3 rounded-full bg-amber-100' />
                <span className='text-xs text-slate-600'>Regular ({overview.totalFlashcards - overview.starredFlashcards})</span>
              </div>
            </div>
          </div>

          {/* Quiz Performance */}
          <div className='card-base p-6'>
            <div className='flex items-center justify-between mb-6'>
              <div>
                <h3 className='text-base font-semibold text-slate-900'>Quiz Performance</h3>
                <p className='text-xs text-slate-500 mt-0.5'>Average score across quizzes</p>
              </div>
              <div className='flex items-center gap-1 px-2.5 py-1 bg-emerald-50 rounded-lg'>
                <Award className='w-3.5 h-3.5 text-emerald-600' />
                <span className='text-xs font-semibold text-emerald-700'>Avg {overview.averageScore}%</span>
              </div>
            </div>
            <div className='flex items-center justify-center'>
              <CircularProgress percentage={overview.averageScore} color="emerald" />
            </div>
            <div className='flex items-center justify-center gap-6 mt-6'>
              <div className='flex items-center gap-2'>
                <div className='w-3 h-3 rounded-full bg-emerald-500' />
                <span className='text-xs text-slate-600'>Correct answers</span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='w-3 h-3 rounded-full bg-emerald-100' />
                <span className='text-xs text-slate-600'>Incorrect</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className='card-base p-6'>
            <div className='flex items-center justify-between mb-6'>
              <div>
                <h3 className='text-base font-semibold text-slate-900'>Quick Stats</h3>
                <p className='text-xs text-slate-500 mt-0.5'>Your learning highlights</p>
              </div>
              <BarChart3 className='w-5 h-5 text-slate-400' />
            </div>
            <div className='space-y-4'>
              {/* Starred Flashcards */}
              <div className='flex items-center justify-between p-3 bg-amber-50/50 border border-amber-100 rounded-xl'>
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 rounded-lg bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-amber-500/20'>
                    <Star className='w-5 h-5 text-white' fill='currentColor' />
                  </div>
                  <div>
                    <p className='text-sm font-semibold text-slate-900'>Starred Cards</p>
                    <p className='text-xs text-slate-500'>Important to review</p>
                  </div>
                </div>
                <span className='text-2xl font-bold text-amber-600'>{overview.starredFlashcards}</span>
              </div>

              {/* Completed Quizzes */}
              <div className='flex items-center justify-between p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl'>
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 rounded-lg bg-linear-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/20'>
                    <CheckCircle className='w-5 h-5 text-white' />
                  </div>
                  <div>
                    <p className='text-sm font-semibold text-slate-900'>Quizzes Done</p>
                    <p className='text-xs text-slate-500'>Completion rate: {quizCompletionRate}%</p>
                  </div>
                </div>
                <span className='text-2xl font-bold text-emerald-600'>{overview.completedQuizzes}</span>
              </div>

              {/* Total Cards Reviewed */}
              <div className='flex items-center justify-between p-3 bg-blue-50/50 border border-blue-100 rounded-xl'>
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 rounded-lg bg-linear-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/20'>
                    <Zap className='w-5 h-5 text-white' />
                  </div>
                  <div>
                    <p className='text-sm font-semibold text-slate-900'>Total Cards</p>
                    <p className='text-xs text-slate-500'>Across all sets</p>
                  </div>
                </div>
                <span className='text-2xl font-bold text-blue-600'>{overview.totalFlashcards}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Third Row - Recent Activity & Quick Actions */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Recent Activity */}
          <div className='lg:col-span-2 card-base p-6'>
            <div className='flex items-center justify-between mb-6'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-linear-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center'>
                  <Clock className='w-5 h-5 text-slate-600' />
                </div>
                <div>
                  <h3 className='text-base font-semibold text-slate-900'>Recent Activity</h3>
                  <p className='text-xs text-slate-500'>Your latest learning sessions</p>
                </div>
              </div>
              <button onClick={()=>navigate('/documents')} className='text-xs cursor-pointer font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1'>
                View All <ChevronRight className='w-4 h-4' />
              </button>
            </div>

            {recentActivity && (recentActivity.documents?.length > 0 || recentActivity.quizzes?.length > 0) ? (
              <div className='space-y-3'>
                {[
                  ...(recentActivity.documents || []).map((doc) => ({
                    id: doc._id,
                    title: doc.title,
                    type: 'document',
                    timestamp: doc.lastAccessed || doc.updatedAt || doc.createdAt,
                    link: `/documents/${doc._id}`,
                    status: doc.status
                  })),
                  ...(recentActivity.quizzes || []).map((quiz) => ({
                    id: quiz._id,
                    title: quiz.title || quiz.documentId?.title,
                    type: 'quiz',
                    timestamp: quiz.completedAt || quiz.updatedAt || quiz.createdAt,
                    link: `/quizzes/${quiz._id}`,
                    score: quiz.score,
                    total: quiz.totalQuestions
                  }))
                ]
                  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                  .slice(0, 5)
                  .map((activity, idx) => (
                    <div
                      key={activity.id || idx}
                      onClick={() => navigate(activity.link)}
                      className='group flex items-center justify-between rounded-xl p-4 bg-slate-50/50 border border-slate-200/60 hover:bg-white hover:border-slate-300/60 hover:shadow-md transition-all duration-300 cursor-pointer'
                    >
                      <div className='flex items-center gap-4'>
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          activity.type === 'document' 
                            ? 'bg-linear-to-br from-blue-100 to-blue-50' 
                            : 'bg-linear-to-br from-emerald-100 to-emerald-50'
                        }`}>
                          {activity.type === 'document' ? (
                            <FileText className='w-5 h-5 text-blue-600' />
                          ) : (
                            <BrainCircuit className='w-5 h-5 text-emerald-600' />
                          )}
                        </div>
                        <div>
                          <p className='text-sm font-medium text-slate-900 group-hover:text-blue-900 transition-colors'>
                            {activity.title}
                          </p>
                          <div className='flex items-center gap-2 mt-0.5'>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              activity.type === 'document'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              {activity.type === 'document' ? 'Document' : 'Quiz'}
                            </span>
                            <span className='text-xs text-slate-500'>{formatTimestamp(activity.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center gap-3'>
                        {activity.type === 'quiz' && activity.score !== undefined && (
                          <div className='text-right'>
                            <p className='text-sm font-bold text-emerald-600'>{activity.score}%</p>
                            <p className='text-xs text-slate-500'>Score</p>
                          </div>
                        )}
                        <ArrowUpRight className='w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all' />
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className='text-center py-12'>
                <div className='inline-flex items-center justify-center w-16 h-16 bg-slate-100 mb-4 rounded-2xl'>
                  <Clock className='w-8 h-8 text-slate-400' />
                </div>
                <p className='text-sm text-slate-600 font-medium'>No recent activity yet.</p>
                <p className='mt-1 text-xs text-slate-500'>Start learning to see your progress here!</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className='card-base p-6'>
            <div className='flex items-center gap-3 mb-6'>
              <div className='w-10 h-10 bg-linear-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center'>
                <Sparkles className='w-5 h-5 text-blue-600' />
              </div>
              <div>
                <h3 className='text-base font-semibold text-slate-900'>Quick Actions</h3>
                <p className='text-xs text-slate-500'>Jump right in</p>
              </div>
            </div>

            <div className='space-y-3'>
              <button
                onClick={() => navigate('/documents')}
                className='w-full flex items-center gap-4 p-4 rounded-xl bg-linear-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 group cursor-pointer'
              >
                <div className='w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center'>
                  <Plus className='w-5 h-5' />
                </div>
                <div className='text-left flex-1'>
                  <p className='text-sm font-semibold'>Upload Document</p>
                  <p className='text-xs text-blue-100'>Add new study material</p>
                </div>
                <ChevronRight className='w-5 h-5 group-hover:translate-x-1 transition-transform' />
              </button>

              <button
                onClick={() => navigate('/flashcards')}
                className='w-full flex items-center gap-4 p-4 rounded-xl bg-white border-2 border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all duration-300 group cursor-pointer'
              >
                <div className='w-10 h-10 rounded-lg bg-linear-to-br from-purple-100 to-pink-100 flex items-center justify-center'>
                  <BookOpen className='w-5 h-5 text-purple-600' />
                </div>
                <div className='text-left flex-1'>
                  <p className='text-sm font-semibold text-slate-900'>Study Flashcards</p>
                  <p className='text-xs text-slate-500'>{overview.totalFlashcards} cards available</p>
                </div>
                <ChevronRight className='w-5 h-5 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all' />
              </button>

              <button
                onClick={() => navigate('/documents')}
                className='w-full flex items-center gap-4 p-4 rounded-xl bg-white border-2 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all duration-300 group cursor-pointer'
              >
                <div className='w-10 h-10 rounded-lg bg-linear-to-br from-emerald-100 to-teal-100 flex items-center justify-center'>
                  <BrainCircuit className='w-5 h-5 text-emerald-600' />
                </div>
                <div className='text-left flex-1'>
                  <p className='text-sm font-semibold text-slate-900'>Take a Quiz</p>
                  <p className='text-xs text-slate-500'>Test your knowledge</p>
                </div>
                <ChevronRight className='w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all' />
              </button>

              {overview.starredFlashcards > 0 && (
                <button
                  onClick={() => navigate('/flashcards')}
                  className='w-full flex items-center gap-4 p-4 rounded-xl bg-white border-2 border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 transition-all duration-300 group cursor-pointer'
                >
                  <div className='w-10 h-10 rounded-lg bg-linear-to-br from-amber-100 to-orange-100 flex items-center justify-center'>
                    <Star className='w-5 h-5 text-amber-600' fill='currentColor' />
                  </div>
                  <div className='text-left flex-1'>
                    <p className='text-sm font-semibold text-slate-900'>Review Starred</p>
                    <p className='text-xs text-slate-500'>{overview.starredFlashcards} cards marked</p>
                  </div>
                  <ChevronRight className='w-5 h-5 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all' />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;