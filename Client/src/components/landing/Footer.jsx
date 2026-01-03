import React from 'react'
import {Twitter , Linkedin , Github , FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const FooterLink = ({href , to , children}) => {
    const classnamme = 'text-gray-400 hover:text-white transition-colors duration-200 block' 
    if(to){
        return <Link to={to} className={classnamme}>{children}</Link>
    }
    return <a href={href} className={classnamme}>{children}</a>
}

const SocialLink = ({href , children}) => {
    return <a href={href} 
        className='w-10 h-10 rounded-lg bg-blue-950 hover:bg-gray-700 transition-colors duration-200 flex justify-center items-center text-white'
        target='_blank'
    >
        {children}
    </a>
}

const Footer = () => {
  return (
    <footer className='bg-gray-900 text-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
                {/* Logo */}
                <div className='space-y-4 md:col-span-2 lg:col-span-1'>
                    <Link to='/' className='flex items-center space-x-4 mb-6'>
                        <div className='w-8 h-8 rounded-lg bg-white flex justify-center items-center'>
                            <FileText className='w-6 h-6 text-blue-950 font-extrabold'/>
                        </div>
                        <p className='text-xl font-bold'>PrepMate</p>
                    </Link>
                    <p className='text-gray-400 leading-relaxed max-w-sm text-base'>AI that turns notes into flashcards, quizzes, and clear explanations.</p>
                </div>

                <div>
                    <h1 className='text-base mb-4 font-semibold'>Products</h1>
                    <ul className='space-y-2'>
                        <li>
                            <FooterLink href="#features">Features</FooterLink>
                        </li>
                        <li>
                            <FooterLink href="#testimonials">Testimonials</FooterLink>
                        </li>
                        <li>
                            <FooterLink href="#faqs">FAQs</FooterLink>
                        </li>
                    </ul>
                </div>

                <div>
                    <h1 className='text-base mb-4 font-semibold'>Company</h1>
                    <ul className='space-y-2'>
                        <li>
                            <FooterLink to='/about'>About Us </FooterLink>
                        </li>
                        <li>
                            <FooterLink to='/contact' >Contact</FooterLink>
                        </li>
                    </ul>
                </div>

                <div>
                    <h1 className='text-base mb-4 font-semibold'>Legal</h1>
                    <ul className='space-y-2'>
                        <li>
                            <FooterLink to='/privacy'>Privacy Policy</FooterLink>
                        </li>
                        <li>
                            <FooterLink to='/terms'>Terms of Service</FooterLink>
                        </li>
                    </ul>
                </div>
            </div>

            <div className='border-t border-gray-800 py-8 mt-16'>
                <div className='flex flex-col md:flex-row justify-between items-center'>
                    <p className='text-gray-400 text-sm'>&copy; 2024 PrepMate. All rights reserved.</p>
                    <div className='flex space-x-4 mt-4 md:mt-0'>
                        <SocialLink href='#'>
                            <Twitter className='w-5 h-5'/>
                        </SocialLink>
                        <SocialLink href='#'>
                            <Linkedin className='w-5 h-5'/>
                        </SocialLink>
                        <SocialLink href='#'>
                            <Github className='w-5 h-5'/>
                        </SocialLink>
                    </div>
                </div>
            </div>

        </div>
    </footer>
  )
}

export default Footer