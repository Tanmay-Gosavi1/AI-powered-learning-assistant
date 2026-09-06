import React , {useEffect} from 'react'
import Header from '../../components/landing/Header.jsx';
import Hero from '../../components/landing/Hero.jsx';
import Features from '../../components/landing/Features.jsx';
import Testinomials from '../../components/landing/Testinomials.jsx';
import FAQ from '../../components/landing/FAQ.jsx';
import Footer from '../../components/landing/Footer.jsx';
import Workflow from '../../components/landing/Workflow.jsx';
import axios from 'axios';
const Landing = () => {

  useEffect(() => {
    const startServer = async ()=>{
      const serverURL = import.meta.env.VITE_SERVER_URL 
      try {
        await axios.get(`${serverURL}/`);
      } catch (error) {
        console.error("Error starting server:", error);
      }
    }
    startServer();
  }, []);

  
  return (
    <>
      <Header />
      <main className="relative bg-[#070B14] text-white overflow-hidden">
        {/* Continuous Ambient Background Glows */}
        <div className="absolute top-1/4 left-10 w-[28rem] h-[28rem] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-10 w-[32rem] h-[32rem] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/3 w-[30rem] h-[30rem] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-size-[24px_24px] opacity-[0.03] pointer-events-none" />

        <div className="relative z-10">
          {/* Hero Section */}
          <Hero />
          {/* Features Section */}
          <Features />
          {/* Workflow Section */}
          <Workflow />
          {/* Testimonials Section */}
          <Testinomials />
          {/* FAQ Section */}
          <FAQ />
          {/* Footer */}
          <Footer />
        </div>
      </main>
    </>
  )
}

export default Landing