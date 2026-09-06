import React from 'react'
import { useState, useEffect } from 'react'
import { Menu, X, LogOut, Bell, BrainCircuit, Search, Flame, Sparkles } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import ProfileDropdown from './ProfileDropdown.jsx'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { NAVIGATION_MENU } from '../../utils/data.js'

const NavItem = ({ item, isActive, onClick, isCollapsed }) => {
  const Icon = item.icon
  return (
    <button
      onClick={() => onClick(item.id)}
      className={`group relative w-full flex items-center px-3.5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer ${
        isActive
          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <Icon
        className={`h-4.5 w-4.5 shrink-0 ${
          isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'
        }`}
      />

      {!isCollapsed && <span className="ml-3 truncate">{item.name}</span>}
    </button>
  )
}

const DashboardLayout = ({ children, activeMenu }) => {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const location = useLocation()

  const getActiveFromPath = (path) => {
    const segments = path.split('/').filter(Boolean)
    const first = segments[0] || 'dashboard'
    if (first === 'dashboard') return 'dashboard'
    if (first === 'documents') return 'documents'
    if (first === 'flashcards') return 'flashcards'
    if (first === 'profile') return 'profile'
    return 'dashboard'
  }

  const [activeNavItem, setActiveNavItem] = useState(() => activeMenu || getActiveFromPath(location.pathname))

  const currentPath = getActiveFromPath(location.pathname)
  if (activeNavItem !== currentPath && !activeMenu) {
    setActiveNavItem(currentPath)
  }

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (!mobile) {
        setSidebarOpen(false)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const handleClickOutside = () => {
      if (profileDropdownOpen) {
        setProfileDropdownOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [profileDropdownOpen])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const sidebarCollapsed = !isMobile && false

  const handleNavigation = (itemId) => {
    setActiveNavItem(itemId)
    navigate(`/${itemId}`)
    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  return (
    <div className="flex h-screen bg-slate-50/80">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 flex flex-col bg-white border-r border-slate-200/80 shadow-xs ${
          isMobile ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'
        } ${sidebarCollapsed ? 'w-16' : 'w-64'}`}
      >
        {/* Brand Logo */}
        <div className="flex items-center px-6 border-b border-slate-100 h-16 shrink-0">
          <Link to="/" className="flex items-center space-x-2.5 outline-none group">
            <div className="w-8 h-8 bg-linear-to-br from-blue-500 via-indigo-600 to-cyan-400 rounded-xl flex justify-center items-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <BrainCircuit className="h-4.5 w-4.5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <span className="text-lg font-bold text-slate-900 tracking-tight">
                Prep<span className="text-blue-600">Mate</span>
              </span>
            )}
          </Link>
        </div>

        {/* Navigation Menu */}
        <div className="p-4 flex-1 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Study Menu
            </div>
            {NAVIGATION_MENU.map((item) => (
              <NavItem
                key={item.id}
                item={item}
                isActive={activeNavItem === item.id}
                onClick={() => handleNavigation(item.id)}
                isCollapsed={sidebarCollapsed}
              />
            ))}
          </div>

          {/* Student Pro Upgrade Card in Sidebar */}
          {!sidebarCollapsed && (
            <div className="mt-auto pt-4 space-y-3">
              <div className="p-3.5 rounded-2xl bg-linear-to-br from-slate-900 via-blue-950 to-indigo-950 text-white text-xs shadow-md">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold flex items-center gap-1.5 text-amber-300">
                    <Sparkles className="w-3.5 h-3.5" /> AI Study Booster
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/20 font-bold uppercase">Pro</span>
                </div>
                <p className="text-[11px] text-slate-300 mb-2.5">
                  Unlimited vector RAG retrieval and instant document quiz mode.
                </p>
                <button
                  onClick={() => navigate('/documents')}
                  className="w-full py-1.5 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-lg text-center transition-colors text-[11px] cursor-pointer"
                >
                  Upload More Docs
                </button>
              </div>

              {/* Logout Button */}
              <button
                className="w-full group cursor-pointer flex items-center px-3 py-2 text-sm font-semibold text-slate-600 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-colors"
                onClick={logout}
              >
                <LogOut className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-rose-600 transition-colors" />
                <span className="ml-3">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-40 backdrop-blur-xs"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Container */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 min-w-0 ${
          isMobile ? 'ml-0' : sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        {/* Top Navbar */}
        <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 h-16 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center space-x-3">
            {isMobile && (
              <button
                className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-600 cursor-pointer"
                onClick={toggleSidebar}
                aria-label="Open Navigation"
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            )}
            <div className="hidden sm:block">
              <span className="text-xs font-semibold text-slate-400">PrepMate AI Workspace</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Search Bar Pill */}
            <div className="relative hidden md:block">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                readOnly
                onClick={() => navigate('/documents')}
                placeholder="Search notes or decks..."
                className="pl-8 pr-3 py-1.5 bg-slate-100/80 hover:bg-slate-100 border border-slate-200/60 rounded-xl text-xs text-slate-700 w-48 lg:w-60 transition-all cursor-pointer"
              />
            </div>


            {/* Profile Dropdown */}
            <ProfileDropdown
              isOpen={profileDropdownOpen}
              onToggle={(e) => {
                e.stopPropagation()
                setProfileDropdownOpen(!profileDropdownOpen)
              }}
              avatar={user?.avatar || ''}
              companyName={user?.name || 'Student'}
              email={user?.email || ''}
              onLogout={logout}
            />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <div className="max-w-full">{children}</div>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout