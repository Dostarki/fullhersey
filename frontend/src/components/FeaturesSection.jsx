import React from 'react';
import { Zap, Lock, Shield, Cpu, Activity, Fingerprint } from 'lucide-react';
import { motion } from 'framer-motion';

const FeaturesSection = () => {
  const features = [
    {
      icon: Zap,
      title: 'Fast Execution',
      description: 'Native Solana speed. No latency penalty for privacy. Experience lightning-fast shielded transfers.',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Lock,
      title: 'Post-Quantum',
      description: 'NIST-standard cryptography (Dilithium). Future-proofing your assets against quantum threats.',
      gradient: 'from-purple-500 to-indigo-500'
    },
    {
      icon: Shield,
      title: 'Harvest Now, Decrypt Later',
      description: 'Advanced protection against future decryption attacks via Bonsol Labs & BTQ integration.',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: Fingerprint,
      title: 'Identity Masking',
      description: 'Complete severance of wallet-to-identity links. Your on-chain footprint remains invisible.',
      gradient: 'from-red-500 to-pink-500'
    }
  ];

  return (
    <section className="relative py-32 px-6 bg-[#050505]">
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full max-h-[800px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-white tracking-tighter mb-6">
              Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-purple-500">Resilience</span>
            </h2>
            <p className="text-xl text-gray-400 font-light leading-relaxed">
              Spectra combines speed, security, and anonymity into a single powerful protocol.
            </p>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                className="group relative p-8 bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden hover:bg-white/10 transition-all duration-300"
              >
                {/* Hover Gradient Border */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                
                <div className="flex items-start gap-6 relative z-10">
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} bg-opacity-10 border border-white/10 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <h3 className="text-2xl font-bold text-white">{feature.title}</h3>
                    <p className="text-gray-400 leading-relaxed text-base">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Cryptographic Resilience Section - Glassmorphism */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-gray-900 to-black border border-white/10 p-12 md:p-16 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/10 rounded-full blur-[100px] -mr-20 -mt-20"></div>
          
          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
             <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold uppercase tracking-widest">
                    <Activity className="w-4 h-4" />
                    Powered by Bonsol & BTQ
                </div>
                <h3 className="text-4xl font-bold text-white tracking-tight">Cryptographic Resilience</h3>
                <p className="text-gray-400 text-lg leading-relaxed">
                    Solana is actively integrating quantum resilience. SPECTRA leverages Bonsol to
                    enable off-chain verifiable computation. This allows heavy cryptography to be
                    verified efficiently on-chain, ensuring that the privacy guarantees of today hold
                    up against the compute power of tomorrow.
                </p>
             </div>
             
             {/* Visual Tech Representation */}
             <div className="relative h-64 bg-black/50 rounded-2xl border border-white/10 flex items-center justify-center overflow-hidden">
                 <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                 <div className="grid grid-cols-3 gap-4 p-8 w-full h-full opacity-50">
                    {[...Array(9)].map((_, i) => (
                        <div key={i} className="bg-green-500/10 rounded-lg animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}></div>
                    ))}
                 </div>
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black/80 backdrop-blur-xl border border-green-500/30 px-8 py-4 rounded-xl flex items-center gap-4 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                        <Cpu className="w-8 h-8 text-green-400 animate-spin-slow" />
                        <span className="text-white font-mono font-bold">VERIFIED_PROOF</span>
                    </div>
                 </div>
             </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default FeaturesSection;