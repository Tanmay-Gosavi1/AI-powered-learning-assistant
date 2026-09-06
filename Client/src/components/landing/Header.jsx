import React from 'react'
import { useState, useEffect } from 'react'
import { BrainCircuit, X, Menu, ArrowRight } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import ProfileDropdown from '../layout/ProfileDropdown.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isViewProfileOpen, setIsViewProfileOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#070B14]/90 backdrop-blur-md border-b border-white/10 shadow-2xl shadow-black/40'
          : 'bg-[#070B14]/60 backdrop-blur-sm border-b border-white/5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo */}
          <div
            className="flex items-center space-x-2.5 cursor-pointer group"
            onClick={() => navigate('/')}
          >
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-blue-500 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform duration-200">
              <BrainCircuit className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              Prep<span className="text-blue-400">Mate</span>
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 p-1 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm">
            <a
              href="#features"
              className="px-4 py-1.5 text-sm font-medium text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition-all duration-200"
            >
              Features
            </a>
            <a
              href="#workflow"
              className="px-4 py-1.5 text-sm font-medium text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition-all duration-200"
            >
              How It Works
            </a>
            <a
              href="#testimonials"
              className="px-4 py-1.5 text-sm font-medium text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition-all duration-200"
            >
              Testimonials
            </a>
            <a
              href="#faqs"
              className="px-4 py-1.5 text-sm font-medium text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition-all duration-200"
            >
              FAQs
            </a>
          </nav>

          {/* Login / Signup or Profile */}
          <div className="hidden lg:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/dashboard"
                  className="px-4 py-2 text-sm font-medium text-slate-200 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
                <ProfileDropdown
                  isOpen={isViewProfileOpen}
                  onToggle={(e) => {
                    e.stopPropagation()
                    setIsViewProfileOpen(!isViewProfileOpen)
                  }}
                  avatar={user?.avatar || ''}
                  companyName={user?.name || ''}
                  email={user?.email || ''}
                  onLogout={logout}
                />
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-300 hover:text-white px-3 py-2 transition-colors duration-200"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center gap-1.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <button
              className="p-2 rounded-xl text-slate-300 hover:text-white bg-white/5 border border-white/10 cursor-pointer transition-colors duration-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle Navigation"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="lg:hidden bg-[#070B14]/98 backdrop-blur-xl border-b border-white/10 px-4 pt-3 pb-6 space-y-3">
          <div className="flex flex-col space-y-1">
            <a
              href="#features"
              onClick={() => setIsMenuOpen(false)}
              className="px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/10 rounded-xl transition-colors"
            >
              Features
            </a>
            <a
              href="#workflow"
              onClick={() => setIsMenuOpen(false)}
              className="px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/10 rounded-xl transition-colors"
            >
              How It Works
            </a>
            <a
              href="#testimonials"
              onClick={() => setIsMenuOpen(false)}
              className="px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/10 rounded-xl transition-colors"
            >
              Testimonials
            </a>
            <a
              href="#faqs"
              onClick={() => setIsMenuOpen(false)}
              className="px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/10 rounded-xl transition-colors"
            >
              FAQs
            </a>
          </div>

          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                onClick={() => setIsMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl font-semibold text-sm bg-blue-600 text-white shadow-lg shadow-blue-500/25"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-white/5 border border-white/10"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl text-sm font-semibold bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Header