import React from 'react'
import { TESTIMONIALS } from '../../utils/data'
import { Quote } from 'lucide-react'
const Testinomials = () => {
  return (
    <section id='testimonials' className='py-20 lg:py-28 bg-white'>
        <div className='max-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            {/* Text */}
            <div className='max-w-6xl mx-auto mb-16'>
                <h1 className='text-3xl sm:text-5xl font-extrabold text-center mb-4 text-blue-950 capitalize'>What our customers say?</h1>
                <p className='text-center text-lg sm:text-xl text-gray-700'>We are trusted by thousands of small bussinesses</p>
            </div>

            {/* cards */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto gap-8'>
                {TESTIMONIALS.map((item, index) => (
                    <div key={index} className='p-8 rounded-xl shadow-sm hover:shadow-lg relative transition-all duration-200 bg-gray-50 border border-gray-200 hover:-translate-y-1'>
                        <div className='absolute -top-4 left-8 w-10 h-10 rounded-full bg-linear-to-r from-blue-950 to-blue-900 flex items-center justify-center text-white'>
                            <Quote className='w-6 h-6'/>
                        </div>
                        <p className='italic text-md sm:text-lg mb-6 text-gray-800 leading-relaxed'>"{item.quote}"</p>
                        <div className='flex items-center space-x-4'>
                            <img src={item.avatar} className='w-10 h-10 rounded-full mr-4' alt={`${item.author} avatar`} />
                            <div className='flex-1'>
                                <p className='font-semibold text-gray-900'>{item.author}</p>
                                <p className='font-medium text-sm text-gray-500'>{item.title}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </section>
  )
}

export default Testinomials