import React, { useState } from 'react'
import { BrainCircuit, Mail, Lock, ArrowRight } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext.jsx'
import { toast } from 'react-hot-toast'
import authService from '../../service/authService.js'

const Login = () => {
  const { register, handleSubmit, formState: { errors: formErrors } } = useForm()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState(null)
  const navigate = useNavigate()
  const { login } = useAuth()

  const onSubmit = async (data) => {
    setLoading(true)
    setErrors(null)
    try {
      const response = await authService.login(data.email, data.password)
      const { token, data: userData } = response
      login(userData.user, token)
      toast.success("Logged in successfully")
      navigate("/dashboard")
    } catch (error) {
      const errMsg = error.message || "Failed to login, please check your credentials"
      setErrors(errMsg)
      toast.error(errMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex justify-center items-center p-4 relative saas-hero-bg text-white overflow-hidden">
      {/* Background Decorative Ambient Blooms */}
      <div className="absolute top-10 left-10 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-size-[24px_24px] opacity-[0.03] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Auth Card */}
        <div className="p-7 sm:p-9 rounded-2xl bg-[#0d1322]/90 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/80">
          {/* Brand & Heading */}
          <div className="flex flex-col items-center justify-center text-center mb-6">
            <Link to="/" className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-500 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 mb-4 hover:scale-105 transition-transform">
              <BrainCircuit className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">Sign in to continue your AI study journey</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1.5">
                Email Address
              </label>
              <div className="flex items-center p-3 bg-white/[0.04] border border-white/10 focus-within:border-blue-500/60 focus-within:ring-2 focus-within:ring-blue-500/20 rounded-xl gap-2.5 transition-all">
                <Mail className="text-slate-400 w-4 h-4 shrink-0" />
                <input
                  type="email"
                  placeholder="student@university.edu"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  className="w-full outline-none bg-transparent placeholder:text-slate-500 font-medium text-sm text-white"
                />
              </div>
              {formErrors.email && (
                <p className="text-xs text-rose-400 mt-1">{formErrors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Password
                </label>
              </div>
              <div className="flex items-center p-3 bg-white/[0.04] border border-white/10 focus-within:border-blue-500/60 focus-within:ring-2 focus-within:ring-blue-500/20 rounded-xl gap-2.5 transition-all">
                <Lock className="text-slate-400 w-4 h-4 shrink-0" />
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register('password', {
                    required: 'Password is required'
                  })}
                  className="w-full outline-none bg-transparent placeholder:text-slate-500 font-medium text-sm text-white"
                />
              </div>
              {formErrors.password && (
                <p className="text-xs text-rose-400 mt-1">{formErrors.password.message}</p>
              )}
            </div>

            {/* Error Banner */}
            {errors && (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-center">
                <p className="text-xs font-medium text-rose-300">{errors}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm bg-linear-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              <span>{loading ? "Signing in..." : "Sign In"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Switch link */}
          <div className="mt-6 pt-5 border-t border-white/10 text-center text-xs text-slate-400">
            <span>Don't have an account? </span>
            <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
              Create free account
            </Link>
          </div>
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          By signing in, you agree to PrepMate's Terms & Privacy policy.
        </p>
      </div>
    </div>
  )
}

export default Login