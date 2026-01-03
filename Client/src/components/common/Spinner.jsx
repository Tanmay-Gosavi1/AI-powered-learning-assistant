import React from 'react'

const Spinner = ({ fullScreen = false, size = 56, label = 'Loading...' }) => {
  const containerClass = fullScreen
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm'
    : 'flex items-center justify-center';

  const px = { width: size, height: size };

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center">
        <div className="relative" style={px}>
          {/* Outer subtle ring */}
          <div className="absolute inset-0 rounded-full border border-blue-200/50" />
          {/* Main spinner arc */}
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-700 border-l-blue-500 animate-spin" />
          {/* Orbiting dots */}
          <div className="absolute inset-0 animate-spin-slow">
            <span className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-700 rounded-full" />
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-cyan-500 rounded-full" />
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-indigo-500 rounded-full" />
            <span className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-emerald-500 rounded-full" />
          </div>
        </div>
        {label && (
          <p className="mt-3 text-sm font-medium text-slate-700">{label}</p>
        )}
      </div>
      <style>{`
        .animate-spin-slow { animation: spin 2.2s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Spinner