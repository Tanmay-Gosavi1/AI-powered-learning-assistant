import React from 'react'
import {X} from "lucide-react";
const Modal = ({isOpen , onClose , title ,children}) => {
    if(!isOpen) return null;
  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
        <div className='flex items-center justify-center min-h-screen px-4 py-8'>
            <div className='fixed inset-0 bg-slate-900/50 backdrop-blur-md transition-opacity' onClick={onClose}>
            </div>

            <div className='relative w-full max-w-xl bg-white/95 backdrop-blur-xl border-2 border-slate-200/60 rounded-2xl shadow-xl shadow-slate-500/60 p-8 animate-in z-10 fade-in slide-in-from-bottom-4 duration-300 mx-auto flex flex-col gap-4'>
                <button onClick={onClose} className='absolute cursor-pointer top-6 right-6 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200'>
                    <X className="w-5 h-5 text-slate-500 hover:text-slate-700" />
                </button>
                <div className='mb-6 pr-8'>
                    <h3 className='text-xl font-medium text-slate-900 tracking-tight'>{title}</h3>
                </div>
                <div>{children}</div>
            </div>
        </div>
    </div>
  )
}

export default Modal