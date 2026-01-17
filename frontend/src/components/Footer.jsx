import React from 'react';
import { Twitter, Send, Github, ArrowUpRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative border-t border-white/10 bg-black pt-20 pb-10 px-6 overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-green-900/10 to-transparent pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid md:grid-cols-4 gap-12 mb-20">
          {/* Brand Column */}
          <div className="space-y-6 col-span-1 md:col-span-1">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="relative w-10 h-10">
                  <div className="absolute inset-0 bg-green-500 rounded-xl blur opacity-20 group-hover:opacity-50 transition-opacity duration-500"></div>
                  <img 
                    src="https://i.hizliresim.com/852gn2e.png" 
                    alt="Spectra" 
                    className="w-full h-full object-contain relative z-10"
                  />
              </div>
              <span className="text-white text-xl font-bold tracking-tight">SPECTRA</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              Privacy at machine speed. The execution layer for the autonomous agent economy.
            </p>
            <div className="flex gap-4 pt-2">
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all group">
                    <Twitter className="w-4 h-4 text-gray-400 group-hover:text-white" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all group">
                    <Send className="w-4 h-4 text-gray-400 group-hover:text-white" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all group">
                    <Github className="w-4 h-4 text-gray-400 group-hover:text-white" />
                </a>
            </div>
          </div>

          {/* Links Columns */}
          <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
                <h4 className="text-white font-bold mb-6 text-sm tracking-widest">ECOSYSTEM</h4>
                <ul className="space-y-4">
                    <li><a href="#" className="text-gray-500 hover:text-green-400 text-sm transition-colors flex items-center gap-2 group">Spectra App <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity"/></a></li>
                    <li><a href="#" className="text-gray-500 hover:text-green-400 text-sm transition-colors">Explorer</a></li>
                    <li><a href="#" className="text-gray-500 hover:text-green-400 text-sm transition-colors">Documentation</a></li>
                    <li><a href="#" className="text-gray-500 hover:text-green-400 text-sm transition-colors">Github</a></li>
                </ul>
            </div>
            <div>
                <h4 className="text-white font-bold mb-6 text-sm tracking-widest">GOVERNANCE</h4>
                <ul className="space-y-4">
                    <li><a href="#" className="text-gray-500 hover:text-green-400 text-sm transition-colors">DAO</a></li>
                    <li><a href="#" className="text-gray-500 hover:text-green-400 text-sm transition-colors">Tokenomics</a></li>
                    <li><a href="#" className="text-gray-500 hover:text-green-400 text-sm transition-colors">Proposals</a></li>
                </ul>
            </div>
            <div>
                <h4 className="text-white font-bold mb-6 text-sm tracking-widest">LEGAL</h4>
                <ul className="space-y-4">
                    <li><a href="#" className="text-gray-500 hover:text-green-400 text-sm transition-colors">Privacy Policy</a></li>
                    <li><a href="#" className="text-gray-500 hover:text-green-400 text-sm transition-colors">Terms of Service</a></li>
                    <li><a href="#" className="text-gray-500 hover:text-green-400 text-sm transition-colors">Cookie Policy</a></li>
                </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 gap-4">
          <p className="text-gray-600 text-xs font-mono">
            © 2025 SPECTRA LABS. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
             <span className="text-green-500 text-xs font-bold tracking-wider">ALL SYSTEMS OPERATIONAL</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;