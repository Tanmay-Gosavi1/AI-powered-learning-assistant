import {useState} from 'react'
import { FAQS } from '../../utils/data.js';
import { ChevronDown } from 'lucide-react';
const FAQ = () => {
    const [activeIndex, setActiveIndex] = useState(null);

    const toggleFAQ = (index) =>{
        setActiveIndex(activeIndex === index ? null : index);
    }
    const isOpen = (index) => index === activeIndex;
  return (
    <section id="faqs" className="py-20 lg:py-28 bg-gray-50">
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='w-full flex flex-col justify-center items-center mb-12'>
            <h1 className='text-3xl sm:text-5xl font-extrabold mb-4 text-blue-950 text-center'>Frequently Asked Questions</h1>
            <p className='max-w-3xl mx-auto text-center text-lg sm:text-xl font-medium text-gray-700'>Everything you need to know about product and billing.</p>
        </div>
        <div className='flex flex-col space-y-4'>
            {/* Faqs */}
            {FAQS.map((item , idx)=>(
                <div key={idx} className='w-full transition-all duration-300 bg-white border border-gray-100  px-6 py-4 rounded-lg cursor-pointer shadow-sm' onClick={() => toggleFAQ(idx)}>
                    <div className='flex justify-between items-center'>
                        <h1 className='font-medium'>{item.question}</h1>
                        <ChevronDown className={`${isOpen(idx) ? 'rotate-180' : 'rotate-0'} text-gray-600 w-5 transition-transform duration-400 `} />
                    </div>
                                        <div
                                            className={`grid transition-all duration-300 ${isOpen(idx) ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                                        >
                                            <div className='overflow-hidden w-full mt-4'>
                                                <p className='text-gray-600 font-medium'>{item.answer}</p>
                                            </div>
                                        </div>
                </div>
            ))}
        </div>
      </div>
    </section>
  )
}

export default FAQ