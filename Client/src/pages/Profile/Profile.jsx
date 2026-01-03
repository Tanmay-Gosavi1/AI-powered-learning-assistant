import React, { useMemo, useState } from 'react'
import { Mail, Lock, User as UserIcon } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import authService from '../../service/authService.js'
import PageHeader from '../../components/common/PageHeader.jsx'
import Button from '../../components/common/Button.jsx'

const Field = ({ label, icon, children, error }) => (
  <div>
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <div className="flex p-3 border-2 border-gray-200 rounded-lg gap-2 mt-1.5 bg-white focus-within:border-blue-900 transition-colors">
      {React.createElement(icon, { className: 'mx-2 text-gray-400 w-5 h-5' })}
      <div className="w-full">{children}</div>
    </div>
    {error ? <p className="text-xs text-red-600 mt-1">{error}</p> : null}
  </div>
)

const Profile = () => {
  const { user } = useAuth()

  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState(null) // { type: 'success' | 'error', message: string }
  const [errors, setErrors] = useState({})

  const userName = useMemo(() => user?.name || '', [user])
  const userEmail = useMemo(() => user?.email || '', [user])

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
    setStatus(null)
  }

  const validate = () => {
    const nextErrors = {}

    if (!form.currentPassword) nextErrors.currentPassword = 'Current password is required'
    if (!form.newPassword) nextErrors.newPassword = 'New password is required'
    if (!form.confirmNewPassword) nextErrors.confirmNewPassword = 'Please confirm your new password'

    if (form.newPassword && form.newPassword.length < 6) {
      nextErrors.newPassword = 'Password must be at least 6 characters'
    }

    if (form.newPassword && form.confirmNewPassword && form.newPassword !== form.confirmNewPassword) {
      nextErrors.confirmNewPassword = 'Passwords do not match'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setStatus(null)
    if (!validate()) return

    setSubmitting(true)
    try {
      const response = await authService.changePassword({
        oldPassword: form.currentPassword,
        newPassword: form.newPassword,
      })

      const getMessage = (value, fallback) => {
        if (!value) return fallback
        if (typeof value === 'string') return value
        if (typeof value?.message === 'string') return value.message
        if (typeof value?.error === 'string') return value.error
        return fallback
      }

      if (response?.success) {
        setStatus({ type: 'success', message: getMessage(response, 'Password changed successfully') })
        setForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' })
      } else {
        setStatus({ type: 'error', message: getMessage(response, 'Failed to change password') })
      }
    } catch (err) {
      const message =
        typeof err === 'string'
          ? err
          : (err && typeof err?.message === 'string'
              ? err.message
              : (err && typeof err?.error === 'string'
                  ? err.error
                  : 'Failed to change password'))

      console.error('Change password failed:', err)
      setStatus({ type: 'error', message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen w-full px-4 md:px-6 py-8">
      <div className="max-w-5xl mx-auto">
        <PageHeader
          title="Profile Settings"
          subtitle="View your account details and change your password"
        />

        <div className="space-y-6">
          {/* User Information */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm">
            <div className="p-6 md:p-8">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">User Information</h2>

              <div className="space-y-4">
                <Field label="Username" icon={UserIcon}>
                  <input
                    type="text"
                    value={userName}
                    readOnly
                    className="w-full outline-none placeholder:text-gray-400 font-semibold text-sm text-gray-700 bg-transparent cursor-default"
                    placeholder="-"
                    aria-readonly="true"
                  />
                </Field>

                <Field label="Email Address" icon={Mail}>
                  <input
                    type="text"
                    value={userEmail}
                    readOnly
                    className="w-full outline-none placeholder:text-gray-400 font-semibold text-sm text-gray-700 bg-transparent cursor-default"
                    placeholder="-"
                    aria-readonly="true"
                  />
                </Field>
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm">
            <div className="p-6 md:p-8">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Change Password</h2>

              <form onSubmit={onSubmit} className="space-y-4">
                <Field label="Current Password" icon={Lock} error={errors.currentPassword}>
                  <input
                    type="password"
                    name="currentPassword"
                    value={form.currentPassword}
                    onChange={onChange}
                    placeholder="••••••••"
                    className="w-full outline-none placeholder:text-gray-400 font-semibold text-sm text-gray-700"
                    autoComplete="current-password"
                  />
                </Field>

                <Field label="New Password" icon={Lock} error={errors.newPassword}>
                  <input
                    type="password"
                    name="newPassword"
                    value={form.newPassword}
                    onChange={onChange}
                    placeholder="••••••••"
                    className="w-full outline-none placeholder:text-gray-400 font-semibold text-sm text-gray-700"
                    autoComplete="new-password"
                  />
                </Field>

                <Field label="Confirm New Password" icon={Lock} error={errors.confirmNewPassword}>
                  <input
                    type="password"
                    name="confirmNewPassword"
                    value={form.confirmNewPassword}
                    onChange={onChange}
                    placeholder="••••••••"
                    className="w-full outline-none placeholder:text-gray-400 font-semibold text-sm text-gray-700"
                    autoComplete="new-password"
                  />
                </Field>

                {status ? (
                  <div
                    className={
                      status.type === 'success'
                        ? 'bg-blue-50 rounded-lg p-3 border border-blue-200'
                        : 'bg-red-50 rounded-lg p-3 border border-red-200'
                    }
                  >
                    <p
                      className={
                        status.type === 'success'
                          ? 'text-xs font-medium text-center text-blue-900'
                          : 'text-xs font-medium text-center text-red-600'
                      }
                    >
                      {status.message}
                    </p>
                  </div>
                ) : null}

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="min-w-44"
                  >
                    {submitting ? 'Changing Password...' : 'Change Password'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile