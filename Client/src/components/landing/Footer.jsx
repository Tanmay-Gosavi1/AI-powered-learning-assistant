import React from 'react'
import { Twitter, Linkedin, Github, BrainCircuit, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'

const FooterLink = ({ href, to, children }) => {
  const className = 'text-slate-400 hover:text-white text-sm transition-colors duration-200 block'
  if (to) {
    return <Link to={to} className={className}>{children}</Link>
  }
  return <a href={href} className={className}>{children}</a>
}

const SocialLink = ({ href, children }) => {
  return (
    <a
      href={href || '#'}
      className="w-9 h-9 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200 flex justify-center items-center text-slate-400 hover:text-white shadow-sm"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  )
}

const Footer = () => {
  return (
    <footer className="bg-[#05080F] text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-linear-to-br from-blue-500 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <BrainCircuit className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Prep<span className="text-blue-400">Mate</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm font-normal">
              Empowering students worldwide to study smarter with AI-driven flashcards, adaptive practice quizzes, and instant conceptual breakdown.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-2">
              <span>Made with</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-current inline" />
              <span>for learners everywhere</span>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">Product</h4>
            <ul className="space-y-2.5">
              <li>
                <FooterLink href="#features">Features</FooterLink>
              </li>
              <li>
                <FooterLink href="#workflow">How It Works</FooterLink>
              </li>
              <li>
                <FooterLink href="#testimonials">Testimonials</FooterLink>
              </li>
              <li>
                <FooterLink href="#faqs">FAQs</FooterLink>
              </li>
            </ul>
          </div>

          {/* Quick Access */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">Study Tools</h4>
            <ul className="space-y-2.5">
              <li>
                <FooterLink to="/documents">Upload Materials</FooterLink>
              </li>
              <li>
                <FooterLink to="/flashcards">Smart Flashcards</FooterLink>
              </li>
              <li>
                <FooterLink to="/dashboard">Practice Quizzes</FooterLink>
              </li>
              <li>
                <FooterLink to="/dashboard">Learning Analytics</FooterLink>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">Account</h4>
            <ul className="space-y-2.5">
              <li>
                <FooterLink to="/login">Sign In</FooterLink>
              </li>
              <li>
                <FooterLink to="/signup">Create Free Account</FooterLink>
              </li>
              <li>
                <FooterLink to="/profile">Student Profile</FooterLink>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/[0.08] pt-8 mt-14 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-xs font-normal">
            &copy; {new Date().getFullYear()} PrepMate AI. All rights reserved.
          </p>
          <div className="flex items-center space-x-3">
            <SocialLink href="https://twitter.com">
              <Twitter className="w-4 h-4" />
            </SocialLink>
            <SocialLink href="https://linkedin.com">
              <Linkedin className="w-4 h-4" />
            </SocialLink>
            <SocialLink href="https://github.com/Tanmay-Gosavi1/AI-powered-learning-assistant">
              <Github className="w-4 h-4" />
            </SocialLink>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer