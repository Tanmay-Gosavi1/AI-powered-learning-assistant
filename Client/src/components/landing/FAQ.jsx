import { useState } from 'react'
import { FAQS } from '../../utils/data.js'
import { ChevronDown, HelpCircle } from 'lucide-react'

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null)

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index)
  }
  const isOpen = (index) => index === activeIndex

  return (
    <section id="faqs" className="py-24 sm:py-32 relative border-t border-white/[0.06]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full saas-pill-badge text-xs font-semibold text-cyan-300 mb-4 shadow-sm">
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>Got Questions? We’ve Got Answers</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400 font-normal">
            Everything you need to know about PrepMate, document security, and study tools.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="flex flex-col space-y-3.5">
          {FAQS.map((item, idx) => (
            <div
              key={idx}
              className={`w-full transition-all duration-300 rounded-2xl cursor-pointer p-5 sm:p-6 border ${
                isOpen(idx)
                  ? 'bg-white/[0.06] border-blue-500/40 shadow-xl shadow-blue-500/5'
                  : 'bg-white/[0.02] hover:bg-white/[0.04] border-white/10 hover:border-white/20'
              }`}
              onClick={() => toggleFAQ(idx)}
            >
              <div className="flex justify-between items-center gap-4">
                <h3 className="font-bold text-base sm:text-lg text-white">
                  {item.question}
                </h3>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                  isOpen(idx) ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400'
                }`}>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-300 ${
                      isOpen(idx) ? 'rotate-180' : 'rotate-0'
                    }`}
                  />
                </div>
              </div>

              <div
                className={`grid transition-all duration-300 ${
                  isOpen(idx) ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden w-full">
                  <p className="text-slate-300 font-normal text-sm sm:text-base leading-relaxed pt-2 border-t border-white/5">
                    {item.answer}
                  </p>
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