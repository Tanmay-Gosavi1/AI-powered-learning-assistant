import React from 'react'
import { ChevronDown, User, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const ProfileDropdown = ({ isOpen, onToggle, avatar, companyName, email, onLogout }) => {
  const navigate = useNavigate()

  return (
    <div className="relative">
      <button
        className="flex items-center space-x-2.5 p-1.5 sm:px-3 sm:py-2 hover:cursor-pointer bg-[#0a0f1c] hover:bg-[#121829] border border-white/10 hover:border-white/20 rounded-xl transition-all shadow-xs"
        onClick={onToggle}
        aria-label="User menu"
      >
        {avatar ? (
          <img src={avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-white/15" />
        ) : (
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
            <span>{companyName ? companyName.charAt(0).toUpperCase() : 'U'}</span>
          </div>
        )}
        <div className="hidden sm:block text-left">
          <p className="text-xs font-bold capitalize text-white leading-tight">{companyName || 'Student'}</p>
          <p className="text-[10px] text-slate-400 leading-tight truncate max-w-[120px]">{email}</p>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-300 ml-0.5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-60 bg-[#0d1322]/98 backdrop-blur-xl border border-white/10 p-1.5 shadow-2xl shadow-black/60 rounded-2xl z-50 overflow-hidden">
          <div className="px-3.5 py-3 border-b border-white/10 mb-1">
            <p className="text-xs font-bold capitalize text-white">{companyName || 'Student'}</p>
            <p className="text-[11px] text-slate-400 truncate">{email}</p>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => navigate('/profile')}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded-xl cursor-pointer transition-colors text-left"
            >
              <User className="w-4 h-4 text-slate-400" />
              <span>View Profile</span>
            </button>

            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl cursor-pointer transition-colors text-left"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfileDropdown
