import React from 'react'
import { FileText, Plus } from 'lucide-react'

const EmptyState = ({ onActionClick, title, description, buttonText }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      {/* Icon */}
      <div className="p-4 rounded-2xl bg-primary-soft text-primary-700 shadow-primary-25 mb-4">
        <FileText className="w-8 h-8" strokeWidth={2} />
      </div>

      {/* Title */}
      <h3 className="text-xl md:text-2xl font-semibold text-slate-900 tracking-tight">
        {title}
      </h3>

      {/* Description */}
      <p className="mt-2 max-w-xl text-sm md:text-base text-slate-500">
        {description}
      </p>

      {/* Action */}
      {buttonText && onActionClick && (
        <button
          onClick={onActionClick}
          className="mt-6 inline-flex items-center gap-2 btn-primary rounded-xl px-5 py-3 font-semibold shadow-lg shadow-primary-25 transition-all duration-300 hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          <span>{buttonText}</span>
        </button>
      )}

      {/* Decorative underline */}
      <div className="mt-6 h-1 w-24 rounded-full bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200" />
    </div>
  )
}

export default EmptyState