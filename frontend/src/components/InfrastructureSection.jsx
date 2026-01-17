import React, { useEffect, useState } from 'react';
import { Shield, Layers, Boxes, Activity, Server, Cpu, Network } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

const InfrastructureSection = () => {
  const [serverStatus, setServerStatus] = useState('Checking...');
  const [ping, setPing] = useState(0);

  useEffect(() => {
    const checkStatus = async () => {
      const start = Date.now();
      try {
        await axios.get('/api/status');
        const duration = Date.now() - start;
        setServerStatus('Online');
        setPing(duration);
      } catch (error) {
        setServerStatus('Offline');
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="infrastructure" className="relative py-32 px-6 bg-[#050505]">
      
      {/* Background Tech Grid */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center space-y-4 mb-20"
        >
          <div className="flex justify-center items-center gap-2 mb-4">
            <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-2">
                <span className={`flex h-2 w-2 rounded-full ${serverStatus === 'Online' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]' : 'bg-red-500'}`} />
                <p className="text-gray-400 text-xs uppercase tracking-wider font-bold">
                Network Status: <span className={serverStatus === 'Online' ? 'text-green-400' : 'text-red-400'}>{serverStatus}</span> {serverStatus === 'Online' && `(${ping}ms)`}
                </p>
            </div>
          </div>
          <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tighter">
            Disappear in <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-purple-500">Spectra.</span>
          </h2>
          <p className="text-gray-400 text-xl max-w-3xl mx-auto font-light leading-relaxed">
            A privacy-first Layer 2 infrastructure on Solana that enables wallet-to-wallet transfers to execute without leaking identity.
          </p>
        </motion.div>

        {/* 3-Column Feature Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
            {/* Node 1: Agent */}
            <div className="group bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Boxes className="w-24 h-24 text-white" />
                </div>
                <div className="relative z-10 space-y-4">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center border border-purple-500/20">
                        <Cpu className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Client Side</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        Transaction parameters are encrypted locally. Your private key never leaves your device.
                    </p>
                </div>
            </div>

            {/* Node 2: Spectra Layer (Center Highlight) */}
            <div className="group bg-gradient-to-b from-green-900/10 to-black border border-green-500/30 p-8 rounded-3xl relative overflow-hidden shadow-[0_0_30px_-10px_rgba(34,197,94,0.2)]">
                <div className="absolute inset-0 bg-green-500/5 animate-pulse"></div>
                <div className="absolute top-0 right-0 p-4 opacity-20">
                    <Network className="w-24 h-24 text-green-500" />
                </div>
                <div className="relative z-10 space-y-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center border border-green-500/20">
                        <Shield className="w-6 h-6 text-green-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Spectra Layer 2</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                        Zero-Knowledge circuits verify the transaction validity without revealing the sender or receiver.
                    </p>
                </div>
            </div>

            {/* Node 3: Solana */}
            <div className="group bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Server className="w-24 h-24 text-white" />
                </div>
                <div className="relative z-10 space-y-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/20">
                        <Layers className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Solana Mainnet</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        The final settlement is recorded on-chain as a cryptographic proof, unrelated to your wallet address.
                    </p>
                </div>
            </div>
        </div>

        {/* Technical Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-white/10 pt-12">
            {[
                { label: "Encryption", value: "ZK-SNARKs" },
                { label: "Latency", value: "< 400ms" },
                { label: "Validators", value: "Decentralized" },
                { label: "Network", value: "Solana" }
            ].map((stat, i) => (
                <div key={i} className="text-center space-y-1">
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">{stat.label}</p>
                    <p className="text-xl md:text-2xl font-bold text-white">{stat.value}</p>
                </div>
            ))}
        </div>

      </div>
    </section>
  );
};

export default InfrastructureSection;
