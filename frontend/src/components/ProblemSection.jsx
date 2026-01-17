import React from 'react';
import { User, EyeOff, ShieldCheck, Search, Database, Lock, Zap, Award } from 'lucide-react';

const ProblemSection = () => {
  return (
    <section id="problem" className="relative py-20 px-6 overflow-hidden bg-transparent">
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-5xl md:text-6xl font-bold text-white tracking-tighter">
              The <span className="text-red-500">Public Ledger</span> Dilemma
            </h2>
            <p className="text-xl text-gray-400 font-light">
              Solana is fast, but it's also transparent. Every transaction you make is permanently recorded for anyone to see.
            </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-stretch">
          
          {/* Card 1: The Problem (Public Chain) - REFINED COLORS */}
          <div className="group relative bg-red-900/5 border border-red-500/10 rounded-[2rem] p-8 overflow-hidden hover:bg-red-900/10 transition-all duration-500">
             {/* Subtler Background Icon */}
             <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Search className="w-32 h-32 text-red-400 rotate-12" />
             </div>
             
             <div className="relative z-10 space-y-8">
                <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/10">
                    <Database className="w-8 h-8 text-red-400" />
                </div>
                
                <div>
                    <h3 className="text-3xl font-bold text-white mb-2">Total Exposure</h3>
                    <p className="text-gray-400 leading-relaxed">
                        Your wallet address is your identity. Once linked, every trade, salary payment, and purchase builds a public profile of your net worth.
                    </p>
                </div>

                <div className="space-y-3 pt-4">
                    <div className="flex items-center gap-3 text-red-300/70 bg-red-500/5 p-3 rounded-xl border border-red-500/10">
                        <EyeOff className="w-5 h-5 shrink-0" />
                        <span className="font-mono text-sm">0x7d...3f9a <span className="text-white font-bold">SENT</span> 500 SOL</span>
                    </div>
                    <div className="flex items-center gap-3 text-red-300/70 bg-red-500/5 p-3 rounded-xl border border-red-500/10">
                        <Search className="w-5 h-5 shrink-0" />
                        <span className="font-mono text-sm">Balance: <span className="text-white font-bold">12,450.00 USDC</span> (Visible)</span>
                    </div>
                </div>
             </div>
          </div>

          {/* Card 2: The Solution (Spectra Privacy) - ENHANCED */}
          <div className="group relative bg-green-500/5 border border-green-500/10 rounded-[2rem] p-8 overflow-hidden hover:bg-green-500/10 transition-all duration-500 shadow-[0_0_50px_-20px_rgba(34,197,94,0.1)] hover:shadow-[0_0_80px_-20px_rgba(34,197,94,0.2)]">
             <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity">
                <ShieldCheck className="w-32 h-32 text-green-500 -rotate-12" />
             </div>
             
             {/* Spectra Badge */}
             <div className="absolute top-6 right-6 flex items-center gap-2 bg-green-500/20 border border-green-500/20 rounded-full px-3 py-1">
                <Award className="w-3 h-3 text-green-400" />
                <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Recommended</span>
             </div>

             <div className="relative z-10 space-y-8">
                <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center border border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                    <Lock className="w-8 h-8 text-green-500" />
                </div>
                
                <div>
                    <h3 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        Spectra Privacy
                        <span className="text-sm font-bold bg-green-500 text-black px-2 py-0.5 rounded uppercase tracking-wide">Pro</span>
                    </h3>
                    <p className="text-gray-400 leading-relaxed">
                        The ultimate shield for your assets. <span className="text-green-400 font-bold">Spectra</span> utilizes military-grade Zero-Knowledge Proofs to completely sever the on-chain link between sender and receiver.
                    </p>
                </div>

                <div className="space-y-3 pt-4">
                    <div className="flex items-center gap-3 text-green-400/80 bg-green-500/10 p-3 rounded-xl border border-green-500/10 relative overflow-hidden">
                         <div className="absolute inset-0 bg-green-400/10 animate-pulse"></div>
                        <User className="w-5 h-5 shrink-0 relative z-10" />
                        <span className="font-mono text-sm relative z-10">Spectra <span className="text-white font-bold">ZK-SHIELD</span> Active</span>
                    </div>
                    <div className="flex items-center gap-3 text-green-400/80 bg-green-500/10 p-3 rounded-xl border border-green-500/10">
                        <Zap className="w-5 h-5 shrink-0" />
                        <span className="font-mono text-sm">Traceability: <span className="text-white font-bold">IMPOSSIBLE</span></span>
                    </div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ProblemSection;