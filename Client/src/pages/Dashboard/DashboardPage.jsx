import { useState , useEffect } from 'react';
import progressService from '../../service/progressService.js'
import { toast } from 'react-hot-toast';
import { Clock, TrendingUp, FileText, BookOpen, BrainCircuit } from 'lucide-react';
import Spinner from '../../components/common/Spinner.jsx'

const DashboardPage = () => {
  const [dashboardData , setDashboardData] = useState(null);
  const [loading , setLoading] = useState(false);

  useEffect(()=>{
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await progressService.getDashboard();
        console.log("Dashboard data : " , data);
        setDashboardData(data);
      } catch (error) {
        toast.error("Failed to fetch dashboard data");
        console.error("Dashboard fetch error:", error);
      } 
      finally{
        setLoading(false);
      }
    }
    fetchDashboardData();
  },[])

  if(loading){
    return (
      <div className='min-h-[85vh] flex items-center justify-center'>
        <Spinner label='Loading dashboard' />
      </div>
    )
  }
  if(!dashboardData || !dashboardData.overview){
    return (
      <div className='min-h-[85vh] bg-linear-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center'>
        <div className='flex flex-col items-center justify-center'>
          <div className='flex items-center justify-center w-16 h-16 bg-slate-100 rounded-2xl mb-4'>
            <TrendingUp className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-600 text-sm text-center">No dashboard data available.</p>
        </div>
      </div>
    )
  }

  const stats = [
    {
      label: 'Total Documents',
      value: dashboardData.overview.totalDocuments,
      icon: FileText,
      gradient: 'from-blue-400 to-cyan-500',
      shadowColor: 'shadow-blue-500/25',
    },
    {
      label: 'Total Flashcards',
      value: dashboardData.overview.totalFlashcards,
      icon: BookOpen,
      gradient: 'from-purple-400 to-pink-500',
      shadowColor: 'shadow-purple-500/25',
    },
    {
      label: 'Total Quizzes',
      value: dashboardData.overview.totalQuizzes,
      icon: BrainCircuit,
      gradient: 'from-blue-500 to-blue-400',
      shadowColor: 'shadow-primary-25',
    },
  ];

  const formatTimestamp = (ts) => {
    if (!ts) return '—';
    const d = new Date(ts);
    return isNaN(d.getTime()) ? '—' : d.toLocaleString();
  };


  return (
    <div className='min-h-screen'>
      <div className='absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] opacity-30 pointer-events-none' />
      <div className='max-w-7xl mx-auto relative'>
        {/* Header */}
        <div className='mb-6'>
          <h1 className='text-2xl font-semibold tracking-tight text-slate-900 mb-2'>
            Dashboard
          </h1>
          <p className='text-slate-500 text-sm'>
            Track your learning progress and activity 
          </p>
        </div>

        {/* Stats */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-5'>
          {stats.map((stat , idx)=>(
            <div key={idx} className='group relative bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow shadow-slate-200/60 p-6 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1'>
              <div className='flex items-center justify-between mb-4'>
                 <span className='text-xs font-semibold text-slate-700 uppercase tracking-wide'>
                  {stat.label}
                 </span>
                 <div className={`w-11 h-11 rounded-xl bg-linear-to-br ${stat.gradient} shadow-lg ${stat.shadowColor} flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}>
                  <stat.icon className="w-5 h-5 text-white font-bold" />
                 </div>
              </div>
              <div className='text-3xl font-semibold text-slate-900 tracking-tight'>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Recent activity Section */}
        <div className='bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow shadow-slate-200/60 p-6 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='w-10 h-10 bg-linear-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center'>
              <Clock className='w-5 h-5 text-slate-600'/>
            </div>
            <h2 className='text-xl font-medium text-slate-900 tracking-tight'>Recent Activity</h2>
          </div>
          
          {dashboardData.recentActivity && (dashboardData.recentActivity.documents.length > 0 || dashboardData.recentActivity.quizzes.length > 0) ? (
            <div className='space-y-3'>
              {[
                ...(dashboardData.recentActivity.documents || []).map((doc) => ({
                  id : doc._id,
                  description : doc.title,
                  type : 'document',
                  timestamp : doc.lastAccessed || doc.updatedAt || doc.createdAt || doc.uploadedAt,
                  link : `/documents/${doc._id}`
                })),
                ...(dashboardData.recentActivity.quizzes || []).map((quiz) => ({
                  id : quiz._id,
                  description : quiz.title,
                  type : 'quiz',
                  timestamp : quiz.completedAt || quiz.updatedAt || quiz.createdAt,
                  link : `/quiz/${quiz._id}`
                }))
              ]
              .sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp))
              .map((activity , item)=>(
                <div
                  key={activity.id || item}
                  className='group flex items-center justify-between rounded-xl p-4 bg-slate-50/50 border border-slate-200/60 hover:bg-white hover:border-slate-300/60 hover:shadow-md transition-all duration-300'>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            activity.type === 'document'
                              ? 'bg-linear-to-r from-blue-500 to-blue-400'
                              : 'bg-linear-to-r from-blue-500 to-blue-400'
                          }`}
                        />
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {activity.type === 'document'
                            ? 'Accessed Document: '
                            : 'Attempted Quiz: '}
                          <span className="text-slate-700">{activity.description}</span>
                        </p>
                      </div>

                      <p className="text-xs text-slate-500 pl-4">{formatTimestamp(activity.timestamp)}</p>
                    </div>

                    {activity.link && (
                      <a
                        href={activity.link}
                        className="ml-4 px-4 py-2 text-xs font-semibold text-blue-900 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-300 whitespace-nowrap"
                      >
                        View
                      </a>
                    )}
                </div>
              ))}
            </div>
            ): (
              <div className='text-center py-12 text-sm text-slate-500'>
                <div className='inline-flex items-center justify-center w-16 h-16 bg-slate-100 mb-4 rounded-2xl'>
                  <Clock className='w-8 h-8 text-slate-400'/>
                </div>
                <p className='text-sm text-slate-600 font-medium'>
                  No recent activity yet.
                </p>
                <p className='mt-2 text-xs text-slate-500'>
                  Start learning to see your progress here!
                </p>
              </div>
            )}
        </div>

      </div>
    </div>
  )
}

export default DashboardPage