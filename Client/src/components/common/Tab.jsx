import React from 'react'

const Tab = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div className='w-full max-w-full overflow-hidden'>
        <div className='relative border-b-2 border-slate-100 overflow-x-auto'>
            <nav className='flex gap-1 sm:gap-2 min-w-max'>
                {tabs.map((tab) => (
                    <button
                        key={tab.name}
                        onClick={()=>setActiveTab(tab.name)}
                        className={`pb-3 sm:pb-4 px-2 sm:px-3 relative text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap
                            ${activeTab === tab.name ? "text-blue-900 border-b-2 border-blue-900" : "text-slate-600 hover:text-slate-900" }    
                        `}
                    >
                        <span className='relative z-10'>{tab.label}</span>
                        {activeTab === tab.name && (
                            <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-blue-500 to-blue-400 rounded-full' />
                        )}
                        {activeTab === tab.name && (
                            <div className='absolute inset-0 bg-linear-to-b from-blue-50/50 to-transparent rounded-t-xl'/>
                        )}
                    </button>    
                ))}
            </nav>
        </div>

        <div className='py-4 sm:py-5 max-w-full overflow-hidden'>
            {tabs.map((tab) => {
                if(tab.name === activeTab) {
                    return (
                        <div className='animate-in fade-in duration-300 max-w-full' key={tab.name}>{tab.content}</div>
                    )
                }
                return null;
            })}
        </div>

    </div>
  )
}

export default Tab