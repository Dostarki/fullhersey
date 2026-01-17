import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Menu, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${
        isScrolled 
          ? 'bg-black/60 backdrop-blur-xl border-white/10 py-4 shadow-[0_4px_30px_rgba(0,0,0,0.1)]' 
          : 'bg-transparent border-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="relative w-10 h-10">
                <div className="absolute inset-0 bg-green-500 rounded-xl blur opacity-20 group-hover:opacity-50 transition-opacity duration-500"></div>
                <img 
                  src="https://i.hizliresim.com/852gn2e.png" 
                  alt="Spectra Logo" 
                  className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                />
            </div>
            <div className="flex flex-col">
                <span className="text-white text-lg font-bold tracking-tight leading-none group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-green-400 group-hover:to-purple-500 transition-all duration-300">SPECTRA</span>
                <span className="text-[10px] text-gray-500 font-mono tracking-[0.2em] uppercase group-hover:text-white transition-colors">Protocol</span>
            </div>
          </div>
          
          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {['Problem', 'Solution', 'Infrastructure', 'Docs'].map((item) => (
                <a 
                  key={item} 
                  href={`#${item.toLowerCase()}`} 
                  className="relative px-5 py-2 text-sm text-gray-400 hover:text-white transition-colors group overflow-hidden rounded-full"
                >
                  <span className="relative z-10">{item}</span>
                  <div className="absolute inset-0 bg-white/5 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300"></div>
                </a>
            ))}
          </div>

          {/* Action Button */}
          <div className="hidden md:block">
            <Button 
                onClick={() => navigate('/app')}
                className="bg-white text-black hover:bg-green-400 hover:scale-105 transition-all duration-300 rounded-full px-6 font-bold shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_-5px_rgba(74,222,128,0.5)]"
            >
                Launch App
                <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-black/95 backdrop-blur-xl border-b border-white/10 p-6 md:hidden animate-in slide-in-from-top-5 duration-300">
            <div className="flex flex-col gap-4">
                {['Problem', 'Solution', 'Infrastructure', 'Docs'].map((item) => (
                    <a 
                      key={item} 
                      href={`#${item.toLowerCase()}`} 
                      className="text-lg text-gray-400 hover:text-white py-2 border-b border-white/5"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item}
                    </a>
                ))}
                <Button onClick={() => navigate('/app')} className="w-full mt-4 bg-green-500 text-black hover:bg-green-400 font-bold">
                    Launch App
                </Button>
            </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;