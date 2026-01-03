import React from 'react'
import { Link } from 'react-router-dom'
import {useAuth} from '../../context/AuthContext.jsx'

const Hero = () => {
    const { isAuthenticated } = useAuth();
  return (
    <section>
        <div className='min-h-screen pt-18 sm:pt-25'>
            {/* Text */}
            <div className='px-6 sm:px-10 max-w-6xl mx-auto'>
                <div className='text-center py-5'>
                    <h1 className='capitalize font-extrabold text-4xl sm:text-5xl lg:text-7xl tracking-tight text-blue-950'>AI-powered learning, made effortless</h1>
                </div>
                <div className='pb-10 pt-5 text-center '>
                    <h1 className='text-base sm:text-lg font-medium text-gray-800'>Turn notes, lectures, and PDFs into flashcards, quizzes, and bite-sized explanations. Study smarter in minutes.</h1>
                </div>
                <div className='flex flex-col sm:flex-row justify-center items-center sm:space-x-6'>
                    {isAuthenticated ? (
                    <>
                        <Link to="/dashboard" className='bg-linear-to-r from-blue-950 to-blue-800 px-6 py-4 rounded-lg text-white font-semibold hover:scale-105 transition-all duration-200'>Go to Dashboard</Link>
                    </>) : (
                    <>
                        <Link to="/signup" className='bg-linear-to-r from-blue-950 to-blue-800 px-6 py-4 rounded-lg text-white font-semibold hover:scale-105 transition-all duration-200'>Get Started for free</Link>
                    </>)}
                    <Link to='#features' className='px-8 py-3 rounded-lg mt-5 sm:mt-0 border-3 border-black font-bold hover:scale-105 transition-all duration-200'>Learn More</Link>
                </div>
            </div>
            {/* Img */}
            <div className='max-w-7xl mt-12  mx-auto overflow-hidden bg-cover px-6 pb-10'>
                                {/* When the image is in the public/ folder, reference it by root-relative path */}
                                <img className='w-full shadow-lg rounded-xl' src="/image.png" alt="AI Learning Assistant Hero" />
            </div>
        </div>
    </section>
  )
}

export default Hero