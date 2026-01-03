import React from 'react'
import Header from '../../components/landing/Header.jsx';
import Hero from '../../components/landing/Hero.jsx';
import Features from '../../components/landing/Features.jsx';
import Testinomials from '../../components/landing/Testinomials.jsx';
import FAQ from '../../components/landing/FAQ.jsx';
import Footer from '../../components/landing/Footer.jsx';
import Workflow from '../../components/landing/Workflow.jsx';
const Landing = () => {
  return ( <>
    <Header />
    <main>
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
    </main>
    </>
  )
}

export default Landing