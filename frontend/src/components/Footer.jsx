import React from 'react';
import { Twitter, Send, Github, ArrowUpRight, X } from 'lucide-react'; // Added X

const Footer = () => {
  return (
    <footer className="relative border-t border-white/10 bg-black pt-20 pb-10 px-6 overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-green-900/10 to-transparent pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid md:grid-cols-4 gap-12 mb-20">
          {/* Brand Column */}
          <div className="space-y-4 col-span-1 md:col-span-1">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 relative">
                    <img 
                      src="https://i.hizliresim.com/852gn2e.png" 
                      alt="Spectre Logo" 
                      className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(74,222,128,0.3)]"
                    />
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Spectre</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
                Next-generation privacy protocol on Solana. 
                Shield your assets, break the link, and reclaim your financial anonymity.
            </p>
            <div className="flex gap-4 pt-2">
                <a 
                    href="https://x.com/spectretors" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all group"
                >
                    <X className="w-4 h-4 text-gray-400 group-hover:text-white" />
                </a>
            </div>
          </div>

          {/* Links Columns */}
          <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-2 gap-8">
            <div>
                <h4 className="text-white font-bold mb-6 text-sm tracking-widest">ECOSYSTEM</h4>
                <ul className="space-y-4">
                    <li><a href="/app" className="text-gray-500 hover:text-green-400 text-sm transition-colors flex items-center gap-2 group">Spectre App <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity"/></a></li>
                    <li><a href="/docs" className="text-gray-500 hover:text-green-400 text-sm transition-colors">Documentation</a></li>
                </ul>
            </div>
            <div>
                <h4 className="text-white font-bold mb-6 text-sm tracking-widest">LEGAL</h4>
                <ul className="space-y-4">
                    <li><a href="/privacy" className="text-gray-500 hover:text-green-400 text-sm transition-colors">Privacy Policy</a></li>
                    <li><a href="/terms" className="text-gray-500 hover:text-green-400 text-sm transition-colors">Terms of Service</a></li>
                    <li><a href="/cookies" className="text-gray-500 hover:text-green-400 text-sm transition-colors">Cookie Policy</a></li>
                </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 gap-4">
          <p className="text-gray-600 text-xs font-mono">
            � 2025 SPECTRE LABS. ALL RIGHTS RESERVED.
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