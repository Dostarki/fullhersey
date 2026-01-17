import React from 'react';
import { Button } from './ui/button';
import { ArrowRight, ChevronDown, ShieldCheck, Zap, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden bg-transparent">
      
      {/* Animated Background Gradients - MOVED TO PARENT or AnimatedBackground.jsx */}
      {/* Keeping this empty/transparent to allow global background to show through */}

      <div className="max-w-5xl mx-auto text-center space-y-12 relative z-10">
        
        {/* Ambient Glow Center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-green-500/10 via-purple-500/10 to-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-colors cursor-default">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div>
          <span className="text-gray-300 text-xs font-bold tracking-widest uppercase">Spectra Live on Solana</span>
        </div>

        {/* Main Headline */}
        <div className="space-y-6">
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-white leading-[0.9] drop-shadow-2xl">
              Privacy Layer 2
            </h1>
            <p className="text-2xl md:text-3xl text-gray-400 font-light tracking-wide">
              Private transfers for the <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-purple-400 font-medium">Solana ecosystem</span>.
            </p>
        </div>

        {/* Description */}
        <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-light">
          Our mission is to make Solana transfers fully private. By routing transactions through a dedicated 
          <span className="text-gray-300 font-medium"> ZK-Proof Protocol</span>, SPECTRA ensures that your financial footprint remains yours alone.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
          <Button 
            onClick={() => navigate('/app')}
            className="group relative bg-white text-black hover:bg-gray-100 px-10 py-8 text-lg font-bold rounded-full transition-all hover:scale-105 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] flex items-center gap-3 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200/50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <Wallet className="w-5 h-5" />
            Connect Wallet
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <Button 
            variant="ghost" 
            className="text-gray-300 hover:text-white hover:bg-white/5 px-10 py-8 text-lg font-medium rounded-full transition-all border border-white/10 hover:border-white/20 backdrop-blur-sm"
          >
            Read Documentation
          </Button>
        </div>

        {/* Trust Badges */}
        <div className="pt-12 flex justify-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
             <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-500" />
                <span className="text-xs font-bold tracking-widest text-white">AUDITED</span>
             </div>
             <div className="w-px h-4 bg-white/20"></div>
             <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span className="text-xs font-bold tracking-widest text-white">LIGHTNING FAST</span>
             </div>
        </div>

        {/* Scroll Indicator - FIXED CENTERING */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce opacity-50 w-full max-w-xs">
          <span className="text-gray-600 text-[10px] uppercase tracking-widest font-bold">Scroll to Explore</span>
          <ChevronDown className="w-4 h-4 text-gray-600" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
