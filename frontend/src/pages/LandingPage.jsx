import React from 'react';
import AnimatedBackground from '../components/AnimatedBackground';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import ProblemSection from '../components/ProblemSection';
import InfrastructureSection from '../components/InfrastructureSection';
import FeaturesSection from '../components/FeaturesSection';
import ScaleSection from '../components/ScaleSection';
import Footer from '../components/Footer';

const LandingPage = () => {
  return (
    <div className="bg-black min-h-screen relative overflow-x-hidden">
      <AnimatedBackground />
      <div className="relative z-10">
        <Navbar />
        <HeroSection />
        <ProblemSection />
        <InfrastructureSection />
        <FeaturesSection />
        <ScaleSection />
        <Footer />
      </div>
    </div>
  );
};

export default LandingPage;
