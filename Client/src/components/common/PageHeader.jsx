import React from 'react'

const PageHeader = ({title , subtitle, children}) => {
  return (
    <div className='flex items-center justify-between mb-4'>
        <div>
            <h1 className='text-2xl ml-2 font-medium text-slate-900 tracking-tight mb-0'>
                {title}
            </h1>
            {subtitle && <p className='text-sm ml-2 text-slate-500'>{subtitle}</p>}
        </div>
        {children && <div>{children}</div>}
    </div>
  )
}

export default PageHeader