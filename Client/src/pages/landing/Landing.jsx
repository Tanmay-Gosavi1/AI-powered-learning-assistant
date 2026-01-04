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

  
  return ( <>
    <Header />
    <main className="relative">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[14px_14px] opacity-30 pointer-events-none" />
      <div className="relative">
      {/* Hero Section */}
      <Hero />
      {/* Features Section */}
      <Features />
      {/* Workflow Section */}
      <Workflow />
      {/* Testimonials Section */}
      <Testinomials />
      <FAQ />
      <Footer />
      </div>
    </main>
    </>
  )
}

export default Landing