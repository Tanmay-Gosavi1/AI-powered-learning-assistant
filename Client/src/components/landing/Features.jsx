import React from 'react'
import {FEATURES} from '../../utils/data'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const Features = () => {
  return (
    <section id='features' className='pb-20 sm:py-28 bg-gray-50'>
        <div className='flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            {/* Text */}
            <div className='max-w-6xl mx-auto mb-16'>
                <h1 className='text-3xl sm:text-5xl font-extrabold text-blue-950 capitalize text-center mb-4'>Powerful features to master anything</h1>
                <p className='max-w-3xl mx-auto text-center text-lg sm:text-xl font-medium text-gray-700'>Everything you need to learn faster and remember longer</p>
            </div>
            {/* Cards */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
                {FEATURES.map((item, index) => (
                    <Link key={index} to={item.path || '/dashboard'} className='p-8 rounded-xl bg-white/90 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 block'>
                        {/* Logo */}
                        <div className='w-16 h-16 rounded-2xl bg-gray-100 flex justify-center items-center'>
                            <item.icon className='w-8 h-8 text-blue-600 '/>
                        </div>
                        <h3 className='font-extrabold text-lg pt-3 mb-4'>{item.title}</h3>
                        <p className='font-medium text-gray-600 leading-relaxed '>{item.description}</p>
                        <span className='flex justify-center items-center pt-3 w-fit text-sm rounded-lg font-semibold gap-2 text-blue-900'>Open <ArrowRight className='w-4'/></span>
                    </Link>
                ))}
            </div>
        </div>
    </section>
  )
}

export default Features